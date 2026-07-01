// src/components/home/Hero.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/HomePage/HomePage.module.css';
import { listPublicBanners } from '../../../services/bannerApi';

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listPublicBanners();
        const rows = Array.isArray(data?.banners) ? data.banners : [];
        if (!alive) return;
        setBanners(
          rows.map((b) => ({
            url: b.imageUrl,
            alt: b.alt || '',
            linkUrl: b.linkUrl || '',
          }))
        );
        setActive(0);
      } catch {
        if (!alive) return;
        setBanners([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    if (pausedRef.current) return undefined;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [active, banners.length]);

  const goPrev = () =>
    setActive((i) => (i - 1 + banners.length) % banners.length);
  const goNext = () => setActive((i) => (i + 1) % banners.length);

  if (banners.length === 0) return null;

  return (
    <section
      className={styles.home__carousel}
      aria-label="Banner ưu đãi"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className={styles.home__carouselViewport}>
        {banners.map((b, i) => {
          const img = (
            <img
              src={b.url}
              alt={b.alt || `banner-${i + 1}`}
              className={styles.home__carouselImg}
            />
          );

          return (
            <div
              key={`${b.url}-${i}`}
              className={`${styles.home__carouselSlide} ${
                i === active ? styles.home__carouselSlideActive : ''
              }`.trim()}
              aria-hidden={i !== active}
            >
              {b.linkUrl ? (
                b.linkUrl.startsWith('/') ? (
                  <Link to={b.linkUrl}>{img}</Link>
                ) : (
                  <a href={b.linkUrl} target="_blank" rel="noreferrer">
                    {img}
                  </a>
                )
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.home__carouselArrow} ${styles.home__carouselArrowLeft}`.trim()}
            aria-label="Ảnh trước"
            onClick={goPrev}
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.home__carouselArrow} ${styles.home__carouselArrowRight}`.trim()}
            aria-label="Ảnh sau"
            onClick={goNext}
          >
            ›
          </button>

          <div
            className={styles.home__carouselIndicators}
            role="tablist"
            aria-label="Chọn banner"
          >
            {banners.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                className={`${styles.home__carouselDot} ${
                  i === active ? styles.home__carouselDotActive : ''
                }`.trim()}
                aria-label={`Chọn banner ${i + 1}`}
                aria-selected={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
