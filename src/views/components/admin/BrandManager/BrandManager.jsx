import { useEffect, useState } from "react";
import {
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../../../services/brandApi";
import { clearBrandsCache } from "../../../../hooks/useBrands";
import styles from "./BrandManager.module.css";
import { useConfirm } from "../../../../context/ConfirmContext";

const emptyForm = {
  name: "",
  country: "",
};

export default function BrandManager() {
  const { confirm } = useConfirm();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      const brandData = await listBrands();
      setBrands(Array.isArray(brandData) ? brandData : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(brand) {
    setEditId(brand._id);
    setForm({
      name: brand.name || "",
      country: brand.country || "",
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
      const payload = {
        name: form.name.trim(),
        country: form.country.trim(),
      };

      if (editId) {
        await updateBrand(editId, payload);
      } else {
        await createBrand(payload);
      }

      clearBrandsCache();
      closeModal();
      fetchData();
    } catch (err) {
      setError(err?.message || "Lưu thương hiệu thất bại");
    }
  }

  async function handleDelete(brand) {
    if (!(await confirm(`Xóa thương hiệu "${brand.name}"?`))) return;
    try {
      await deleteBrand(brand._id);
      clearBrandsCache();
      fetchData();
    } catch (err) {
      setError(err?.message || "Xóa thương hiệu thất bại");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý thương hiệu guitar</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>
          + Thêm thương hiệu
        </button>
      </div>

      <p className={styles.hint}>
        Thương hiệu hiển thị trong menu và bộ lọc sản phẩm guitar.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : brands.length === 0 ? (
        <div className={styles.empty}>
          Chưa có thương hiệu. Thêm thương hiệu guitar để gán cho sản phẩm.
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Quốc gia</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand._id}>
                <td>{brand.name}</td>
                <td>{brand.slug}</td>
                <td>{brand.country || "—"}</td>
                <td>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => openEdit(brand)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(brand)}
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
            <h2>{editId ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Tên thương hiệu *
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Ví dụ: Yamaha, Fender, Taylor"
                />
              </label>
              <label>
                Quốc gia
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, country: e.target.value }))
                  }
                  placeholder="Ví dụ: Nhật Bản, Mỹ"
                />
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
