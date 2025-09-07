// src/components/home/Hero.jsx
import styles from '../../pages/HomePage/HomePage.module.css';


export default function Hero() {
return (
<section className={styles.home__hero}>
<div className={styles.home__heroText}>
<h1>Nhạc cụ cho mọi người</h1>
<p>Chọn đàn phù hợp và bắt đầu hành trình âm nhạc của bạn 🎶</p>
<div className={styles.home__heroActions}>
</div>
</div>
</section>
);
}