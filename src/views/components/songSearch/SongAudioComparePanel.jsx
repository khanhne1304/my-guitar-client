import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { transposeChord } from '../../../utils/transposeChord';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { compareSongService } from '../../../services/compareSongService';
import { referenceSongService } from '../../../services/referenceSongService';
import { chordPracticeService } from '../../../services/chordPracticeService';
import { validateAudioFile } from '../../../utils/audioFileValidation';
import styles from './SongAudioComparePanel.module.css';

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return Number(value).toFixed(digits);
};

function practiceLink(suggestion) {
  if (!suggestion?.practicePath) return null;
  const params = new URLSearchParams();
  if (suggestion.practiceQuery) {
    Object.entries(suggestion.practiceQuery).forEach(([k, v]) => {
      if (v != null) params.set(k, String(v));
    });
  }
  const q = params.toString();
  return q ? `${suggestion.practicePath}?${q}` : suggestion.practicePath;
}

function roundBpm(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function ReferenceChordColumn({ comparison, transpose = 0 }) {
  const displaySeq = useMemo(() => {
    const original = comparison?.referenceSequenceOriginal;
    const analyzed = Number(comparison?.analyzedTranspose) || 0;
    const t = Number(transpose) || 0;

    if (original?.length > 0) {
      if (t === 0) return original;
      return original.map((ch) => transposeChord(ch, t));
    }

    const ref = comparison?.referenceSequence || [];
    if (t === analyzed) return ref;
    if (analyzed !== 0 && ref.length > 0) {
      return ref.map((ch) => transposeChord(ch, t - analyzed));
    }
    if (t !== 0) return ref.map((ch) => transposeChord(ch, t));
    return ref;
  }, [comparison, transpose]);

  const needsReanalyze =
    chordResultNeedsReanalyze(comparison, transpose);

  return (
    <div className={styles.chordSeqCol}>
      <h5>Hợp âm chuẩn (HopAmChuan)</h5>
      {transpose !== 0 && (
        <p className={styles.chordHint}>
          Transpose {transpose > 0 ? '+' : ''}
          {transpose} so với tone gốc HopAmChuan
        </p>
      )}
      <p className={styles.chordSeq}>{displaySeq.join(' → ') || '—'}</p>
      {needsReanalyze && (
        <p className={styles.chordHint}>
          Đổi transpose — bấm lại «Phân tích & so sánh hợp âm» để cập nhật % khớp.
        </p>
      )}
    </div>
  );
}

function chordResultNeedsReanalyze(comparison, transpose) {
  if (!comparison) return false;
  const analyzed = Number(comparison.analyzedTranspose) || 0;
  return analyzed !== (Number(transpose) || 0);
}

/** Cột hợp âm detect: chỉ hiện chuỗi gốc từ audio + dòng «Đã dịch … so với bản gốc» (đậm). */
function DetectedChordColumn({ comparison }) {
  const raw = comparison?.predictedSequenceRaw || [];
  const aligned = comparison?.predictedSequence || [];
  const rawText = raw.join(' → ');
  const alignedText = aligned.join(' → ');
  const showTransposedBlock =
    comparison?.compareNote && raw.length > 0 && rawText !== alignedText;

  if (showTransposedBlock) {
    return (
      <div className={styles.chordSeqCol}>
        <h5>Nhận diện từ audio</h5>
        <p className={styles.transposeNote}>{comparison.compareNote}</p>
        <p className={styles.chordSeq}>{rawText}</p>
      </div>
    );
  }

  const display = aligned.length ? alignedText : rawText;
  return (
    <div className={styles.chordSeqCol}>
      <h5>Nhận diện từ audio</h5>
      <p className={styles.chordSeq}>{display || '—'}</p>
    </div>
  );
}

function isCleanOverviewText(text) {
  const s = String(text || '').trim();
  if (!s || s.length < 10) return false;
  if (/^```\s*json/i.test(s)) return false;
  if (/^\{\s*"/.test(s)) return false;
  if (/^"summary"\s*:/.test(s)) return false;
  return true;
}

function AdviceDetailBlock({ title, items, ordered }) {
  if (!items?.length) return null;
  const ListTag = ordered ? 'ol' : 'ul';
  const listClass = ordered ? styles.aiAdviceOrderedList : styles.aiAdviceList;
  return (
    <div className={styles.aiAdviceGroup}>
      <strong className={styles.aiAdviceGroupTitle}>{title}</strong>
      <ListTag className={listClass}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}

const LEVEL_LABELS = {
  Beginner: 'Cơ bản',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao',
};

function LevelBadge({ level }) {
  if (!level) return null;
  const label = LEVEL_LABELS[level] || level;
  const levelClass =
    level === 'Advanced'
      ? styles.levelAdvanced
      : level === 'Intermediate'
        ? styles.levelIntermediate
        : styles.levelBeginner;
  return (
    <span className={`${styles.levelBadge} ${levelClass}`}>
      Trình độ: {label}
    </span>
  );
}

function MainProblemsBlock({ problems }) {
  if (!problems?.length) return null;
  return (
    <div className={styles.aiAdviceGroup}>
      <strong className={styles.aiAdviceGroupTitle}>Cần cải thiện</strong>
      <ul className={styles.problemList}>
        {problems.map((p) => (
          <li key={p.problem} className={styles.problemItem}>
            <p className={styles.problemTitle}>{p.problem}</p>
            {p.cause && <p className={styles.problemDetail}><em>Nguyên nhân:</em> {p.cause}</p>}
            {p.impact && <p className={styles.problemDetail}><em>Ảnh hưởng:</em> {p.impact}</p>}
            {p.solution && <p className={styles.problemSolution}><em>Cách luyện:</em> {p.solution}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PracticePlanBlock({ plan }) {
  if (!plan?.length) return null;
  return (
    <div className={styles.aiAdviceGroup}>
      <strong className={styles.aiAdviceGroupTitle}>Kế hoạch luyện tập</strong>
      <ol className={styles.practicePlanList}>
        {plan.map((item) => (
          <li key={`${item.title}-${item.exercise}`} className={styles.practicePlanItem}>
            <p className={styles.practicePlanTitle}>
              {item.title}
              {item.durationMinutes ? (
                <span className={styles.practicePlanDuration}> · {item.durationMinutes} phút</span>
              ) : null}
            </p>
            {item.reason && <p className={styles.problemDetail}>{item.reason}</p>}
            {item.exercise && <p className={styles.problemSolution}>{item.exercise}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function collectImprovementExercises(tempoComparison, chordComparison) {
  const items = [];
  const seen = new Set();

  const add = (label, path, practiceQuery) => {
    const href = practiceLink({ practicePath: path, practiceQuery });
    if (!href || seen.has(href)) return;
    seen.add(href);
    items.push({ label, href });
  };

  for (const s of tempoComparison?.suggestions || []) {
    if (!s.practicePath) continue;
    const bpm = s.practiceQuery?.bpm;
    let label = 'Luyện tập theo nhịp';
    if (String(s.practicePath).includes('rhythm') && bpm) {
      label = `Luyện tập theo nhịp (${Math.round(bpm)} BPM)`;
    }
    add(label, s.practicePath, s.practiceQuery);
  }

  const chordAcc = chordComparison?.accuracyPercent;
  if (chordAcc != null && chordAcc < 85) {
    add('Luyện tập ghi nhớ hợp âm', '/tools/chord-practice', null);
  }

  if (items.length === 0 && tempoComparison?.referenceBpm) {
    add('Luyện tập theo nhịp', '/tools/chord-practice/rhythm', {
      bpm: roundBpm(tempoComparison.referenceBpm),
    });
  }

  return items;
}

function ImprovementSuggestionsSection({
  tempoComparison,
  chordComparison,
  referenceSong,
  chordRecognition,
}) {
  const tc = tempoComparison;
  const refRounded = roundBpm(tc?.referenceBpm);
  const yourRounded = roundBpm(tc?.detectedBpm);
  const exercises = collectImprovementExercises(tc, chordComparison);

  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const adviceKey = useMemo(() => {
    if (!chordComparison) return '';
    return [
      chordComparison.matched,
      chordComparison.referenceLen,
      chordComparison.accuracyPercent,
      tc?.detectedBpm,
      tc?.referenceBpm,
      referenceSong?.title,
    ].join('|');
  }, [chordComparison, tc?.detectedBpm, tc?.referenceBpm, referenceSong?.title]);

  useEffect(() => {
    if (!adviceKey || !chordComparison) return undefined;

    let cancelled = false;
    setAiAdvice(null);
    setAiError('');
    setAiLoading(true);

    chordPracticeService
      .getPracticeAdvice({
        referenceSong,
        comparison: chordComparison,
        tempoComparison: tc,
        chordRecognition,
      })
      .then((data) => {
        if (!cancelled) setAiAdvice(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setAiError(err?.message || 'Không tải được gợi ý AI.');
        }
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adviceKey, chordComparison, referenceSong, chordRecognition, tc]);

  const deviationPct =
    tc?.deviationPercent != null ? Math.round(tc.deviationPercent) : null;
  const deviationClass =
    tc?.rating === 'good'
      ? styles.ok
      : tc?.rating === 'high'
        ? styles.bad
        : tc?.rating === 'moderate' || tc?.rating === 'mild'
          ? styles.warn
          : '';

  const showTempo = refRounded != null || yourRounded != null || deviationPct != null;
  const hasAiBlock = aiLoading || aiAdvice?.available || aiError || aiAdvice?.message;
  if (!showTempo && exercises.length === 0 && !hasAiBlock) return null;

  return (
    <div className={styles.improvementFrame}>
      <h5 className={styles.improvementTitle}>Gợi ý cải thiện</h5>
      <div className={styles.improvementGrid}>
        <div className={styles.improvementTempoCol}>
          <div className={styles.improvementRow}>
            <span className={styles.improvementLabel}>Tempo gốc</span>
            <strong className={styles.improvementValue}>
              {refRounded != null ? `${refRounded} BPM` : '—'}
            </strong>
          </div>
          <div className={styles.improvementRow}>
            <span className={styles.improvementLabel}>Tempo của bạn</span>
            <strong className={styles.improvementValue}>
              {yourRounded != null ? `${yourRounded} BPM` : '—'}
            </strong>
          </div>
          {deviationPct != null && (
            <div className={styles.improvementRow}>
              <span className={styles.improvementLabel}>Độ lệch so với bài gốc</span>
              <strong className={`${styles.improvementValue} ${deviationClass}`}>
                {deviationPct}%
              </strong>
            </div>
          )}
          {tc?.beatDetectionError && (
            <p className={styles.chordHint}>
              Không đo được nhịp từ audio: {tc.beatDetectionError}
            </p>
          )}
        </div>
        <div className={styles.improvementExerciseCol}>
          <span className={styles.improvementColTitle}>Bài tập cải thiện</span>
          {exercises.length > 0 ? (
            <ul className={styles.improvementExerciseList}>
              {exercises.map((ex) => (
                <li key={ex.href}>
                  <Link to={ex.href} className={styles.improvementExerciseLink}>
                    {ex.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.chordHint}>Tiếp tục luyện tập để giữ nhịp ổn định.</p>
          )}
        </div>
      </div>

      <div className={styles.aiAdviceBlock}>
        <span className={styles.improvementColTitle}>Huấn luyện viên AI</span>
        {aiLoading && (
          <p className={styles.chordHint}>Đang đánh giá buổi luyện tập của bạn…</p>
        )}
        {!aiLoading && aiError && (
          <p className={styles.chordHint}>{aiError}</p>
        )}
        {!aiLoading && aiAdvice && !aiAdvice.available && (
          <p className={styles.chordHint}>
            {aiAdvice.message || 'Chưa tạo được đánh giá — thử phân tích lại.'}
          </p>
        )}
        {!aiLoading && aiAdvice?.available && (
          <>
            {aiAdvice.aiWarning && (
              <p className={styles.chordHint}>{aiAdvice.aiWarning}</p>
            )}
            {aiAdvice.source === 'local' && !aiAdvice.aiWarning && (
              <p className={styles.chordHint}>
                Đánh giá dựa trên buổi luyện của bạn — vẫn đầy đủ gợi ý luyện tập.
              </p>
            )}
            <LevelBadge level={aiAdvice.level} />
            {isCleanOverviewText(aiAdvice.overview) && (
              <p className={styles.aiAdviceSummary}>{aiAdvice.overview}</p>
            )}
            <AdviceDetailBlock title="Điểm mạnh" items={aiAdvice.strengths} />
            <MainProblemsBlock problems={aiAdvice.mainProblems} />
            <PracticePlanBlock plan={aiAdvice.practicePlan} />
            {aiAdvice.nextGoal && (
              <div className={styles.aiAdviceGroup}>
                <strong className={styles.aiAdviceGroupTitle}>Mục tiêu lần sau</strong>
                <p className={styles.nextGoalText}>{aiAdvice.nextGoal}</p>
              </div>
            )}
            {aiAdvice.encouragement && (
              <p className={styles.encouragementText}>{aiAdvice.encouragement}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function findMatchingReference(songs, title, artist) {
  const t = String(title || '').toLowerCase().trim();
  const a = String(artist || '').toLowerCase().trim();
  if (!t) return null;

  return (
    songs.find((s) => {
      const st = String(s.title || '').toLowerCase();
      const sa = String(s.artist || '').toLowerCase();
      const titleMatch = st.includes(t) || t.includes(st);
      const artistMatch = !a || !sa || sa.includes(a) || a.includes(sa.split(',')[0].trim());
      return titleMatch && artistMatch;
    }) || null
  );
}

function useAudioFile() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const selectFile = useCallback((incoming) => {
    setError('');
    if (!incoming) {
      setFile(null);
      if (url) URL.revokeObjectURL(url);
      setUrl('');
      return;
    }
    const err = validateAudioFile(incoming);
    if (err) {
      setError(err);
      return;
    }
    if (url) URL.revokeObjectURL(url);
    setFile(incoming);
    setUrl(URL.createObjectURL(incoming));
  }, [url]);

  const reset = useCallback(() => {
    selectFile(null);
  }, [selectFile]);

  return { file, url, error, setError, selectFile, reset };
}

export default function SongAudioComparePanel({
  title = '',
  artist = '',
  directMode = false,
  chordPracticeMode = false,
  hopamSong = null,
  referenceBpm: referenceBpmProp = null,
  transpose = 0,
}) {
  const referenceBpm = referenceBpmProp ?? hopamSong?.tempo ?? null;
  const { user } = useAuth();
  const performance = useAudioFile();
  const reference = useAudioFile();

  const [matchedRef, setMatchedRef] = useState(null);
  const [referenceSongs, setReferenceSongs] = useState([]);
  const [selectedReferenceId, setSelectedReferenceId] = useState('');
  const [showManualRefUpload, setShowManualRefUpload] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compareError, setCompareError] = useState('');
  const [comparison, setComparison] = useState(null);
  const [chordResult, setChordResult] = useState(null);
  const [chordError, setChordError] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDraggingPerf, setIsDraggingPerf] = useState(false);
  const [isDraggingRef, setIsDraggingRef] = useState(false);
  const perfInputRef = useRef(null);
  const refInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (directMode) return undefined;
    let cancelled = false;
    async function load() {
      setLoadingRefs(true);
      setMatchedRef(null);
      try {
        const res = await referenceSongService.listPublic({ limit: 200 });
        const songs = res?.songs || res?.data?.songs || [];
        if (!cancelled) {
          setReferenceSongs(songs);
          setMatchedRef(findMatchingReference(songs, title, artist));
        }
      } catch {
        if (!cancelled) {
          setReferenceSongs([]);
          setMatchedRef(null);
        }
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [title, artist, directMode]);

  useEffect(() => {
    performance.reset();
    reference.reset();
    setComparison(null);
    setChordResult(null);
    setChordError('');
    setCompareError('');
    setProgress(0);
    setSelectedReferenceId('');
    setShowManualRefUpload(false);
    if (perfInputRef.current) perfInputRef.current.value = '';
    if (refInputRef.current) refInputRef.current.value = '';
  }, [title, artist, directMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedReferenceSong = useMemo(
    () =>
      referenceSongs.find(
        (s) => (s._id || s.id) === selectedReferenceId,
      ) || null,
    [referenceSongs, selectedReferenceId],
  );

  const systemReferenceId = matchedRef?._id || matchedRef?.id || selectedReferenceId || null;

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, []);

  const canCompare = useMemo(() => {
    if (!performance.file) return false;
    if (systemReferenceId) return true;
    return Boolean(reference.file);
  }, [performance.file, reference.file, systemReferenceId]);

  const showReferenceSelector = !matchedRef;
  const showReferenceFileUpload = !matchedRef && showManualRefUpload;

  const startRecording = async () => {
    if (isRecording || !navigator?.mediaDevices?.getUserMedia) {
      performance.setError('Trình duyệt không hỗ trợ ghi âm trực tiếp.');
      return;
    }
    try {
      performance.setError('');
      setComparison(null);
      recordedChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const f = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type });
        performance.selectFile(f);
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((p) => p + 1);
      }, 1000);
    } catch {
      performance.setError('Không thể truy cập micro.');
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const handleChordAnalyze = async () => {
    if (!user || !performance.file || isComparing) return;

    const hopamUrl = hopamSong?.url;
    if (!hopamUrl) {
      setChordError('Chọn bài hát từ Hợp âm chuẩn trước khi phân tích.');
      return;
    }

    setChordError('');
    setCompareError('');
    setIsComparing(true);
    setProgress(15);
    setChordResult(null);
    setComparison(null);

    try {
      setProgress(40);
      const data = await chordPracticeService.analyzeAndCompare({
        file: performance.file,
        hopamUrl,
        referenceBpm: referenceBpm ?? undefined,
        referenceTranspose: transpose,
      });
      setProgress(100);
      setChordResult(data);
    } catch (err) {
      setChordError(
        err?.response?.data?.message || err?.message || 'Không thể phân tích hợp âm.',
      );
      setProgress(0);
    } finally {
      setIsComparing(false);
    }
  };

  const handleCompare = async () => {
    if (!user || !canCompare || isComparing) return;
    setCompareError('');
    setIsComparing(true);
    setProgress(10);
    setComparison(null);

    try {
      let response;
      if (systemReferenceId) {
        setProgress(30);
        response = await compareSongService.compareAudio({
          file: performance.file,
          referenceSongId: systemReferenceId,
        });
      } else if (reference.file) {
        setProgress(30);
        response = await compareSongService.compareTwoSongs({
          file1: performance.file,
          file2: reference.file,
        });
      } else {
        throw new Error('Chọn bài gốc trên hệ thống hoặc tải file tham chiếu.');
      }

      const result = response?.data || response;
      if (!result?.comparison) {
        throw new Error('Máy chủ không trả về kết quả so sánh.');
      }
      setProgress(100);
      setComparison(result);
    } catch (err) {
      setCompareError(
        err?.response?.data?.message || err?.message || 'Không thể so sánh âm thanh.',
      );
      setProgress(0);
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    performance.reset();
    reference.reset();
    setComparison(null);
    setChordResult(null);
    setChordError('');
    setCompareError('');
    setProgress(0);
    setSelectedReferenceId('');
    setShowManualRefUpload(false);
    if (isRecording) stopRecording();
    if (perfInputRef.current) perfInputRef.current.value = '';
    if (refInputRef.current) refInputRef.current.value = '';
  };

  const handleSelectSystemReference = (id) => {
    setSelectedReferenceId(id);
    setShowManualRefUpload(false);
    reference.reset();
    if (refInputRef.current) refInputRef.current.value = '';
    setComparison(null);
    setCompareError('');
  };

  const handleEnableManualRefUpload = () => {
    setShowManualRefUpload(true);
    setSelectedReferenceId('');
    setComparison(null);
    setCompareError('');
  };

  if (!user) {
    return (
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>
          {directMode ? 'Luyện tập guitar trực tiếp' : 'So sánh âm thanh với bài gốc'}
        </h3>
        <p className={styles.authHint}>
          <Link to="/login">Đăng nhập</Link> để tải file hoặc thu âm
          {directMode ? '.' : ' và so sánh với bản gốc.'}
        </p>
      </section>
    );
  }

  if (directMode) {
    const canChordAnalyze = Boolean(performance.file && hopamSong?.url);

    return (
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Luyện tập guitar trực tiếp</h3>
        <p className={styles.panelSub}>
          {chordPracticeMode ? (
            <>
              Tải hoặc thu <strong>bản guitar của bạn</strong>, hệ thống nhận diện hợp âm và
              so sánh với bài{' '}
              <strong>{hopamSong?.title || 'đã chọn'}</strong>
              {hopamSong?.artist ? ` — ${hopamSong.artist}` : ''}.
            </>
          ) : (
            <>
              Tải hoặc thu <strong>bản guitar của bạn</strong> — không cần chọn hay tải bài
              gốc.
            </>
          )}
        </p>

        {chordPracticeMode && !hopamSong?.url && (
          <p className={styles.refMissing}>
            Thêm bài vào danh sách luyện tập phía trên để so sánh hợp âm.
          </p>
        )}

        <div className={styles.uploadBlock}>
          <label className={styles.uploadLabel}>Bản guitar của bạn</label>
          <div
            className={`${styles.dropzone} ${isDraggingPerf ? styles.dropzoneActive : ''}`}
            onClick={() => perfInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && perfInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPerf(false);
              performance.selectFile(e.dataTransfer.files?.[0] || null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPerf(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPerf(false);
            }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={perfInputRef}
              type="file"
              accept="audio/*"
              className={styles.hiddenInput}
              onChange={(e) => performance.selectFile(e.target.files?.[0] || null)}
            />
            <strong>Chọn hoặc kéo-thả file</strong>
            <span>MP3, WAV, WEBM, OGG, M4A • tối đa 200 MB</span>
            {performance.file && (
              <span className={styles.fileMeta}>{performance.file.name}</span>
            )}
          </div>
          <div className={styles.recordRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? 'Dừng thu' : 'Thu bằng micro'}
            </button>
            {isRecording && (
              <span className={styles.recordTime}>
                {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
              </span>
            )}
          </div>
          {performance.url && (
            <audio className={styles.audio} src={performance.url} controls preload="metadata" />
          )}
          {performance.error && <p className={styles.fieldError}>{performance.error}</p>}
        </div>

        {performance.file && (
          <p className={styles.directReady}>Đã sẵn sàng bản guitar của bạn.</p>
        )}

        {(chordError || compareError) && (
          <p className={styles.globalError}>{chordError || compareError}</p>
        )}

        <div className={styles.actions}>
          {chordPracticeMode && (
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!canChordAnalyze || isComparing}
              onClick={handleChordAnalyze}
            >
              {isComparing ? 'Đang phân tích…' : 'Phân tích & so sánh hợp âm'}
            </button>
          )}
          <button type="button" className={styles.ghostBtn} onClick={handleReset}>
            Làm mới
          </button>
        </div>

        {isComparing && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressInner} style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}%</span>
          </div>
        )}

        {chordResult?.comparison && (
          <div className={styles.results}>
            <h4 className={styles.resultsTitle}>So sánh hợp âm với Hợp âm chuẩn</h4>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span>Độ khớp chuỗi hợp âm</span>
                <strong className={styles.ok}>
                  {chordResult.comparison.accuracyPercent ?? 0}%
                </strong>
              </div>
              <div className={styles.metric}>
                <span>Khớp / tổng (tham chiếu)</span>
                <strong>
                  {chordResult.comparison.matched} / {chordResult.comparison.referenceLen}
                </strong>
              </div>
              <div className={styles.metric}>
                <span>Đoạn nhận diện</span>
                <strong>
                  {chordResult.chordRecognition?.metrics?.n_chord_segments ?? '—'}
                </strong>
              </div>
              <div className={styles.metric}>
                <span>Độ tin cậy TB</span>
                <strong>
                  {formatNumber(
                    (chordResult.chordRecognition?.metrics?.mean_chord_confidence ?? 0) * 100,
                    0,
                  )}
                  %
                </strong>
              </div>
            </div>

            <ImprovementSuggestionsSection
              tempoComparison={chordResult.tempoComparison}
              chordComparison={chordResult.comparison}
              referenceSong={chordResult.referenceSong}
              chordRecognition={chordResult.chordRecognition}
            />

            <div className={styles.chordCompareBlock}>
              <ReferenceChordColumn
                comparison={chordResult.comparison}
                transpose={transpose}
              />
              <DetectedChordColumn comparison={chordResult.comparison} />
            </div>

            {chordResult.chordRecognition?.predicted_chords?.length > 0 && (
              <div className={styles.chordTimeline}>
                <h5>Timeline nhận diện</h5>
                <ul className={styles.chordTimelineList}>
                  {chordResult.chordRecognition.predicted_chords.map((seg, idx) => (
                    <li key={idx} className={styles.chordTimelineItem}>
                      <span className={styles.chordTime}>
                        {formatNumber(seg.time, 1)}s –{' '}
                        {formatNumber(seg.time + (seg.duration || 0), 1)}s
                      </span>
                      <strong>{seg.predicted_chord}</strong>
                      <span className={styles.chordConf}>
                        {formatNumber((seg.confidence ?? 0) * 100, 0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>So sánh âm thanh với bài gốc</h3>
      <p className={styles.panelSub}>
        Tải bản thu của bạn (hoặc thu micro) để so sánh lệch nhịp, thiếu/thừa nốt với bài{' '}
        <strong>{title}</strong>
        {artist ? ` — ${artist}` : ''}.
      </p>

      <div className={styles.refStatus}>
        {loadingRefs ? (
          <span>Đang tìm bài gốc trong hệ thống…</span>
        ) : matchedRef ? (
          <span className={styles.refFound}>
            Đã khớp bài gốc: <strong>{matchedRef.title}</strong>
            {matchedRef.artist ? ` — ${matchedRef.artist}` : ''}
          </span>
        ) : (
          <span className={styles.refMissing}>
            Chưa có bài gốc trên hệ thống — tải thêm file nhạc gốc bên dưới.
          </span>
        )}
      </div>

      <div className={styles.uploadGrid}>
        <div className={styles.uploadBlock}>
          <label className={styles.uploadLabel}>
            Bản thu của bạn
          </label>
          <div
            className={`${styles.dropzone} ${isDraggingPerf ? styles.dropzoneActive : ''}`}
            onClick={() => perfInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && perfInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPerf(false);
              performance.selectFile(e.dataTransfer.files?.[0] || null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPerf(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPerf(false);
            }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={perfInputRef}
              type="file"
              accept="audio/*"
              className={styles.hiddenInput}
              onChange={(e) => performance.selectFile(e.target.files?.[0] || null)}
            />
            <strong>Chọn hoặc kéo-thả file</strong>
            <span>MP3, WAV, WEBM, OGG, M4A • tối đa 200 MB</span>
            {performance.file && (
              <span className={styles.fileMeta}>{performance.file.name}</span>
            )}
          </div>
          <div className={styles.recordRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? 'Dừng thu' : 'Thu bằng micro'}
            </button>
            {isRecording && (
              <span className={styles.recordTime}>
                {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
              </span>
            )}
          </div>
          {performance.url && (
            <audio className={styles.audio} src={performance.url} controls preload="metadata" />
          )}
          {performance.error && <p className={styles.fieldError}>{performance.error}</p>}
        </div>

        {showReferenceSelector && !showReferenceFileUpload && (
          <div className={styles.uploadBlock}>
            <label className={styles.uploadLabel} htmlFor="system-reference-select">
              Bài gốc trên hệ thống
            </label>
            {loadingRefs ? (
              <p className={styles.refLoading}>Đang tải danh sách bài gốc…</p>
            ) : (
              <select
                id="system-reference-select"
                className={styles.refSelect}
                value={selectedReferenceId}
                onChange={(e) => handleSelectSystemReference(e.target.value)}
                disabled={isComparing}
              >
                <option value="">— Chọn bài gốc để so sánh —</option>
                {referenceSongs.map((song) => (
                  <option key={song._id || song.id} value={song._id || song.id}>
                    {song.title}
                    {song.artist ? ` — ${song.artist}` : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedReferenceSong && (
              <p className={styles.refPicked}>
                Đã chọn: <strong>{selectedReferenceSong.title}</strong>
                {selectedReferenceSong.artist ? ` — ${selectedReferenceSong.artist}` : ''}
              </p>
            )}
            {!loadingRefs && referenceSongs.length === 0 && (
              <p className={styles.refEmpty}>
                Chưa có bài gốc trên hệ thống.{' '}
                <button type="button" className={styles.manualRefToggle} onClick={handleEnableManualRefUpload}>
                  Tải file tham chiếu
                </button>
              </p>
            )}
            {!showManualRefUpload && referenceSongs.length > 0 && (
              <button type="button" className={styles.manualRefToggle} onClick={handleEnableManualRefUpload}>
                Tải file bài gốc thủ công (tùy chọn)
              </button>
            )}
          </div>
        )}

        {showReferenceFileUpload && (
          <div className={styles.uploadBlock}>
            <div className={styles.manualRefHeader}>
              <label className={styles.uploadLabel}>File bài gốc (tùy chọn)</label>
              <button
                type="button"
                className={styles.manualRefBack}
                onClick={() => {
                  setShowManualRefUpload(false);
                  reference.reset();
                  if (refInputRef.current) refInputRef.current.value = '';
                }}
              >
                Chọn từ hệ thống
              </button>
            </div>
            <div
              className={`${styles.dropzone} ${isDraggingRef ? styles.dropzoneActive : ''}`}
              onClick={() => refInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && refInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingRef(false);
                reference.selectFile(e.dataTransfer.files?.[0] || null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingRef(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingRef(false);
              }}
              role="button"
              tabIndex={0}
            >
              <input
                ref={refInputRef}
                type="file"
                accept="audio/*"
                className={styles.hiddenInput}
                onChange={(e) => reference.selectFile(e.target.files?.[0] || null)}
              />
              <strong>Chọn file nhạc gốc</strong>
              <span>MP3, WAV, WEBM, OGG, M4A</span>
              {reference.file && (
                <span className={styles.fileMeta}>{reference.file.name}</span>
              )}
            </div>
            {reference.url && (
              <audio className={styles.audio} src={reference.url} controls preload="metadata" />
            )}
            {reference.error && <p className={styles.fieldError}>{reference.error}</p>}
          </div>
        )}
      </div>

      {(compareError || chordError || performance.error || reference.error) && (
        <p className={styles.globalError}>
          {chordError || compareError || performance.error || reference.error}
        </p>
      )}

      <div className={styles.actions}>
        {chordPracticeMode && hopamSong?.url && (
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!performance.file || isComparing}
            onClick={handleChordAnalyze}
          >
            {isComparing ? 'Đang phân tích…' : 'Phân tích & so sánh hợp âm'}
          </button>
        )}
        {!chordPracticeMode && (
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!canCompare || isComparing}
            onClick={handleCompare}
          >
            {isComparing ? 'Đang so sánh…' : 'So sánh với bài gốc'}
          </button>
        )}
        <button type="button" className={styles.ghostBtn} onClick={handleReset} disabled={isComparing}>
          Làm mới
        </button>
      </div>

      {isComparing && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressInner} style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      )}

      {comparison?.comparison && (
        <div className={styles.results}>
          <h4 className={styles.resultsTitle}>Kết quả so sánh âm thanh</h4>
          <div className={styles.metrics}>
            {comparison.comparison.mean_offset_ms !== undefined && (
              <div className={styles.metric}>
                <span>Lệch thời gian (TB)</span>
                <strong>{formatNumber(comparison.comparison.mean_offset_ms)} ms</strong>
              </div>
            )}
            {comparison.comparison.matched_notes !== undefined && (
              <div className={styles.metric}>
                <span>Nốt khớp</span>
                <strong className={styles.ok}>{comparison.comparison.matched_notes}</strong>
              </div>
            )}
            {comparison.comparison.missing_notes !== undefined && (
              <div className={styles.metric}>
                <span>Thiếu nốt</span>
                <strong className={styles.bad}>{comparison.comparison.missing_notes}</strong>
              </div>
            )}
            {comparison.comparison.extra_notes !== undefined && (
              <div className={styles.metric}>
                <span>Thừa nốt</span>
                <strong className={styles.warn}>{comparison.comparison.extra_notes}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {chordResult?.comparison && (
        <div className={styles.results}>
          <h4 className={styles.resultsTitle}>So sánh hợp âm (Hợp âm chuẩn)</h4>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span>Độ khớp</span>
              <strong className={styles.ok}>
                {chordResult.comparison.accuracyPercent ?? 0}%
              </strong>
            </div>
            <div className={styles.metric}>
              <span>Khớp / tổng</span>
              <strong>
                {chordResult.comparison.matched} / {chordResult.comparison.referenceLen}
              </strong>
            </div>
          </div>
          <ImprovementSuggestionsSection
            tempoComparison={chordResult.tempoComparison}
            chordComparison={chordResult.comparison}
            referenceSong={chordResult.referenceSong}
            chordRecognition={chordResult.chordRecognition}
          />

          <div className={styles.chordCompareBlock}>
            <ReferenceChordColumn
              comparison={chordResult.comparison}
              transpose={transpose}
            />
            <DetectedChordColumn comparison={chordResult.comparison} />
          </div>
        </div>
      )}
    </section>
  );
}
