// src/components/product/Tabs.jsx
import { useState } from 'react';
import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';


export default function Tabs({ prod }) {
const [tab, setTab] = useState('desc'); // desc|specs|video


return (
<>
<div className={styles.tabs}>
<button className={`${styles.tab} ${tab === 'desc' ? styles.active : ''}`} onClick={() => setTab('desc')}>Mô tả</button>
<button className={`${styles.tab} ${tab === 'specs' ? styles.active : ''}`} onClick={() => setTab('specs')}>Thông số</button>
<button className={`${styles.tab} ${tab === 'video' ? styles.active : ''}`} onClick={() => setTab('video')}>Video</button>
</div>


{tab === 'desc' && (
<section className={styles.block}>
<h3>Mô tả sản phẩm</h3>
<div className={styles.descriptionPlain}>{prod.description}</div>
</section>
)}


{tab === 'specs' && (
<section className={styles.block}>
<h3>Thông số kỹ thuật</h3>
<table className={styles.specTable}>
<tbody>
{Object.entries(prod.attributes || {}).map(([k, v]) => (
<tr key={k}>
<td className={styles.specKey}>{k}</td>
<td>{String(v)}</td>
</tr>
))}
</tbody>
</table>
</section>
)}


{tab === 'video' && (
<section className={styles.block}>
<h3>Video</h3>
{prod.videoUrl ? (
<div className={styles.videoWrap}>
<iframe
src={prod.videoUrl}
title={`${prod.name} video`}
frameBorder='0'
allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
allowFullScreen
/>
</div>
) : (
<div className={styles.state}>Chưa có video cho sản phẩm này.</div>
)}
</section>
)}
</>
);
}