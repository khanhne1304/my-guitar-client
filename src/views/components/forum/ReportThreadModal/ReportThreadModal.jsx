import { useEffect, useState } from 'react';
import styles from './ReportThreadModal.module.css';
import {
  FORUM_REPORT_REASONS,
  FORUM_REPORT_OTHER,
} from '../../../../Constants/forumReportReasons';

export default function ReportThreadModal({ open, onClose, onSubmit, submitting = false }) {
  const [selected, setSelected] = useState(FORUM_REPORT_REASONS[0]);
  const [otherText, setOtherText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelected(FORUM_REPORT_REASONS[0]);
    setOtherText('');
    setError('');
  }, [open]);

  if (!open) return null;

  function buildReason() {
    if (selected === FORUM_REPORT_OTHER) {
      const text = otherText.trim();
      if (!text) {
        setError('Vui lòng mô tả lý do khi chọn "Khác".');
        return null;
      }
      return text;
    }
    return selected;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const reason = buildReason();
    if (!reason) return;
    try {
      await onSubmit?.(reason);
    } catch (err) {
      setError(err?.message || 'Không thể gửi báo cáo.');
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-thread-title"
      >
        <div className={styles.head}>
          <h2 id="report-thread-title" className={styles.title}>
            Báo cáo bài viết
          </h2>
          <p className={styles.subtitle}>
            Chọn lý do báo cáo với quản trị viên
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.list}>
              {FORUM_REPORT_REASONS.map((reason) => {
                const checked = selected === reason;
                return (
                  <label
                    key={reason}
                    className={`${styles.option} ${checked ? styles.optionSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      className={styles.radio}
                      checked={checked}
                      onChange={() => {
                        setSelected(reason);
                        setError('');
                      }}
                    />
                    <span className={styles.label}>{reason}</span>
                  </label>
                );
              })}
            </div>

            {selected === FORUM_REPORT_OTHER ? (
              <textarea
                className={styles.otherInput}
                placeholder="Mô tả thêm lý do báo cáo..."
                value={otherText}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  setError('');
                }}
              />
            ) : null}

            {error ? <div className={styles.error}>{error}</div> : null}
          </div>

          <div className={styles.foot}>
            <button type="button" className={styles.btn} onClick={onClose} disabled={submitting}>
              Huỷ
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={submitting}>
              {submitting ? 'Đang gửi…' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
