import { useEffect, useState } from "react";
import { songService } from "../../../../services/songService";
import AddSongModal from "./AddSongModal";
import EditSongModal from "./EditSongModal";
import styles from "./SongManager.module.css";

export default function SongManager() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSong, setEditSong] = useState(null); // song đang được chỉnh sửa
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [q, setQ] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");

  async function fetchSongs() {
    try {
      setLoading(true);
      const data = await songService.list();
      setSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi load bài hát:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleEdit = (song) => {
    setEditSong(song);
    setIsEditOpen(true);
  };

  const handleDelete = async (song) => {
    if (window.confirm(`Xóa bài hát "${song.title}"?`)) {
      try {
        await songService.remove(song._id);
        fetchSongs();
      } catch (err) {
        console.error("Xóa bài hát thất bại:", err);
      }
    }
  };

  const uniqueStyles = Array.from(
    new Set((songs || []).map((s) => s.styleLabel).filter(Boolean))
  );

  const visibleSongs = songs.filter((s) => {
    const query = q.trim().toLowerCase();
    const matchesQ =
      !query ||
      (s.title || "").toLowerCase().includes(query) ||
      (Array.isArray(s.artists) &&
        s.artists.join(", ").toLowerCase().includes(query));

    const matchesStyle =
      styleFilter === "all" ||
      (s.styleLabel || "").toString().toLowerCase() ===
        styleFilter.toLowerCase();

    return matchesQ && matchesStyle;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý bài hát</h1>
        <button
          className={styles.addBtn}
          onClick={() => setIsAddOpen(true)}
        >
          + Thêm bài hát
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Tìm theo tên bài hát hoặc nghệ sĩ..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={styles.select}
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
        >
          <option value="all">Tất cả thể loại</option>
          {uniqueStyles.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : visibleSongs.length === 0 ? (
        <div className={styles.empty}>Chưa có bài hát nào.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nghệ sĩ</th>
              <th>Người đăng</th>
              <th>Lượt xem</th>
              <th>Thể loại</th>
              <th>Ngày đăng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {visibleSongs.map((s) => (
              <tr key={s._id}>
                <td>{s.title}</td>
                <td>{s.artists?.join(", ")}</td>
                <td>{s.posterName ?? "—"}</td>
                <td>{s.views?.toLocaleString("vi-VN")}</td>
                <td>{s.styleLabel ?? "—"}</td>
                <td>
                  {s.postedAt
                    ? new Date(s.postedAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(s)}
                  >
                    Sửa
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(s)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal thêm bài hát */}
      <AddSongModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchSongs}
      />

      {/* Modal sửa bài hát */}
      <EditSongModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        song={editSong}
        onSuccess={fetchSongs}
      />
    </div>
  );
}
