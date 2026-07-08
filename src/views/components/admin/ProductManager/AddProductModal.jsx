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
  const [imageUrls, setImageUrls] = useState([""]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageUrlChange(index, value) {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  }

  function addImageField() {
    setImageUrls((prev) => [...prev, ""]);
  }

  function removeImageField(index) {
    setImageUrls((prev) => (prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)));
  }

  function buildImages() {
    const validUrls = imageUrls.map((url) => url.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      return [{ url: DEFAULT_IMAGE, alt: name }];
    }
    return validUrls.map((url, i) => ({ url, alt: `${name} - ảnh ${i + 1}` }));
  }

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
        images: buildImages(),
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
      setImageUrls([""]);
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
            <div className={styles.imageFieldHeader}>
              <label>Ảnh sản phẩm</label>
              <button type="button" className={styles.addImageBtn} onClick={addImageField}>
                + Thêm ảnh
              </button>
            </div>
            {imageUrls.map((url, index) => (
              <div key={index} className={styles.imageRow}>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder={`Link ảnh ${index + 1} (https://...)`}
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => removeImageField(index)}
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                )}
                {url.trim() && (
                  <div className={styles.preview}>
                    <img src={url.trim()} alt={`Preview ${index + 1}`} className={styles.imagePreview} />
                  </div>
                )}
              </div>
            ))}
            <p className={styles.imageHint}>Để trống sẽ dùng ảnh mặc định. Ảnh đầu tiên hiển thị trên thẻ sản phẩm.</p>
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
