import { useEffect, useState } from "react";
import { referenceSongService } from "../../../../services/referenceSongService";
import AddReferenceSongModal from "./AddReferenceSongModal";
import EditReferenceSongModal from "./EditReferenceSongModal";
import styles from "./ReferenceSongManager.module.css";

export default function ReferenceSongManager() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSong, setEditSong] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  async function fetchSongs(page = 1) {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(filterDifficulty && { difficulty: filterDifficulty }),
      };
      const result = await referenceSongService.list(params);
      setSongs(Array.isArray(result?.songs) ? result.songs : []);
      if (result?.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      console.error("Lỗi khi load bài hát gốc:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSongs(1);
  }, [search, filterDifficulty]);

  const handleEdit = (song) => {
    setEditSong(song);
    setIsEditOpen(true);
  };

  const handleDelete = async (song) => {
    if (window.confirm(`Xóa bài hát gốc "${song.title}"? Hành động này sẽ xóa cả file audio trên Cloudinary.`)) {
      try {
        await referenceSongService.delete(song._id);
        fetchSongs(pagination.page);
      } catch (err) {
        console.error("Xóa bài hát gốc thất bại:", err);
        alert(err?.message || "Không thể xóa bài hát gốc");
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý bài hát gốc</h1>
        <button
          className={styles.addBtn}
          onClick={() => setIsAddOpen(true)}
        >
          + Thêm bài hát gốc
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, nghệ sĩ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Tất cả độ khó</option>
          <option value="beginner">Người mới</option>
          <option value="intermediate">Trung cấp</option>
          <option value="advanced">Nâng cao</option>
        </select>
      </div>

      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : songs.length === 0 ? (
        <div className={styles.empty}>Chưa có bài hát gốc nào.</div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Nghệ sĩ</th>
                <th>Độ khó</th>
                <th>Thời lượng</th>
                <th>Kích thước</th>
                <th>Người tạo</th>
                <th>Số lần sử dụng</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className={styles.titleCell}>
                      <strong>{s.title}</strong>
                      {s.description && (
                        <span className={styles.description}>{s.description}</span>
                      )}
                    </div>
                  </td>
                  <td>{s.artist || "—"}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge-${s.difficulty}`]}`}>
                      {s.difficulty === "beginner" ? "Người mới" :
                       s.difficulty === "intermediate" ? "Trung cấp" :
                       s.difficulty === "advanced" ? "Nâng cao" : s.difficulty}
                    </span>
                  </td>
                  <td>{formatDuration(s.audioFile?.duration)}</td>
                  <td>{formatFileSize(s.audioFile?.size)}</td>
                  <td>
                    {s.createdBy?.name || s.createdBy?.email || "—"}
                  </td>
                  <td>{s.usageCount || 0}</td>
                  <td>
                    <span className={`${styles.status} ${s.isActive ? styles.active : styles.inactive}`}>
                      {s.isActive ? "Hoạt động" : "Tạm khóa"}
                    </span>
                  </td>
                  <td>
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    <div className={styles.actions}>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchSongs(pagination.page - 1)}
                className={styles.pageBtn}
              >
                Trước
              </button>
              <span className={styles.pageInfo}>
                Trang {pagination.page} / {pagination.pages} ({pagination.total} bài hát)
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchSongs(pagination.page + 1)}
                className={styles.pageBtn}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {isAddOpen && (
        <AddReferenceSongModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchSongs(1);
          }}
        />
      )}

      {isEditOpen && editSong && (
        <EditReferenceSongModal
          song={editSong}
          onClose={() => {
            setIsEditOpen(false);
            setEditSong(null);
          }}
          onSuccess={() => {
            setIsEditOpen(false);
            setEditSong(null);
            fetchSongs(pagination.page);
          }}
        />
      )}
    </div>
  );
}



