import styles from "./RightSidebar.module.css";

export default function RightSidebar() {
  const contacts = [
    { name: "Minh Anh", online: true, avatarUrl: "https://i.pravatar.cc/64?img=11" },
    { name: "Hải Nam", online: true, avatarUrl: "https://i.pravatar.cc/64?img=3" },
    { name: "Thu Trang", online: false, avatarUrl: "https://i.pravatar.cc/64?img=15" },
    { name: "Quốc Huy", online: true, avatarUrl: "https://i.pravatar.cc/64?img=20" },
    { name: "Trâm Nguyễn", online: false, avatarUrl: "https://i.pravatar.cc/64?img=29" },
  ];
  const active = contacts.filter((c) => c.online);
  return (
    <aside className={styles._card}>
      <div className={styles._title}>Bạn bè đang hoạt động</div>
      <div className={styles._list}>
        {active.map((c) => (
          <div key={c.name} className={styles._row}>
            <div className={styles._avatar}>
              {c.avatarUrl ? (
                <img className={styles._avatarImg} src={c.avatarUrl} alt="" />
              ) : null}
              <span className={styles._onlineDot} />
            </div>
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

