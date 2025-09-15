import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function CartButton({ cartCount }) {
  const navigate = useNavigate();
  return (
    <button
      className={styles.iconBtn}
      onClick={() => navigate("/cart")}
      aria-label="Giỏ hàng"
    >
      <span className={styles.cartIcon}>🛒</span>
      {cartCount > 0 && (
        <span className={styles.cartBadge}>{cartCount}</span>
      )}
    </button>
  );
}
