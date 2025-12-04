import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * ViewModel cho luyện tập Legato
 * - Phát hiện các nốt legato (hammer-on, pull-off) qua microphone
 * - Chấm điểm: tốc độ, độ đều, độ rõ
 * - Tích hợp metronome với auto BPM increase
 */
export default function useLegatoPracticeViewModel(lesson) {
  const { user } = useAuth();
  
  // Practice state
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpm] = useState(lesson?.targetBpm || 80);
  const [initialBpm] = useState(lesson?.targetBpm || 80);
  const [autoBpmEnabled, setAutoBpmEnabled] = useState(true);
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [currentTab, setCurrentTab] = useState("tab"); // "tab", "audio", "video"
  const [practiceStartTime, setPracticeStartTime] = useState(null);
  
  // Metronome state
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [metronomeVolume, setMetronomeVolume] = useState(0.3);
  
  // Scoring state
  const [scores, setScores] = useState({
    accuracy: 0,
    timingScore: 0,
    clarityScore: 0,
    speedScore: 0,
    consistency: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState([]);
  
  // Audio refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const rafIdRef = useRef(null);
  
  // Metronome refs
  const metronomeCtxRef = useRef(null);
  const metronomeNextTimeRef = useRef(0);
  const metronomeBeatCountRef = useRef(0);
  const metronomeTimerRef = useRef(null);
  
  // Detection refs
  const noteOnsetsRef = useRef([]); // [{time, rms, frequency}]
  const expectedNotesRef = useRef([]);
  const startTimeRef = useRef(0);
  const lastDetectedNoteTimeRef = useRef(0);
  
  const lookahead = 25;
  const scheduleAheadTime = 0.1;
  
  // Metronome scheduler
  const scheduleMetronomeNote = (beatNumber, time) => {
    if (!metronomeCtxRef.current || !metronomeEnabled) return;
    
    const osc = metronomeCtxRef.current.createOscillator();
    const envelope = metronomeCtxRef.current.createGain();
    
    osc.type = "sine";
    osc.frequency.value = beatNumber % 4 === 0 ? 800 : 500;
    
    envelope.gain.setValueAtTime(0.001, time);
    envelope.gain.exponentialRampToValueAtTime(metronomeVolume, time + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.connect(envelope);
    envelope.connect(metronomeCtxRef.current.destination);
    
    osc.start(time);
    osc.stop(time + 0.1);
  };
  
  const metronomeNextNote = () => {
    const secondsPerBeat = 60.0 / bpm;
    metronomeNextTimeRef.current += secondsPerBeat;
    metronomeBeatCountRef.current++;
  };
  
  const metronomeScheduler = () => {
    if (!metronomeCtxRef.current) return;
    
    while (
      metronomeNextTimeRef.current <
      metronomeCtxRef.current.currentTime + scheduleAheadTime
    ) {
      scheduleMetronomeNote(metronomeBeatCountRef.current, metronomeNextTimeRef.current);
      metronomeNextNote();
    }
    metronomeTimerRef.current = setTimeout(metronomeScheduler, lookahead);
  };
  
  const startMetronome = useCallback(() => {
    if (!metronomeEnabled) return;
    
    metronomeCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    metronomeNextTimeRef.current = metronomeCtxRef.current.currentTime + 0.05;
    metronomeBeatCountRef.current = 0;
    metronomeScheduler();
  }, [metronomeEnabled, bpm, metronomeVolume]);
  
  const stopMetronome = useCallback(() => {
    if (metronomeTimerRef.current) {
      clearTimeout(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
    }
    if (metronomeCtxRef.current) {
      metronomeCtxRef.current.close();
      metronomeCtxRef.current = null;
    }
  }, []);
  
  // Audio detection loop
  const detectLoop = useCallback(() => {
    if (!analyserRef.current || !isRunning) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate RMS for energy detection
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = dataArray[i] / 255.0;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / bufferLength);
    
    // Threshold for note detection
    const threshold = 0.15;
    const currentTime = audioContextRef.current.currentTime;
    
    if (rms > threshold) {
      const timeSinceLastNote = currentTime - lastDetectedNoteTimeRef.current;
      
      // Minimum time between notes (prevent duplicate detections)
      if (timeSinceLastNote > 0.1) {
        noteOnsetsRef.current.push({
          time: currentTime - startTimeRef.current,
          rms: rms,
          timestamp: currentTime
        });
        lastDetectedNoteTimeRef.current = currentTime;
      }
    }
    
    rafIdRef.current = requestAnimationFrame(detectLoop);
  }, [isRunning]);
  
  // Start practice
  const start = useCallback(async () => {
    if (isRunning) return;
    
    try {
      // Reset state
      noteOnsetsRef.current = [];
      setScores({
        accuracy: 0,
        timingScore: 0,
        clarityScore: 0,
        speedScore: 0,
        consistency: 0
      });
      
      // Get microphone access
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = media;
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const source = ctx.createMediaStreamSource(media);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      startTimeRef.current = ctx.currentTime;
      lastDetectedNoteTimeRef.current = 0;
      setPracticeStartTime(Date.now());
      
      setIsRunning(true);
      
      // Start metronome
      if (metronomeEnabled) {
        startMetronome();
      }
      
      // Start detection loop
      rafIdRef.current = requestAnimationFrame(detectLoop);
    } catch (error) {
      console.error("Không thể truy cập microphone:", error);
      alert("Vui lòng cho phép truy cập microphone để sử dụng tính năng này.");
    }
  }, [isRunning, metronomeEnabled, startMetronome, detectLoop]);
  
  // Stop practice
  const stop = useCallback(async () => {
    setIsRunning(false);
    
    // Stop detection
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // Stop metronome
    stopMetronome();
    
    // Stop audio stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
  }, [stopMetronome]);
  
  // Analyze performance
  const analyzePerformance = useCallback(async () => {
    const detectedNotes = noteOnsetsRef.current;
    if (detectedNotes.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      // Calculate expected notes based on lesson tab
      const expectedNotes = lesson?.tab?.notes || [];
      const chunk = selectedChunk || { start: 0, end: expectedNotes.length - 1 };
      const relevantNotes = expectedNotes.slice(chunk.start, chunk.end + 1);
      
      // Prepare data for backend analysis
      const analysisData = {
        detectedNotes: detectedNotes,
        expectedNotes: relevantNotes,
        bpm: bpm,
        lessonId: lesson?.id
      };
      
      // Call backend API for scoring
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/legato/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(analysisData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setScores(result);
        
        // Auto increase BPM if accuracy > 90% and auto BPM enabled
        if (autoBpmEnabled && result.accuracy > 0.9 && bpm < 200) {
          setBpm(prev => prev + 5);
        }
        
        // Calculate practice duration
        const practiceDuration = practiceStartTime 
          ? Math.round((Date.now() - practiceStartTime) / 1000)
          : 0;
        
        // Save to server
        await savePracticeToServer({
          lessonId: lesson?.id,
          lessonTitle: lesson?.title,
          level: getLessonLevel(lesson?.id),
          scores: result,
          bpm: bpm,
          targetBpm: lesson?.targetBpm || initialBpm,
          practiceDuration: practiceDuration,
          notesDetected: detectedNotes.length,
          notesExpected: relevantNotes.length,
          chunkUsed: selectedChunk
        });
        
        // Save to local history
        setPracticeHistory(prev => [...prev, {
          timestamp: new Date().toISOString(),
          scores: result,
          bpm: bpm,
          lessonId: lesson?.id
        }]);
      } else {
        // Fallback: calculate scores locally
        const localScores = calculateLocalScores(detectedNotes, relevantNotes, bpm);
        setScores(localScores);
      }
    } catch (error) {
      console.error("Error analyzing performance:", error);
      // Fallback: calculate scores locally
      const expectedNotes = lesson?.tab?.notes || [];
      const chunk = selectedChunk || { start: 0, end: expectedNotes.length - 1 };
      const relevantNotes = expectedNotes.slice(chunk.start, chunk.end + 1);
      const localScores = calculateLocalScores(noteOnsetsRef.current, relevantNotes, bpm);
      setScores(localScores);
    } finally {
      setIsAnalyzing(false);
    }
  }, [lesson, selectedChunk, bpm, autoBpmEnabled, user]);
  
  // Local score calculation (fallback)
  const calculateLocalScores = (detected, expected, currentBpm) => {
    if (detected.length === 0 || expected.length === 0) {
      return {
        accuracy: 0,
        timingScore: 0,
        clarityScore: 0,
        speedScore: 0,
        consistency: 0
      };
    }
    
    // Timing score: compare detected note times with expected
    const beatDuration = 60 / currentBpm;
    let timingMatches = 0;
    const timingErrors = [];
    
    expected.forEach((expectedNote, idx) => {
      const expectedTime = expectedNote.time * beatDuration;
      const detectedNote = detected[idx];
      
      if (detectedNote) {
        const error = Math.abs(detectedNote.time - expectedTime);
        timingErrors.push(error);
        if (error < beatDuration * 0.2) { // Within 20% of beat
          timingMatches++;
        }
      }
    });
    
    const timingScore = expected.length > 0 ? timingMatches / expected.length : 0;
    
    // Clarity score: based on RMS values (higher = clearer)
    const avgRms = detected.reduce((sum, n) => sum + n.rms, 0) / detected.length;
    const clarityScore = Math.min(1, avgRms / 0.3); // Normalize to 0-1
    
    // Speed score: compare detected speed with expected
    const expectedDuration = expected[expected.length - 1].time * beatDuration;
    const detectedDuration = detected.length > 0 
      ? detected[detected.length - 1].time - detected[0].time
      : 1;
    const speedRatio = expectedDuration / detectedDuration;
    const speedScore = Math.min(1, speedRatio);
    
    // Consistency: variance in timing intervals
    const intervals = [];
    for (let i = 1; i < detected.length; i++) {
      intervals.push(detected[i].time - detected[i - 1].time);
    }
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const consistency = Math.max(0, 1 - (variance / (avgInterval * avgInterval)));
    
    // Overall accuracy
    const accuracy = 0.4 * timingScore + 0.3 * clarityScore + 0.3 * speedScore;
    
    return {
      accuracy,
      timingScore,
      clarityScore,
      speedScore,
      consistency
    };
  };
  
  // Helper function to determine lesson level
  const getLessonLevel = (lessonId) => {
    if (!lessonId) return 'beginner';
    if (lessonId.includes('ho-single') || lessonId.includes('po-single')) return 'beginner';
    if (lessonId.includes('ho-po-combo')) return 'intermediate';
    return 'advanced';
  };
  
  // Save practice to server
  const savePracticeToServer = async (practiceData) => {
    if (!user?.token) {
      console.log('User not authenticated, skipping server save');
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/legato/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(practiceData)
      });
      
      if (!response.ok) {
        console.error('Failed to save practice history');
      }
    } catch (error) {
      console.error('Error saving practice history:', error);
    }
  };
  
  // Load practice history from server
  const loadPracticeHistory = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/legato/history?limit=20`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.practices) {
          // Convert server data to local format
          const history = data.data.practices.map(p => ({
            timestamp: p.createdAt,
            scores: p.scores,
            bpm: p.bpm,
            lessonId: p.lessonId,
            lessonTitle: p.lessonTitle
          }));
          setPracticeHistory(history);
        }
      }
    } catch (error) {
      console.error('Error loading practice history:', error);
    }
  }, [user]);
  
  // Load history on mount
  useEffect(() => {
    if (user?.token) {
      loadPracticeHistory();
    }
  }, [user, loadPracticeHistory]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  // Update metronome when BPM changes
  useEffect(() => {
    if (isRunning && metronomeEnabled) {
      stopMetronome();
      startMetronome();
    }
  }, [bpm, isRunning, metronomeEnabled, stopMetronome, startMetronome]);
  
  return {
    // State
    isRunning,
    bpm,
    setBpm,
    initialBpm,
    autoBpmEnabled,
    setAutoBpmEnabled,
    selectedChunk,
    setSelectedChunk,
    currentTab,
    setCurrentTab,
    metronomeEnabled,
    setMetronomeEnabled,
    metronomeVolume,
    setMetronomeVolume,
    scores,
    isAnalyzing,
    practiceHistory,
    
    // Actions
    start,
    stop,
    analyzePerformance
  };
}

