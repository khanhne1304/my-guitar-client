import { useState } from "react";
import styles from "./FriendRequestsPage.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";

const mockRequests = [
  { id: "u1", name: "Lê Mạnh Bảo", mutual: 3, avatar: "https://i.pravatar.cc/300?img=11" },
  { id: "u2", name: "Lê Ngọc Kiều", mutual: 8, avatar: "https://i.pravatar.cc/300?img=25" },
  { id: "u3", name: "Thảo Nguyên", mutual: 2, avatar: "https://i.pravatar.cc/300?img=47" },
  { id: "u4", name: "Ngọc Lan", mutual: 5, avatar: "https://i.pravatar.cc/300?img=15" },
  { id: "u5", name: "Nguyễn Ngọc Thanh", mutual: 1, avatar: "https://i.pravatar.cc/300?img=36" },
  { id: "u6", name: "Diệu Liên", mutual: 4, avatar: "https://i.pravatar.cc/300?img=31" },
  { id: "u7", name: "Thúy Huỳnh", mutual: 6, avatar: "https://i.pravatar.cc/300?img=9" },
  { id: "u8", name: "Huỳnh Cúc", mutual: 3, avatar: "https://i.pravatar.cc/300?img=23" },
  { id: "u9", name: "Trung Nghĩa", mutual: 7, avatar: "https://i.pravatar.cc/300?img=40" },
  { id: "u10", name: "Mỹ Duyên", mutual: 2, avatar: "https://i.pravatar.cc/300?img=45" },
  { id: "u11", name: "Hoàng Phúc", mutual: 5, avatar: "https://i.pravatar.cc/300?img=4" },
  { id: "u12", name: "Minh Châu", mutual: 9, avatar: "https://i.pravatar.cc/300?img=56" },
  { id: "u13", name: "Thanh Tâm", mutual: 1, avatar: "https://i.pravatar.cc/300?img=21" },
  { id: "u14", name: "Nhật Hào", mutual: 4, avatar: "https://i.pravatar.cc/300?img=60" },
  { id: "u15", name: "Phương Thảo", mutual: 3, avatar: "https://i.pravatar.cc/300?img=34" },
  { id: "u16", name: "Bảo Ngọc", mutual: 6, avatar: "https://i.pravatar.cc/300?img=52" },
  { id: "u17", name: "Văn Tín", mutual: 2, avatar: "https://i.pravatar.cc/300?img=7" },
  { id: "u18", name: "Khánh Huyền", mutual: 8, avatar: "https://i.pravatar.cc/300?img=66" },
  { id: "u19", name: "Anh Khoa", mutual: 5, avatar: "https://i.pravatar.cc/300?img=17" },
  { id: "u20", name: "Thuỳ Dương", mutual: 3, avatar: "https://i.pravatar.cc/300?img=30" },
];

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState(mockRequests);

  const accept = (id) => setRequests((prev) => prev.filter((r) => r.id !== id));
  const remove = (id) => setRequests((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.titleBar}>
            <div className={styles.title}>Lời mời kết bạn</div>
            <a href="#" className={styles.seeAll}>Xem tất cả</a>
          </div>
          <div className={styles.grid}>
            {requests.map((r) => (
              <div key={r.id} className={styles.card}>
                <img src={r.avatar} alt="" className={styles.cover} />
                <div className={styles.content}>
                  <div className={styles.name}>{r.name}</div>
                  <div className={styles.meta}>{r.mutual} bạn chung</div>
                  <div className={styles.actions}>
                    <button className={styles.accept} onClick={() => accept(r.id)}>Xác nhận</button>
                    <button className={styles.remove} onClick={() => remove(r.id)}>Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

