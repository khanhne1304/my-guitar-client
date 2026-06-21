import { useEffect, useMemo, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import chordPracticeService from '../../../services/chordPracticeService';
import styles from './PracticeResultsDashboard.module.css';

const LEVEL_LABELS = {
  Beginner: 'Cơ bản',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao',
};

const SECTION_NAME_VI = {
  Verse: 'Phiên khúc',
  'Pre-Chorus': 'Tiền điệp khúc',
  Chorus: 'Điệp khúc',
  Bridge: 'Cầu nối',
  Solo: 'Solo',
  Outro: 'Kết bài',
};

function translateSectionName(name) {
  return SECTION_NAME_VI[name] || name;
}

function scoreClass(score) {
  if (score >= 85) return styles.sectionScoreGood;
  if (score >= 70) return styles.sectionScoreWarn;
  return styles.sectionScoreBad;
}

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

function SkillCards({ scores }) {
  if (!scores) return null;
  const items = [
    { key: 'chordAccuracy', label: 'Độ chính xác hợp âm' },
    { key: 'rhythm', label: 'Nhịp điệu' },
    { key: 'tempoControl', label: 'Kiểm soát tempo' },
    { key: 'transitionSkill', label: 'Chuyển hợp âm' },
  ];
  return (
    <div>
      <h5 className={styles.sectionTitle}>Điểm kỹ năng</h5>
      <div className={styles.skillCards}>
        {items.map(({ key, label }) => (
          <div key={key} className={styles.skillCard}>
            <span className={styles.skillLabel}>{label}</span>
            <strong className={styles.skillValue}>{scores[key] ?? '—'}</strong>
          </div>
        ))}
        <div className={`${styles.skillCard} ${styles.skillCardOverall}`}>
          <span className={styles.skillLabel}>Điểm tổng</span>
          <strong className={`${styles.skillValue} ${styles.skillValueOverall}`}>
            {scores.overall ?? '—'}
          </strong>
        </div>
      </div>
    </div>
  );
}

function SkillRadarChart({ scores }) {
  if (!scores) return null;
  const data = [
    { skill: 'Chính xác', value: scores.chordAccuracy ?? 0 },
    { skill: 'Nhịp', value: scores.rhythm ?? 0 },
    { skill: 'Tempo', value: scores.tempoControl ?? 0 },
    { skill: 'Chuyển âm', value: scores.transitionSkill ?? 0 },
  ];
  return (
    <div className={styles.chartSection}>
      <h5 className={styles.sectionTitle}>Biểu đồ kỹ năng</h5>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="rgba(0,0,0,0.12)" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: '#666' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Kỹ năng"
              dataKey="value"
              stroke="#e85d04"
              fill="#e85d04"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SectionPerformance({ sections }) {
  if (!sections?.length) {
    return (
      <div className={styles.chartSection}>
        <h5 className={styles.sectionTitle}>Hiệu suất theo đoạn</h5>
        <p className={styles.emptyState}>Chưa có dữ liệu phân đoạn.</p>
      </div>
    );
  }
  return (
    <div className={styles.chartSection}>
      <h5 className={styles.sectionTitle}>Hiệu suất theo đoạn</h5>
      <table className={styles.sectionTable}>
        <thead>
          <tr>
            <th>Đoạn bài</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((sec) => (
            <tr key={sec.name}>
              <td>{translateSectionName(sec.name)}</td>
              <td className={`${styles.sectionScore} ${scoreClass(sec.accuracy)}`}>
                {sec.accuracy}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MainProblemsCards({ problems }) {
  if (!problems?.length) return null;
  return (
    <div>
      <h5 className={styles.sectionTitle}>Vấn đề chính</h5>
      {problems.map((p) => (
        <div key={p.problem} className={styles.problemCard}>
          <p className={styles.problemTitle}>{p.problem}</p>
          {p.cause && (
            <p className={styles.problemMeta}>
              <em>Nguyên nhân:</em> {p.cause}
            </p>
          )}
          {p.impact && (
            <p className={styles.problemMeta}>
              <em>Ảnh hưởng:</em> {p.impact}
            </p>
          )}
          {p.solution && (
            <p className={styles.problemMeta}>
              <em>Cách khắc phục:</em> {p.solution}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function PracticePlanList({ plan }) {
  if (!plan?.length) return null;
  return (
    <div>
      <h5 className={styles.sectionTitle}>Kế hoạch luyện tập</h5>
      <ol className={styles.planList}>
        {plan.map((item) => (
          <li key={`${item.exercise}-${item.durationMinutes}`} className={styles.planItem}>
            <span className={styles.planDuration}>{item.durationMinutes} phút</span>
            <p className={styles.planExercise}>
              {item.exercise || item.title}
            </p>
            {(item.goal || item.reason) && (
              <p className={styles.planGoal}>
                Mục tiêu: {item.goal || item.reason}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Dashboard kết quả luyện tập: skill cards, radar chart, sections, wrong chords, AI advice.
 * @param {{ chordResult: object }} props
 */
export default function PracticeResultsDashboard({ chordResult }) {
  const metrics = chordResult?.practiceMetrics;
  const scores = metrics?.skillScores;

  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const adviceKey = useMemo(() => {
    if (!chordResult?.comparison) return '';
    const c = chordResult.comparison;
    return [
      c.matched,
      c.referenceLen,
      c.accuracyPercent,
      chordResult.tempoComparison?.detectedBpm,
      metrics?.skillScores?.overall,
    ].join('|');
  }, [chordResult, metrics?.skillScores?.overall]);

  useEffect(() => {
    if (!adviceKey || !chordResult?.comparison) return undefined;

    let cancelled = false;
    setAiAdvice(null);
    setAiError('');
    setAiLoading(true);

    chordPracticeService
      .getPracticeAdvice({
        referenceSong: chordResult.referenceSong,
        comparison: chordResult.comparison,
        tempoComparison: chordResult.tempoComparison,
        chordRecognition: chordResult.chordRecognition,
        beatAnalysis: chordResult.beatAnalysis,
        practiceMetrics: chordResult.practiceMetrics,
      })
      .then((data) => {
        if (!cancelled) setAiAdvice(data);
      })
      .catch((err) => {
        if (!cancelled) setAiError(err?.message || 'Không tải được đánh giá AI.');
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adviceKey, chordResult]);

  const displayScores = aiAdvice?.skillAssessment || scores;

  return (
    <div className={styles.dashboard}>
      <SkillCards scores={displayScores} />

      <div className={styles.twoCol}>
        <SkillRadarChart scores={displayScores} />
        <SectionPerformance sections={metrics?.sections} />
      </div>

      <div className={styles.adviceBlock}>
        <h5 className={styles.sectionTitle}>Đánh giá giáo viên AI</h5>
        {aiLoading && <p className={styles.hint}>Đang phân tích buổi luyện tập…</p>}
        {!aiLoading && aiError && <p className={styles.hint}>{aiError}</p>}
        {!aiLoading && aiAdvice && !aiAdvice.available && (
          <p className={styles.hint}>
            {aiAdvice.message || 'Chưa tạo được đánh giá — thử phân tích lại.'}
          </p>
        )}
        {!aiLoading && aiAdvice?.available && (
          <>
            {aiAdvice.aiWarning && <p className={styles.hint}>{aiAdvice.aiWarning}</p>}
            <LevelBadge level={aiAdvice.performanceLevel || aiAdvice.level} />
            {aiAdvice.overview && (
              <p className={styles.adviceOverview}>{aiAdvice.overview}</p>
            )}
            {aiAdvice.recommendedTempo > 0 && (
              <p className={styles.tempoRec}>
                Tempo đề xuất buổi kế tiếp:{' '}
                <strong>{Math.round(aiAdvice.recommendedTempo)} BPM</strong>
              </p>
            )}
            {aiAdvice.nextSessionGoal && (
              <p className={styles.tempoRec}>
                Mục tiêu buổi sau: <strong>{aiAdvice.nextSessionGoal}</strong>
              </p>
            )}
          </>
        )}
      </div>

      {!aiLoading && aiAdvice?.available && (
        <>
          <MainProblemsCards problems={aiAdvice.mainProblems} />
          <PracticePlanList plan={aiAdvice.practicePlan} />
        </>
      )}
    </div>
  );
}
