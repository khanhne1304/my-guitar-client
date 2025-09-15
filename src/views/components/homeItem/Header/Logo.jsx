import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function Logo() {
  const navigate = useNavigate();
  return (
    <div className={styles.home__logo} onClick={() => navigate("/")}>
      🎸 MyMusic
    </div>
  );
}
