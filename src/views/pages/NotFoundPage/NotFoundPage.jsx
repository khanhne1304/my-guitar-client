import { Link } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.content}>
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>Không tìm thấy trang này</h1>
          <p className={styles.desc}>
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <Link to="/" className={styles.homeLink}>
            Về trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
