import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./ForumPage.module.css";
import RightSidebar from "../../components/forum/RightSidebar/RightSidebar";
import LeftSidebar from "../../components/forum/LeftSidebar/LeftSidebar";
import Composer from "../../components/forum/Composer/Composer";
import PostCard from "../../components/forum/PostCard/PostCard";
import ChatWidget from "../../components/chat/ChatWidget";

export default function ForumPage() {
  const demoPosts = [
    {
      id: "1",
      authorName: "Ngọc Mai",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=12",
      time: "2 giờ trước",
      content:
        "Mọi người có gợi ý gì để tập legato mượt hơn không? Mình đang theo bài 1-2-3-4 nhưng chưa đều tay.",
      imageUrl: "",
    },
    {
      id: "v13",
      authorName: "Đức Huy",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=18",
      time: "Hôm nay lúc 09:40",
      content: "Chia sẻ clip nhạc lofi ngắn cho mọi người thư giãn.",
      imageUrl: "",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: "2",
      authorName: "Thanh Tùng",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=5",
      time: "Hôm qua lúc 20:31",
      content: "Chia sẻ backing track blues A minor cho anh em jam!",
      imageUrl:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "3",
      authorName: "Hà Linh",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=32",
      time: "3 giờ trước",
      content: "Mới thay dây Elixir, cảm giác trơn tay hơn hẳn! Mọi người hay dùng loại nào?",
      imageUrl: "",
    },
    {
      id: "4",
      authorName: "Đức Huy",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=18",
      time: "Hôm nay lúc 08:12",
      content: "Bài fingerstyle đầu tay của mình, mong nhận góp ý.",
      imageUrl:
        "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "5",
      authorName: "Minh Khoa",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=14",
      time: "5 phút trước",
      content: "Có ai có tab phần điệp khúc bài 'Có chàng trai viết lên cây' không ạ?",
      imageUrl: "",
    },
    {
      id: "6",
      authorName: "Bảo Trâm",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=47",
      time: "Hôm qua lúc 21:00",
      content: "Chia sẻ preset reverb + delay mình hay dùng khi thu acoustic.",
      imageUrl: "",
    },
    {
      id: "7",
      authorName: "Quốc Duy",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=9",
      time: "1 ngày trước",
      content: "Mọi người tập alternate picking thế nào để đạt 120bpm ổn định?",
      imageUrl: "",
    },
    {
      id: "8",
      authorName: "Tuấn Kiệt",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=23",
      time: "Hôm nay lúc 10:05",
      content: "Ảnh góc tập mới set up, đơn giản mà đủ dùng!",
      imageUrl:
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "9",
      authorName: "Anh Thư",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=28",
      time: "2 ngày trước",
      content: "Có ai khuyến nghị capo nào bền, kẹp chắc mà không bị lệch tone không?",
      imageUrl: "",
    },
    {
      id: "10",
      authorName: "Hoàng Nam",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=2",
      time: "7 phút trước",
      content: "Mình mới học 2 tháng, xin list bài dễ để luyện chuyển hợp âm ạ.",
      imageUrl: "",
    },
    {
      id: "11",
      authorName: "Quỳnh Như",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=36",
      time: "Hôm qua lúc 19:45",
      content: "Cover nhanh một đoạn City of Stars 🎶",
      imageUrl:
        "https://images.unsplash.com/photo-1460032622126-6a0de20b1d05?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "12",
      authorName: "Khánh Vy",
      authorAvatarUrl: "https://i.pravatar.cc/80?img=8",
      time: "4 giờ trước",
      content: "Cách đọc nốt trên ngăn đàn nhanh hơn ngoài việc thuộc scale?",
      imageUrl: "",
    },
  ];
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
              {demoPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
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

