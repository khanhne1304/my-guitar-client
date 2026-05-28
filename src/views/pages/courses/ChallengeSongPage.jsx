import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { getCourseApi } from '../../../services/learningApi';
import layout from './LearningLayout.module.css';
import cs from './Courses.module.css';

const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

export default function ChallengeSongPage() {
  const { courseId, moduleId } = useParams();
  const [song, setSong] = useState(null);
  const [modTitle, setModTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCourseApi(courseId);
        const m = (res.modules || []).find((x) => x.id === moduleId);
        if (!cancelled) {
          setSong(m?.challengeSong || null);
          setModTitle(m?.title || '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, moduleId]);

  const embedUrl = song?.youtubeVideoId
    ? `https://www.youtube.com/embed/${song.youtubeVideoId}`
    : '';

  return (
    <div className={layout.page}>
      <Header />
      <main className={layout.main}>
        <div className={layout.card}>
          <Link to={`/courses/${courseId}`} className={layout.linkBtn}>
            ← Về khóa học
          </Link>
          {loading ? (
            <p className={layout.muted}>Đang tải…</p>
          ) : !song ? (
            <p className={layout.muted} style={{ marginTop: 16 }}>
              Chưa có bài thử thách cho module này.
            </p>
          ) : (
            <>
              <p className={layout.muted} style={{ marginTop: 12 }}>
                {modTitle}
              </p>
              <h1 className={layout.title}>{song.title}</h1>
              {song.artist && <p className={layout.lead}>{song.artist}</p>}
              <span className={layout.badge}>{DIFF_LABEL[song.difficulty] || song.difficulty}</span>
              {embedUrl && (
                <div className={cs.videoWrap}>
                  <iframe title={song.title} src={embedUrl} allowFullScreen />
                </div>
              )}
              <p className={layout.muted} style={{ marginTop: 16 }}>
                Chơi bài này để áp dụng những gì bạn đã học trong module.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
