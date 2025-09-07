// src/components/home/Section.jsx
import styles from '../../pages/HomePage/HomePage.module.css';


export default function Section({ title, titleClassName, children }) {
return (
<section className={styles.home__section}>
<h2 className={`${styles.home__sectionTitle} ${titleClassName || ''}`.trim()}>
{title}
</h2>
{children}
</section>
);
}