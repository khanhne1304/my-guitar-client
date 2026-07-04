import { useEffect, useRef, useState } from "react";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./ForumPage.module.css";
import LeftSidebar from "../../components/forum/LeftSidebar/LeftSidebar";
import Composer from "../../components/forum/Composer/Composer";
import ChatWidget from "../../components/chat/ChatWidget";
import ThreadCard from "../../components/forum/ThreadCard/ThreadCard";
import { forumApi } from "../../../services/forumApi";

export default function ForumPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest"); // newest | top | unanswered
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState(""); // committed query
  const [draftQ, setDraftQ] = useState(""); // typing state
  const searchInputRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // keep behavior consistent with "social layout" pages that scroll to top
  }, []);

  useEffect(() => {
    const onCreated = () => {
      setReloadKey((k) => k + 1);
    };
    window.addEventListener("forum:thread-created", onCreated);
    return () => window.removeEventListener("forum:thread-created", onCreated);
  }, []);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const data = await forumApi.listThreads({
          sort,
          category: category === "All" ? undefined : category,
          q: (q || "").trim() ? q.trim() : undefined,
        });
        if (!alive) return;
        setThreads(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setThreads([]);
        setError(e?.message || "Không thể tải diễn đàn.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [sort, category, q, reloadKey]);

  const commitSearch = () => {
    setQ((draftQ || "").trim());
  };

  const clearSearch = () => {
    setDraftQ("");
    setQ("");
  };

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
              <div className={styles.forum__filters}>
                <div className={styles.forum__filterBlock}>
                  <span className={styles.forum__filterLabel}>Sắp xếp</span>
                  <select
                    className={styles.forum__select}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="top">Nhiều lượt thích nhất</option>
                    <option value="unanswered">Chưa có trả lời</option>
                  </select>
                </div>

                <div className={styles.forum__filterBlock}>
                  <span className={styles.forum__filterLabel}>Danh mục</span>
                  <select
                    className={styles.forum__select}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="All">Tất cả danh mục</option>
                    <option value="lesson">Học guitar</option>
                    <option value="tab">Tab guitar</option>
                    <option value="chord">Hợp âm</option>
                    <option value="discussion">Thảo luận</option>
                  </select>
                </div>

                <div className={styles.forum__filterBlock}>
                  <span className={styles.forum__filterLabel}>Tìm kiếm</span>
                  <div className={styles.forum__searchRow}>
                    <input
                      ref={searchInputRef}
                      className={styles.forum__search}
                      placeholder="Tìm kiếm chủ đề, thẻ..."
                      value={draftQ}
                      onChange={(e) => setDraftQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitSearch();
                      }}
                    />
                    <button
                      type="button"
                      className={styles.forum__actionBtn}
                      onClick={commitSearch}
                      disabled={!String(draftQ || "").trim()}
                    >
                      Tìm
                    </button>
                    <button
                      type="button"
                      className={styles.forum__actionBtn}
                      onClick={clearSearch}
                      disabled={!String(draftQ || "").trim() && !String(q || "").trim()}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>

              {error ? (
                <div className={styles.forum__empty}>{error}</div>
              ) : loading ? (
                <div className={styles.forum__empty}>Đang tải danh sách chủ đề...</div>
              ) : (threads || []).length === 0 ? (
                <div className={styles.forum__empty}>
                  Chưa có chủ đề phù hợp. Hãy tạo câu hỏi/hướng dẫn đầu tiên!
                </div>
              ) : (
                (threads || []).map((t) => (
                  <ThreadCard
                    key={t._id || t.id}
                    thread={t}
                    onDeleted={(id) => setThreads((prev) => (prev || []).filter((x) => String(x?._id || x?.id) !== String(id)))}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

