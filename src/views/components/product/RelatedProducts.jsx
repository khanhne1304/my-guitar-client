import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';
import { fmtVND } from '../../../utils/currency';

export default function RelatedProducts({ items = [], onGo }) {
    if (!items.length) return null;

    return (
        <section className={styles['product-details__related']}>
            <h3 className={styles['product-details__related-title']}>
                Sản phẩm liên quan
            </h3>
            <div className={styles['product-details__related-grid']}>
                {items.map((p) => {
                    const hasSale = p.price?.sale && p.price.sale !== 0;
                    const now = hasSale ? p.price.sale : p.price.base;

                    return (
                        <article
                            key={p._id}
                            className={styles['related-card']}
                            onClick={() => onGo(`/products/${p.slug}`)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className={styles['related-card__media']}>
                                <img
                                    src={p.images?.[0]?.url}
                                    alt={p.images?.[0]?.alt || p.name}
                                />
                                {hasSale && (
                                    <span className={styles['related-card__sale']}>SALE</span>
                                )}
                                <div className={styles['related-card__overlay']}>
                                    <button
                                        className={styles['related-card__cta']}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onGo(`/products/${p.slug}`);
                                        }}
                                    >
                                        Xem thêm
                                    </button>
                                </div>
                            </div>

                            <div className={styles['related-card__info']}>
                                <div className={styles['related-card__model']}>{p.sku}</div>
                                <div className={styles['related-card__name']}>{p.name}</div>
                                <div className={styles['related-card__prices']}>
                                    <span className={styles['related-card__price']}>
                                        {fmtVND(now)}
                                    </span>
                                    {hasSale && (
                                        <span className={styles['related-card__old']}>
                                            {fmtVND(p.price.base)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
