import styles from '../../pages/productDetails/productDetails.module.css';
import { fmtVND } from '../../../utils/currency';


export default function RelatedProducts({ items = [], onGo }) {
if (!items.length) return null;
return (
<section className={styles.relatedWrap}>
<h3 className={styles.relatedTitle}>Sản phẩm liên quan</h3>
<div className={styles.relatedGrid}>
{items.map((p) => {
const hasSale = p.price?.sale && p.price.sale !== 0;
const now = hasSale ? p.price.sale : p.price.base;
return (
<article
key={p._id}
className={styles.relatedCard}
onClick={() => onGo(`/products/${p.slug}`)}
role='button'
tabIndex={0}
>
<div className={styles.relatedMedia}>
<img src={p.images?.[0]?.url} alt={p.images?.[0]?.alt || p.name} />
{hasSale && <span className={styles.relatedSaleBadge}>SALE</span>}
<div className={styles.relatedOverlay}>
<button
className={styles.relatedBtn}
onClick={(e) => {
e.stopPropagation();
onGo(`/products/${p.slug}`);
}}
>
Xem thêm
</button>
</div>
</div>


<div className={styles.relatedInfo}>
<div className={styles.relatedModel}>{p.sku}</div>
<div className={styles.relatedName}>{p.name}</div>
<div className={styles.relatedPrices}>
<span className={styles.relatedPrice}>{fmtVND(now)}</span>
{hasSale && <span className={styles.relatedOld}>{fmtVND(p.price.base)}</span>}
</div>
</div>
</article>
);
})}
</div>
</section>
);
}