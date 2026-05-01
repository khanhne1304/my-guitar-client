import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import ChatWidget from "../../components/chat/ChatWidget";
import LeftSidebar from "../../components/forum/LeftSidebar/LeftSidebar";
import styles from "./SocialLayout.module.css";
import { Outlet } from "react-router-dom";

export default function SocialLayout() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.left}>
              <LeftSidebar />
            </div>
            <div className={styles.center}>
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

