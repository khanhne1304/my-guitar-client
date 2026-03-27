import { useMemo, useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import styles from "./FriendsListPage.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";

const mockFriends = [
  { id: "f1", name: "Minh Thi", mutual: 12, avatar: "https://i.pravatar.cc/200?img=12", addedAt: "2026-03-24" },
  { id: "f2", name: "Khoa Lê", mutual: 4, avatar: "https://i.pravatar.cc/200?img=22", addedAt: "2026-03-26" },
  { id: "f3", name: "Nguyễn Duy Khánh", mutual: 50, avatar: "https://i.pravatar.cc/200?img=5", addedAt: "2026-02-10" },
  { id: "f4", name: "Laam Ly", mutual: 14, avatar: "https://i.pravatar.cc/200?img=28", addedAt: "2026-03-25" },
  { id: "f5", name: "Nguyễn Hoàng Nam", mutual: 37, avatar: "https://i.pravatar.cc/200?img=17", addedAt: "2026-01-12" },
  { id: "f6", name: "Nguyệt Anh", mutual: 2, avatar: "https://i.pravatar.cc/200?img=43", addedAt: "2026-03-20" },
  { id: "f7", name: "Vũ Văn Đức", mutual: 2, avatar: "https://i.pravatar.cc/200?img=48", addedAt: "2026-03-22" },
  { id: "f8", name: "Đạt Tiên", mutual: 33, avatar: "https://i.pravatar.cc/200?img=7", addedAt: "2026-02-28" },
  { id: "f9", name: "Bình Nhi", mutual: 45, avatar: "https://i.pravatar.cc/200?img=38", addedAt: "2026-03-27" },
];

export default function FriendsListPage() {
  const [tab, setTab] = useState("all"); // all | recent

  const data = useMemo(() => {
    if (tab === "recent") {
      // coi những người có addedAt trong vòng 7 ngày là "đã thêm gần đây"
      const now = new Date();
      return mockFriends.filter((f) => {
        const dt = new Date(f.addedAt);
        return (now - dt) / (1000 * 60 * 60 * 24) <= 7;
      });
    }
    return mockFriends;
  }, [tab]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
                  onClick={() => setTab("all")}
                >
                  Bạn bè
                </button>
                <button
                  className={`${styles.tab} ${tab === "recent" ? styles.tabActive : ""}`}
                  onClick={() => setTab("recent")}
                >
                  Đã thêm gần đây
                </button>
              </div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.sectionTitle}>
                {tab === "all" ? "Bạn bè" : "Đã thêm gần đây"}
              </div>
              <div className={styles.list}>
                {data.map((f) => (
                  <div key={f.id} className={styles.row}>
                    <img src={f.avatar} alt="" className={styles.avatar} />
                    <div className={styles.nameMeta}>
                      <div className={styles.name}>{f.name}</div>
                      <div className={styles.meta}>{f.mutual} bạn chung</div>
                    </div>
                    <button className={styles.menuBtn} aria-label="Tùy chọn">
                      <FaEllipsisH />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

