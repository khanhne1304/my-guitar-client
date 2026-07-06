// src/views/components/admin/ProductManager/UpdateProductModal.jsx
import { useEffect, useState } from "react";
import styles from "./AddProductModal.module.css"; // tái sử dụng style của AddProductModal
import { productService } from "../../../../services/productService";
import { useAlert } from "../../../../context/AlertContext";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop";

export default function UpdateProductModal({ isOpen, onClose, product, onSuccess }) {
  const { error: showError } = useAlert();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    type: "guitar",
    priceBase: "",
    priceSale: "",
    stock: 0,
    imageUrl: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔄 Nạp dữ liệu sản phẩm cũ
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        type: product.attributes?.type || "guitar",
        priceBase: product.price?.base ?? "",
        priceSale: product.price?.sale ?? "",
        stock: product.stock ?? 0,
        imageUrl: product.images?.[0]?.url || "",
        description: product.description || "",
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        sku: formData.sku || undefined,
        attributes: { type: formData.type },
        price: { base: Number(formData.priceBase), sale: formData.priceSale ? Number(formData.priceSale) : undefined },
        stock: Number(formData.stock),
        images: [{ url: formData.imageUrl || DEFAULT_IMAGE, alt: formData.name }],
        description: formData.description,
        categorySlug: formData.type,
      };

      await productService.update(product._id, payload);

      onSuccess?.(); // reload lại danh sách sản phẩm
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      await showError("Không thể cập nhật sản phẩm. Kiểm tra console để xem chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Chỉnh sửa sản phẩm</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Tên sản phẩm *</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label>SKU</label>
            <input name="sku" value={formData.sku} onChange={handleChange} />
          </div>

          <div className={styles.field}>
            <label>Loại sản phẩm *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="guitar">Guitar</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Giá gốc (₫) *</label>
            <input
              type="number"
              name="priceBase"
              value={formData.priceBase}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Giá khuyến mãi (₫)</label>
            <input
              type="number"
              name="priceSale"
              value={formData.priceSale}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label>Tồn kho</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className={styles.field}>
            <label>Link ảnh</label>
            <input
              name="imageUrl"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={handleChange}
            />
            <div className={styles.preview}>
              <img
                src={formData.imageUrl || DEFAULT_IMAGE}
                alt="Preview"
                className={styles.imagePreview}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Mô tả</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
