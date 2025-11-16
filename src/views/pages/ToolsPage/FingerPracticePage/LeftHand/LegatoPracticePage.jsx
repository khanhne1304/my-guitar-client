import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../../components/homeItem/Header/Header";
import useLegatoPracticeViewModel from "../../../../../viewmodels/LegatoPracticeViewModel";
import TabDisplay from "./components/TabDisplay";
import MetronomeControls from "./components/MetronomeControls";
import ChunkSelector from "./components/ChunkSelector";
import PracticeControls from "./components/PracticeControls";
import ResultsModal from "./components/ResultsModal";
import styles from "./LegatoPracticePage.module.css";

export default function LegatoPracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const lesson = location.state?.lesson;
  
  const [showResults, setShowResults] = useState(false);
  
  const {
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
    start,
    stop,
    analyzePerformance
  } = useLegatoPracticeViewModel(lesson);
  
  useEffect(() => {
    if (!lesson) {
      navigate("/tools/finger-practice/left/legato");
    }
  }, [lesson, navigate]);
  
  if (!lesson) {
    return null;
  }
  
  const handleStopAndAnalyze = async () => {
    await stop();
    await analyzePerformance();
    setShowResults(true);
  };
  
  const handleCloseResults = () => {
    setShowResults(false);
  };
  
  return (
    <>
      <Header />
      <main className={styles.practicePage}>
        <div className={styles.container}>
          <button 
            onClick={() => navigate("/tools/finger-practice/left/legato")} 
            className={styles.backButton}
          >
            ← Quay lại
          </button>
          
          <div className={styles.header}>
            <h1 className={styles.title}>{lesson.title}</h1>
            <p className={styles.description}>{lesson.description}</p>
          </div>
          
          {/* Tab Selector */}
          <div className={styles.tabSelector}>
            <button
              className={`${styles.tabButton} ${currentTab === "tab" ? styles.active : ""}`}
              onClick={() => setCurrentTab("tab")}
            >
              Tab Score
            </button>
            <button
              className={`${styles.tabButton} ${currentTab === "audio" ? styles.active : ""}`}
              onClick={() => setCurrentTab("audio")}
            >
              Audio Demo
            </button>
            <button
              className={`${styles.tabButton} ${currentTab === "video" ? styles.active : ""}`}
              onClick={() => setCurrentTab("video")}
            >
              Video Demo
            </button>
          </div>
          
          {/* Content Area */}
          <div className={styles.contentArea}>
            {currentTab === "tab" && (
              <TabDisplay 
                tab={lesson.tab} 
                selectedChunk={selectedChunk}
                isRunning={isRunning}
              />
            )}
            {currentTab === "audio" && (
              <div className={styles.demoArea}>
                <p>Audio demo sẽ được phát tại đây</p>
                <audio controls>
                  <source src={`/audio/${lesson.id}.mp3`} type="audio/mpeg" />
                  Trình duyệt không hỗ trợ audio.
                </audio>
              </div>
            )}
            {currentTab === "video" && (
              <div className={styles.demoArea}>
                <p>Video demo sẽ được phát tại đây</p>
                <video controls width="100%" style={{ maxWidth: "800px" }}>
                  <source src={`/video/${lesson.id}.mp4`} type="video/mp4" />
                  Trình duyệt không hỗ trợ video.
                </video>
              </div>
            )}
          </div>
          
          {/* Chunk Selector */}
          <ChunkSelector
            chunks={lesson.tab?.chunks || []}
            selectedChunk={selectedChunk}
            onSelectChunk={setSelectedChunk}
          />
          
          {/* Metronome Controls */}
          <MetronomeControls
            bpm={bpm}
            setBpm={setBpm}
            initialBpm={initialBpm}
            autoBpmEnabled={autoBpmEnabled}
            setAutoBpmEnabled={setAutoBpmEnabled}
            metronomeEnabled={metronomeEnabled}
            setMetronomeEnabled={setMetronomeEnabled}
            metronomeVolume={metronomeVolume}
            setMetronomeVolume={setMetronomeVolume}
          />
          
          {/* Practice Controls */}
          <PracticeControls
            isRunning={isRunning}
            onStart={start}
            onStop={handleStopAndAnalyze}
            scores={scores}
            isAnalyzing={isAnalyzing}
          />
        </div>
        
        {/* Results Modal */}
        {showResults && (
          <ResultsModal
            scores={scores}
            lesson={lesson}
            onClose={handleCloseResults}
          />
        )}
      </main>
    </>
  );
}

