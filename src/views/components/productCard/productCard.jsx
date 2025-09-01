import React from "react";
import { Link } from "react-router-dom";
import styles from "./productCard.module.css";

/**
 * ProductCard
 * @param {Object} props
 * @param {string} props.image
 * @param {string} props.name
 * @param {string} [props.brand]
 * @param {string} [props.model]
 * @param {number|string} props.price
 * @param {number} [props.oldPrice]
 * @param {string} [props.href]
 * @param {function} [props.onView]
 */
export default function ProductCard({
  image,
  name,
  brand,
  model,
  price,
  oldPrice,
  href,
  onView,
}) {
  const formatVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  // Handle price object with base/sale properties
  const getDisplayPrice = (price) => {
    if (typeof price === "number") return formatVND(price);
    if (typeof price === "string") return price;
    if (price && typeof price === "object") {
      // If price is an object with base/sale properties
      if (price.sale && price.sale !== 0) return formatVND(price.sale);
      if (price.base) return formatVND(price.base);
      return "Liên hệ";
    }
    return "Liên hệ";
  };

  const displayPrice = getDisplayPrice(price);

  return (
    <article className={styles.productCard}>
      {/* Ảnh */}
      <div className={styles.productCard__media}>
        <img src={image} alt={name} loading="lazy" />
      </div>

      {/* Thông tin */}
      <div className={styles.productCard__footer}>
        <div className={styles.productCard__info}>
          {!!(brand || model) && (
            <div className={styles.productCard__title}>
              {brand?.name?.toUpperCase() || brand?.toUpperCase()} {model}
            </div>
          )}

          <div className={styles.productCard__prices}>
            <span className={styles.productCard__price}>{displayPrice}</span>
            {oldPrice ? (
              <span className={styles.productCard__oldPrice}>
                {formatVND(oldPrice)}
              </span>
            ) : null}
          </div>
        </div>

        {/* CTA */}
        {href ? (
          <Link
            to={href}
            className={styles.productCard__cta}
            onClick={onView}
            aria-label={`Xem thêm ${name}`}
          >
            Xem thêm
          </Link>
        ) : (
          <button
            type="button"
            className={styles.productCard__cta}
            onClick={onView}
            aria-label={`Xem thêm ${name}`}
          >
            Xem thêm
          </button>
        )}
      </div>
    </article>
  );
}
