import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { compareSongService } from '../../../services/compareSongService';
import { referenceSongService } from '../../../services/referenceSongService';
import { validateAudioFile } from '../../../utils/audioFileValidation';
import styles from './SongAudioComparePanel.module.css';

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return Number(value).toFixed(digits);
};

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

export default function SongAudioComparePanel({ title = '', artist = '', directMode = false }) {
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
    return (
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Luyện tập guitar trực tiếp</h3>
        <p className={styles.panelSub}>
          Tải hoặc thu <strong>bản guitar của bạn</strong> — không cần chọn hay tải bài gốc.
        </p>

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

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={handleReset}>
            Làm mới
          </button>
        </div>
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

      {(compareError || performance.error || reference.error) && (
        <p className={styles.globalError}>{compareError || performance.error || reference.error}</p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!canCompare || isComparing}
          onClick={handleCompare}
        >
          {isComparing ? 'Đang so sánh…' : 'So sánh với bài gốc'}
        </button>
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
          <h4 className={styles.resultsTitle}>Kết quả so sánh</h4>
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
    </section>
  );
}
