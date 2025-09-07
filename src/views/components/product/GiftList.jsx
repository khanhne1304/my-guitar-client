import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';

export default function GiftList({ items = [] }) {
if (!items?.length) return null;
return (
<div className={styles.giftBox}>
<h4>🎁 Quà tặng kèm</h4>
<ul>{items.map((g, i) => <li key={i}>{g}</li>)}</ul>
</div>
);
}