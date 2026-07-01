import { useEffect, useState } from "react";
import {
  listAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../../../../services/bannerApi";
import styles from "./BannerManager.module.css";

const emptyForm = {
  imageUrl: "",
  alt: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function fetchBanners() {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminBanners();
      setBanners(Array.isArray(data?.banners) ? data.banners : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách banner");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(banner) {
    setEditId(banner._id);
    setForm({
      imageUrl: banner.imageUrl || "",
      alt: banner.alt || "",
      linkUrl: banner.linkUrl || "",
      sortOrder: banner.sortOrder ?? 0,
      isActive: banner.isActive !== false,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      if (editId) {
        await updateBanner(editId, form);
      } else {
        await createBanner(form);
      }
      closeModal();
      fetchBanners();
    } catch (err) {
      setError(err?.message || "Lưu banner thất bại");
    }
  }

  async function handleDelete(banner) {
    if (!window.confirm("Xóa banner này?")) return;
    try {
      await deleteBanner(banner._id);
      fetchBanners();
    } catch (err) {
      setError(err?.message || "Xóa banner thất bại");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý banner</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>
          + Thêm banner
        </button>
      </div>

      <p className={styles.hint}>
        Banner hiển thị trên carousel trang chủ. Sắp xếp theo thứ tự tăng dần.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : banners.length === 0 ? (
        <div className={styles.empty}>
          Chưa có banner. Thêm banner để hiển thị trên trang chủ.
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Mô tả (alt)</th>
              <th>Liên kết</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b._id}>
                <td>
                  <img
                    className={styles.thumb}
                    src={b.imageUrl}
                    alt={b.alt || "banner"}
                  />
                </td>
                <td>{b.alt || "—"}</td>
                <td className={styles.linkCell}>
                  {b.linkUrl ? (
                    <a href={b.linkUrl} target="_blank" rel="noreferrer">
                      {b.linkUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{b.sortOrder ?? 0}</td>
                <td>{b.isActive ? "Hiển thị" : "Ẩn"}</td>
                <td>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => openEdit(b)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(b)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? "Sửa banner" : "Thêm banner"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                URL ảnh *
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, imageUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
              <label>
                Mô tả (alt)
                <input
                  type="text"
                  value={form.alt}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, alt: e.target.value }))
                  }
                  placeholder="Mô tả ảnh"
                />
              </label>
              <label>
                Liên kết khi click (tuỳ chọn)
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, linkUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
              <label>
                Thứ tự hiển thị
                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      sortOrder: Number(e.target.value) || 0,
                    }))
                  }
                />
              </label>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, isActive: e.target.checked }))
                  }
                />
                Hiển thị trên trang chủ
              </label>
              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal}>
                  Huỷ
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
