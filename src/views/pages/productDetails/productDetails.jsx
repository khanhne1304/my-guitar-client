import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./productDetails.module.css";
import {
    getProductBySlug,
    getProductsByCategory,
    MOCK_PRODUCTS,
} from "../../components/Data/dataProduct";
import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { useCart } from "../../../context/CartContext";

const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(v || 0);

export default function ProductDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const prod = getProductBySlug(slug);
    const [activeImg, setActiveImg] = useState(0);
    const [tab, setTab] = useState("desc"); // desc | specs | video
    const [qty, setQty] = useState(1);

    const { addToCart } = useCart();

    const { priceNow, oldPrice, discount } = useMemo(() => {
        const base = prod?.price?.base ?? 0;
        const sale = prod?.price?.sale ?? 0;
        const now = sale && sale !== 0 ? sale : base;
        const old = sale && sale !== 0 ? base : null;
        const dc = old ? Math.round((1 - now / old) * 100) : 0;
        return { priceNow: now, oldPrice: old, discount: dc };
    }, [prod]);

    if (!prod) {
        return (
            <div className={styles.state}>
                Không tìm thấy sản phẩm.
                <button className={styles.btn} onClick={() => navigate(-1)}>
                    Quay lại
                </button>
            </div>
        );
    }

    const images =
        prod.images?.length > 0 ? prod.images : [{ url: "", alt: prod.name }];

    // --- Số lượng ---
    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => Math.min(prod.stock || 1, q + 1));
    const onQtyChange = (e) => {
        const v = parseInt(e.target.value || "1", 10);
        if (Number.isNaN(v)) return;
        const clamped = Math.max(1, Math.min(v, prod.stock || 1));
        setQty(clamped);
    };

    // --- Xử lý thêm giỏ hàng ---
    const handleAddToCart = (goToCart = false) => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
            return;
        }
        if (prod.stock <= 0) return;

        addToCart(
            {
                _id: prod._id,
                slug: prod.slug,
                name: prod.name,
                sku: prod.sku,
                price: priceNow,
                image: prod.images?.[0]?.url || "",
                stock: prod.stock,  },
        qty
 );

    if (goToCart) {
        navigate("/cart");
    } else {
        alert("Đã thêm sản phẩm vào giỏ hàng!");
    }
};

return (
    <div className={styles.page}>
        <Header products={MOCK_PRODUCTS} />

        <main className={styles.main}>
            <div className={styles.wrap}>
                {/* breadcrumb */}
                <div className={styles.breadcrumb}>
                    <span onClick={() => navigate("/")} role="button" tabIndex={0}>
                        Trang chủ
                    </span>
                    <span>›</span>
                    <span
                        onClick={() => navigate(`/category/${prod?.category?.slug}`)}
                        role="button"
                        tabIndex={0}
                    >
                        {prod?.category?.name}
                    </span>
                    <span>›</span>
                    <strong>{prod.name}</strong>
                </div>

                <div className={styles.head}>
                    {/* GALLERY */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImg}>
                            {discount ? (
                                <div className={styles.saleBadge}>-{discount}%</div>
                            ) : null}
                            <img
                                src={images[activeImg]?.url}
                                alt={images[activeImg]?.alt || prod.name}
                            />
                        </div>

                        <div className={styles.thumbRow}>
                            {images.map((img, i) => (
                                <button
                                    key={`${img.url}-${i}`}
                                    className={`${styles.thumb} ${i === activeImg ? styles.active : ""
                                        }`}
                                    onClick={() => setActiveImg(i)}
                                    aria-label={`Ảnh ${i + 1}`}
                                >
                                    <img src={img.url} alt={img.alt || `thumb-${i}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* INFO */}
                    <div className={styles.info}>
                        <h1 className={styles.title}>{prod.name}</h1>

                        <div className={styles.sub}>
                            <span>
                                <b>Thương hiệu:</b> {prod?.brand?.name}
                            </span>
                            <span className={styles.sep}>•</span>
                            <span>
                                <b>Model/SKU:</b> {prod.sku}
                            </span>
                        </div>

                        <div className={styles.prices}>
                            <span className={styles.price}>{fmtVND(priceNow)}</span>
                            {oldPrice ? (
                                <span className={styles.old}>{fmtVND(oldPrice)}</span>
                            ) : null}
                            {discount ? (
                                <span className={styles.badge}>Tiết kiệm {discount}%</span>
                            ) : null}
                        </div>

                        <div className={styles.featureBox}>
                            <h4>🌟 Đặc điểm nổi bật</h4>
                            <ul>
                                {prod.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.giftBox}>
                            <h4>🎁 Quà tặng kèm</h4>
                            <ul>
                                {prod.gifts.map((g, i) => (
                                    <li key={i}>{g}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity selector */}
                        <div className={styles.qtyRow}>
                            <span>Số lượng</span>
                            <div className={styles.qtyBox}>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={dec}
                                    aria-label="Giảm số lượng"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={prod.stock || 1}
                                    value={qty}
                                    onChange={onQtyChange}
                                />
                                <button
                                    className={styles.qtyBtn}
                                    onClick={inc}
                                    aria-label="Tăng số lượng"
                                >
                                    +
                                </button>
                            </div>
                            <span className={styles.stockNote}>
                                {prod.stock > 0
                                    ? `${prod.stock} sản phẩm có sẵn`
                                    : "Hết hàng"}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                            {prod.stock > 0 ? (
                                <>
                                    <button
                                        className={`${styles.btn} ${styles.primary}`}
                                        onClick={() => handleAddToCart(true)}
                                    >
                                        Mua ngay
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={() => handleAddToCart(false)}
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </>
                            ) : (
                                <button className={styles.btn} disabled>
                                    Hết hàng
                                </button>
                            )}
                        </div>

                        {/* META */}
                        <div className={styles.meta}>
                            <div>
                                <b>Danh mục:</b> {prod?.category?.name}
                            </div>
                            <div>
                                <b>Tình trạng:</b>{" "}
                                <span
                                    className={
                                        prod.stock > 0 ? styles.inStock : styles.outStock
                                    }
                                >
                                    {prod.stock > 0 ? "Còn hàng" : "Hết hàng"}
                                </span>
                            </div>
                            <div>
                                <b>Vận chuyển:</b>{" "}
                                {prod?.shipping?.innerCityFree
                                    ? "Miễn phí nội thành"
                                    : "Tính phí theo khu vực"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === "desc" ? styles.active : ""
                            }`}
                        onClick={() => setTab("desc")}
                    >
                        Mô tả
                    </button>
                    <button
                        className={`${styles.tab} ${tab === "specs" ? styles.active : ""
                            }`}
                        onClick={() => setTab("specs")}
                    >
                        Thông số
                    </button>
                    <button
                        className={`${styles.tab} ${tab === "video" ? styles.active : ""
                            }`}
                        onClick={() => setTab("video")}
                    >
                        Video
                    </button>
                </div>

                {tab === "desc" && (
                    <section className={styles.block}>
                        <h3>Mô tả sản phẩm</h3>
                        <div className={styles.descriptionPlain}>{prod.description}</div>
                    </section>
                )}

                {tab === "specs" && (
                    <section className={styles.block}>
                        <h3>Thông số kỹ thuật</h3>
                        <table className={styles.specTable}>
                            <tbody>
                                {Object.entries(prod.attributes || {}).map(([k, v]) => (
                                    <tr key={k}>
                                        <td className={styles.specKey}>{k}</td>
                                        <td>{String(v)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {tab === "video" && (
                    <section className={styles.block}>
                        <h3>Video</h3>
                        {prod.videoUrl ? (
                            <div className={styles.videoWrap}>
                                <iframe
                                    src={prod.videoUrl}
                                    title={`${prod.name} video`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className={styles.state}>
                                Chưa có video cho sản phẩm này.
                            </div>
                        )}
                    </section>
                )}

                {/* Related products */}
                <RelatedProducts
                    currentSlug={prod.slug}
                    categorySlug={prod?.category?.slug}
                    onGo={(href) => navigate(href)}
                />
            </div>
        </main>

        <Footer />
    </div>
);
}

// === Related products ===
function RelatedProducts({ currentSlug, categorySlug, onGo }) {
    const items = getProductsByCategory(categorySlug)
        .filter((p) => p.slug !== currentSlug)
        .slice(0, 4);

    if (!items.length) return null;

    const fmt = (v) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(v || 0);

    return (
        <section className={styles.relatedWrap}>
            <h3 className={styles.relatedTitle}>Sản phẩm liên quan</h3>
            <div className={styles.relatedGrid}>
                {items.map((p) => {
                    const hasSale = p.price?.sale && p.price.sale !== 0;
                    const now = hasSale ? p.price.sale : p.price.base;
                    return (
                        <article
                            key={p._id}
                            className={styles.relatedCard}
                            onClick={() => onGo(`/products/${p.slug}`)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className={styles.relatedMedia}>
                                <img
                                    src={p.images?.[0]?.url}
                                    alt={p.images?.[0]?.alt || p.name}
                                />
                                {hasSale && (
                                    <span className={styles.relatedSaleBadge}>SALE</span>
                                )}
                                <div className={styles.relatedOverlay}>
                                    <button
                                        className={styles.relatedBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onGo(`/products/${p.slug}`);
                                        }}
                                    >
                                        Xem thêm
                                    </button>
                                </div>
                            </div>

                            <div className={styles.relatedInfo}>
                                <div className={styles.relatedModel}>{p.sku}</div>
                                <div className={styles.relatedName}>{p.name}</div>
                                <div className={styles.relatedPrices}>
                                    <span className={styles.relatedPrice}>{fmt(now)}</span>
                                    {hasSale && (
                                        <span className={styles.relatedOld}>
                                            {fmt(p.price.base)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
