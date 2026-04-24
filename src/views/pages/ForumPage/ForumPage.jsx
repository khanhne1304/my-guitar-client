import { useEffect, useState } from "react";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./ForumPage.module.css";
import RightSidebar from "../../components/forum/RightSidebar/RightSidebar";
import LeftSidebar from "../../components/forum/LeftSidebar/LeftSidebar";
import Composer from "../../components/forum/Composer/Composer";
import PostCard from "../../components/forum/PostCard/PostCard";
import ChatWidget from "../../components/chat/ChatWidget";

export default function ForumPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("user_posts");
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          setPosts(arr);
        } else {
          setPosts([]);
        }
      } catch {
        setPosts([]);
      }
    };
    load();
    const onChanged = () => load();
    window.addEventListener("user:post-changed", onChanged);
    window.addEventListener("user:new-post", onChanged);
    return () => {
      window.removeEventListener("user:post-changed", onChanged);
      window.removeEventListener("user:new-post", onChanged);
    };
  }, []);

  return (
    <div className={styles.forum}>
      <Header />
      <main className={styles.forum__main}>
        <div className={styles.forum__container}>
          <div className={styles.forum__grid}>
            <div className={styles.forum__left}>
              <LeftSidebar />
            </div>
            <div className={styles.forum__center}>
              <Composer />
              {posts.length === 0 ? (
                <div className={styles.forum__empty}>
                  Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
                </div>
              ) : (
                posts.map((p) => <PostCard key={p.id} post={p} />)
              )}
            </div>
            <div className={styles.forum__right}>
              <RightSidebar />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

