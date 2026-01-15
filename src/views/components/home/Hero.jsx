// src/components/home/Hero.jsx
import { useEffect, useRef, useState } from 'react';
import styles from '../../pages/HomePage/HomePage.module.css';


export default function Hero() {
const fallbackUrl = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&h=480&q=80';
const banners = [
{ 
url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&h=480&q=80', 
alt: 'Guitar điện - không khí sân khấu' 
},
{ 
url: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=1200&h=480&q=80', 
alt: 'Piano - cảm hứng trình diễn' 
},
{ 
url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&h=480&q=80', 
alt: 'Guitar acoustic - giai điệu mộc mạc' 
},
];

const [active, setActive] = useState(0);
const pausedRef = useRef(false);

useEffect(() => {
if (pausedRef.current) return;
const id = setInterval(() => {
setActive((i) => (i + 1) % banners.length);
}, 6000);
return () => clearInterval(id);
}, [active, banners.length]);

const goPrev = () => setActive((i) => (i - 1 + banners.length) % banners.length);
const goNext = () => setActive((i) => (i + 1) % banners.length);

return (
<section
className={styles.home__carousel}
aria-label="Banner ưu đãi"
onMouseEnter={() => { pausedRef.current = true; }}
onMouseLeave={() => { pausedRef.current = false; }}
>
<div className={styles.home__carouselViewport}>
{banners.map((b, i) => (
<div
key={`${b.url}-${i}`}
className={`${styles.home__carouselSlide} ${i === active ? styles.home__carouselSlideActive : ''}`.trim()}
aria-hidden={i !== active}
>
<img
src={b.url}
alt={b.alt || `banner-${i + 1}`}
className={styles.home__carouselImg}
onError={(e) => {
  // Đảm bảo không lặp vô hạn khi fallback cũng lỗi
  if (!e.currentTarget.dataset.fallback) {
    e.currentTarget.src = fallbackUrl;
    e.currentTarget.dataset.fallback = '1';
  }
}}
/>
</div>
))}
</div>

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

<div className={styles.home__carouselIndicators} role="tablist" aria-label="Chọn banner">
{banners.map((_, i) => (
<button
key={`dot-${i}`}
className={`${styles.home__carouselDot} ${i === active ? styles.home__carouselDotActive : ''}`.trim()}
aria-label={`Chọn banner ${i + 1}`}
aria-selected={i === active}
onClick={() => setActive(i)}
/>
))}
</div>
</section>
);
}