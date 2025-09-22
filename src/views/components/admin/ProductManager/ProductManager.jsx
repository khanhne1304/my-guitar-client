import { useEffect, useState } from "react";
import { productService } from "../../../../services/productService";
import styles from "./ProductManager.module.css";
import AddProductModal from "./AddProductModal";
import UpdateProductModal from "./UpdateProductModal.jsx";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.list();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi load sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (p) => {
    setEditProduct(p);
    setShowEditModal(true);
  };
  const handleDelete = async (p) => {
    if (window.confirm(`Xóa sản phẩm "${p.name}"?`)) {
      try {
        await productService.delete(p._id);
        fetchProducts(); // reload danh sách
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý sản phẩm</h1>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : products.length === 0 ? (
        <div className={styles.empty}>Chưa có sản phẩm nào.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>SKU</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <img
                    src={p.image || DEFAULT_IMAGE}
                    alt={p.imageAlt || p.name}
                    className={styles.thumbnail}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.sku ?? "—"}</td>
                <td>
                  {p.price?.sale ? (
                    <>
                      <span style={{ textDecoration: "line-through", color: "#888", marginRight: "4px" }}>
                        {p.price.base.toLocaleString("vi-VN")}₫
                      </span>
                      <span style={{ color: "#b91c1c", fontWeight: 700 }}>
                        {p.price.sale.toLocaleString("vi-VN")}₫
                      </span>
                    </>
                  ) : (
                    <span>{p.price?.base?.toLocaleString("vi-VN")}₫</span>
                  )}
                </td>

                <td>{p.stock}</td>
                <td>{p.ratingAverage ?? p.rating ?? "—"}</td>
                <td className={p.stock > 0 ? styles.inStock : styles.outStock}>
                  {p.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(p)}
                  >
                    Sửa
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(p)}
                  >
                    Xóa
                  </button>
                </td>


              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal thêm sản phẩm */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchProducts} // reload danh sách khi thêm thành công
        />
      )}
      {showEditModal && (
        <UpdateProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={editProduct}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}
