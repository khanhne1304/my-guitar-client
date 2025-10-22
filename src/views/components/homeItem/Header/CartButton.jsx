import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export default function CartButton({ cartCount }) {
  const navigate = useNavigate();
  const [prevCount, setPrevCount] = useState(cartCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (cartCount !== prevCount) {
      setIsAnimating(true);
      setPrevCount(cartCount);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [cartCount, prevCount]);

  return (
    <button
      className={styles.iconBtn}
      onClick={() => navigate("/cart")}
      aria-label={`Giỏ hàng ${cartCount > 0 ? `(${cartCount} sản phẩm)` : ''}`}
    >
      <span className={styles.cartIcon}>🛒</span>
      {cartCount > 0 && (
        <span 
          className={`${styles.cartBadge} ${isAnimating ? styles.badgeAnimating : ''}`}
        >
          {cartCount}
        </span>
      )}
    </button>
  );
}
