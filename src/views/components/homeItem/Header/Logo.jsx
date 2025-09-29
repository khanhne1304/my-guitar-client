import { useNavigate } from "react-router-dom";
import { useCategory } from "../../../../context/CategoryContext";
import styles from "./Header.module.css";
// Import logo từ assets
import logo from "../../../../assets/Image/logo.png";

export default function Logo() {
  const navigate = useNavigate();
  const { clearFilters } = useCategory();

  const handleLogoClick = () => {
    // Clear tất cả filters trước khi navigate về trang chủ
    clearFilters();
    navigate("/");
  };

  return (
    <div className={styles.home__logo} onClick={handleLogoClick}>
      <img 
        src={logo} 
        alt="MyMusic Logo" 
        className={styles.logo__image} 
      />
    </div>
  );
}
