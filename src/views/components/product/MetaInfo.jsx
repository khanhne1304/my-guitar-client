import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';


export default function MetaInfo({ prod }) {
return (
<div className={styles.meta}>
<div><b>Danh mục:</b> {prod?.category?.name}</div>
<div>
<b>Tình trạng:</b>{' '}
<span className={prod.stock > 0 ? styles.inStock : styles.outStock}>
{prod.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
</span>
</div>
<div>
<b>Vận chuyển:</b>{' '}
{prod?.shipping?.innerCityFree ? 'Miễn phí nội thành' : 'Tính phí theo khu vực'}
</div>
</div>
);
}