import { useEffect, useRef, useState } from "react";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./ForumPage.module.css";
import RightSidebar from "../../components/forum/RightSidebar/RightSidebar";
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
  const [searchOpen, setSearchOpen] = useState(false);
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

  useEffect(() => {
    if (!searchOpen) return;
    const id = setTimeout(() => {
      try {
        searchInputRef.current?.focus?.();
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, [searchOpen]);

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
              <div className={styles.forum__controls}>
                <select className={styles.forum__select} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Mới nhất</option>
                  <option value="top">Nhiều lượt thích nhất</option>
                  <option value="unanswered">Chưa có trả lời</option>
                </select>
                <select className={styles.forum__select} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="All">Tất cả danh mục</option>
                  <option value="lesson">Học guitar</option>
                  <option value="tab">Tab guitar</option>
                  <option value="chord">Hợp âm</option>
                  <option value="discussion">Thảo luận</option>
                </select>
                <button
                  type="button"
                  className={styles.forum__select}
                  onClick={() => setSearchOpen((v) => !v)}
                  style={{ fontWeight: 900, cursor: "pointer" }}
                >
                  {searchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
                </button>
                {searchOpen ? (
                  <>
                    <input
                      ref={searchInputRef}
                      className={styles.forum__search}
                      placeholder="Tìm kiếm chủ đề, thẻ..."
                      value={draftQ}
                      onChange={(e) => setDraftQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitSearch();
                        if (e.key === "Escape") setSearchOpen(false);
                      }}
                    />
                    <button
                      type="button"
                      className={styles.forum__select}
                      onClick={commitSearch}
                      disabled={!String(draftQ || "").trim()}
                      style={{ fontWeight: 900, cursor: "pointer" }}
                    >
                      Tìm
                    </button>
                    <button
                      type="button"
                      className={styles.forum__select}
                      onClick={clearSearch}
                      disabled={!String(draftQ || "").trim() && !String(q || "").trim()}
                      style={{ fontWeight: 900, cursor: "pointer" }}
                    >
                      Xoá
                    </button>
                  </>
                ) : null}
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

