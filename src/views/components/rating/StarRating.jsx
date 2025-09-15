// src/components/common/StarRating.jsx
import { useState } from "react";
import styles from "./StarRating.module.css";

export default function StarRating({ max = 5, value = 0, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.stars}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        return (
          <span
            key={i}
            className={`${styles.star} ${starValue <= (hover || value) ? styles.filled : ""}`}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange && onChange(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
