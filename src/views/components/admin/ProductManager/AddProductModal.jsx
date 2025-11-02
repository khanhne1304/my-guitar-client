import { useState } from "react";
import styles from "./AddProductModal.module.css";
import { productService } from "../../../../services/productService";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop";

export default function AddProductModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [type, setType] = useState("guitar");
  const [priceBase, setPriceBase] = useState("");
  const [priceSale, setPriceSale] = useState("");
  const [stock, setStock] = useState(0);
  const [linkAnh, setLinkAnh] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const payload = {
        name,
        sku: sku || undefined,
        price: {
          base: Number(priceBase),
          sale: priceSale ? Number(priceSale) : undefined,
          currency: "VND",
        },
        stock: Number(stock),
        description,
        images: [
          {
            url: linkAnh.trim() || DEFAULT_IMAGE,
            alt: name,
          },
        ],
        attributes: { type },
        // Gửi kèm categorySlug dựa theo loại để backend map đúng Category
        categorySlug: type,
      };

      await productService.create(payload);

      // Reset form
      setName("");
      setSku("");
      setType("guitar");
      setPriceBase("");
      setPriceSale("");
      setStock(0);
      setLinkAnh("");
      setDescription("");

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      setError(err.message || "Không thể thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Thêm sản phẩm mới</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Tên sản phẩm *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label>SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Tùy chọn" />
          </div>

          <div className={styles.field}>
            <label>Loại sản phẩm *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="guitar">Guitar</option>
              <option value="piano">Piano</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Giá gốc (₫) *</label>
            <input type="number" value={priceBase} onChange={(e) => setPriceBase(e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label>Giá khuyến mãi (₫)</label>
            <input type="number" value={priceSale} onChange={(e) => setPriceSale(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Tồn kho</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min={0} />
          </div>

          <div className={styles.field}>
            <label>Link ảnh</label>
            <input
              type="url"
              value={linkAnh}
              onChange={(e) => setLinkAnh(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.field}>
            <label>Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang thêm..." : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
