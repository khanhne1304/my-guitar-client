import { useState } from 'react';
import styles from '../../pages/productDetails/productDetails.module.css';


export default function Gallery({ images = [], discount = 0 }) {
const [active, setActive] = useState(0);
return (
<div className={styles.gallery}>
<div className={styles.mainImg}>
{discount ? <div className={styles.saleBadge}>-{discount}%</div> : null}
<img src={images[active]?.url} alt={images[active]?.alt} />
</div>
<div className={styles.thumbRow}>
{images.map((img, i) => (
<button
key={`${img.url}-${i}`}
className={`${styles.thumb} ${i === active ? styles.active : ''}`}
onClick={() => setActive(i)}
aria-label={`Ảnh ${i + 1}`}
>
<img src={img.url} alt={img.alt || `thumb-${i}`} />
</button>
))}
</div>
</div>
);
}