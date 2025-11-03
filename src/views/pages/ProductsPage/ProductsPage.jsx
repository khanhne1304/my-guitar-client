// ProductsView.jsx
import styles from './ProductsPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import CategoryGrid from '../../components/Catalog/CategoryGrid';
import ProductGrid from '../../components/home/ProductGrid';
import { useProductsViewModel } from '../../../viewmodels/ProductsViewModel';
import { useMemo, useState, useEffect, Fragment } from 'react';

export default function ProductsPage() {
  const { products, categories, handleSelect, isFiltered, q, loading, err } = useProductsViewModel();
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15; // 3 sp / hàng x 5 hàng

  const sortedProducts = useMemo(() => {
    const list = Array.isArray(products) ? [...products] : [];
    const getNow = (p) => (p?.price?.sale && p.price.sale !== 0 ? p.price.sale : p?.price?.base || 0);
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => getNow(a) - getNow(b));
      case 'price-desc':
        return list.sort((a, b) => getNow(b) - getNow(a));
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-desc':
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'date-asc':
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return list;
    }
  }, [products, sortBy]);

  // Mỗi khi dữ liệu hoặc cách sắp xếp thay đổi, quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [sortedProducts]);

  const totalPages = Math.max(1, Math.ceil((sortedProducts?.length || 0) / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedProducts = sortedProducts.slice(start, start + PAGE_SIZE);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const gotoPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    // Cuộn lên lưới khi đổi trang
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles['products-page']}>
      <Header />

      <main className={styles['products-page__main']}>
        <div className={styles['products-page__container']}>
          {isFiltered ? (
            <>
              <h1 className={styles['products-page__title']}>
                {q ? `Kết quả cho "${q}"` : 'Kết quả lọc sản phẩm'}
              </h1>
              <div className={styles['products-page__sortbar']}>
                <label>Sắp xếp theo:</label>
                <select className={styles['products-page__sortselect']} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="date-desc">Mới nhất</option>
                  <option value="date-asc">Cũ nhất</option>
                </select>
              </div>
              {loading ? (
                <div>Đang tải...</div>
              ) : err ? (
                <div>{err}</div>
              ) : (
                <Fragment>
                  <ProductGrid items={pagedProducts} emptyText="Không tìm thấy sản phẩm phù hợp." />
                  <div className={styles['products-page__pagination']}>
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canPrev}
                      onClick={() => gotoPage(1)}
                      aria-label="Trang đầu"
                    >
                      «
                    </button>
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canPrev}
                      onClick={() => gotoPage(page - 1)}
                      aria-label="Trang trước"
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles['products-page__pagenum']} ${p === page ? styles['is-active'] : ''}`}
                        onClick={() => gotoPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canNext}
                      onClick={() => gotoPage(page + 1)}
                      aria-label="Trang sau"
                    >
                      ›
                    </button>
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canNext}
                      onClick={() => gotoPage(totalPages)}
                      aria-label="Trang cuối"
                    >
                      »
                    </button>
                  </div>
                </Fragment>
              )}
            </>
          ) : (
            <>
              <h1 className={styles['products-page__title']}>Tất cả sản phẩm</h1>
              <div className={styles['products-page__sortbar']}>
                <label>Sắp xếp theo:</label>
                <select className={styles['products-page__sortselect']} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="date-desc">Mới nhất</option>
                  <option value="date-asc">Cũ nhất</option>
                </select>
              </div>
              {loading ? (
                <div>Đang tải...</div>
              ) : err ? (
                <div>{err}</div>
              ) : (
                <Fragment>
                  <ProductGrid items={pagedProducts} emptyText="Hiện chưa có sản phẩm." />
                  <div className={styles['products-page__pagination']}>
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canPrev}
                      onClick={() => gotoPage(1)}
                      aria-label="Trang đầu"
                    >
                      «
                    </button>
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canPrev}
                      onClick={() => gotoPage(page - 1)}
                      aria-label="Trang trước"
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles['products-page__pagenum']} ${p === page ? styles['is-active'] : ''}`}
                        onClick={() => gotoPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canNext}
                      onClick={() => gotoPage(page + 1)}
                      aria-label="Trang sau"
                    >
                      ›
                    </button>
                    <button
                      className={styles['products-page__pagebtn']}
                      disabled={!canNext}
                      onClick={() => gotoPage(totalPages)}
                      aria-label="Trang cuối"
                    >
                      »
                    </button>
                  </div>
                </Fragment>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
