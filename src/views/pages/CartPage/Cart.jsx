import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./cart.module.css";
import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";
import { useCart } from "../../../context/CartContext";

const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(v || 0);

export default function Cart() {
    const {
        cartItems,
        subtotal,
        inc,
        dec,
        updateQty,
        removeItem,
        clearCart,
    } = useCart();

    const navigate = useNavigate();

    const [note, setNote] = useState("");
    const [invoice, setInvoice] = useState(false);
    const [agree, setAgree] = useState(false);

    // Giao hàng
    // shipMode: "instock" (Giao khi có hàng) | "schedule" (Chọn thời gian)
    const [shipMode, setShipMode] = useState("instock");
    const [dayOption, setDayOption] = useState("today"); // today | tomorrow | custom
    const [customDate, setCustomDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("13:00 - 14:00");
    const [confirmed, setConfirmed] = useState(false);

    const confirmTime = () => {
        // Nếu người dùng chọn "Chọn thời gian" thì bắt buộc có dữ liệu hợp lệ
        if (shipMode === "schedule") {
            if (dayOption === "custom" && !customDate) {
                alert("Vui lòng chọn ngày giao!");
                return;
            }
            if (!timeSlot) {
                alert("Vui lòng chọn khung giờ giao!");
                return;
            }
        }
        setConfirmed(true);
    };

    const handleCheckout = () => {
        // lưu lại thời gian giao đã chọn (nếu bạn đang dùng state như dưới)
        const payload = {
            mode: shipMode,             // "instock" | "schedule"
            dayOption,                  // "today" | "tomorrow" | "custom"
            customDate,                 // yyyy-mm-dd khi chọn custom
            timeSlot,                   // "13:00 - 14:00" ...
            dateLabel:
                shipMode === "schedule"
                    ? (dayOption === "today" ? "Hôm nay" : dayOption === "tomorrow" ? "Ngày mai" : customDate)
                    : "Hôm nay",
        };
        localStorage.setItem("deliveryTime", JSON.stringify(payload));

        // chuyển sang trang checkout
        navigate("/checkout");
    };

    const isEmpty = cartItems.length === 0;

    return (
        <div className={styles.page}>
            <Header products={MOCK_PRODUCTS} />

            <main className={styles.main}>
                <div className={styles.container}>
                    <h2 className={styles.title}>Giỏ hàng của bạn</h2>

                    {isEmpty ? (
                        <div className={styles.empty}>
                            Giỏ hàng đang trống.
                            <button
                                className={styles.btnPrimary}
                                onClick={() => navigate("/products")}
                            >
                                Mua sắm ngay
                            </button>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {/* LEFT: danh sách sản phẩm */}
                            <section className={styles.left}>
                                <p className={styles.caption}>
                                    Bạn đang có <b>{cartItems.length}</b> sản phẩm trong giỏ hàng
                                </p>

                                <div className={styles.list}>
                                    {cartItems.map((item) => (
                                        <article key={item._id} className={styles.row}>
                                            <div className={styles.picWrap}>
                                                <img src={item.image} alt={item.name} />
                                            </div>

                                            <div className={styles.info}>
                                                <div className={styles.name}>{item.name}</div>
                                                <div className={styles.sku}>{item.sku}</div>

                                                <div className={styles.priceRow}>
                                                    <span className={styles.price}>
                                                        {fmtVND(item.price)}
                                                    </span>
                                                </div>

                                                <div className={styles.qtyRow}>
                                                    <button
                                                        className={styles.qtyBtn}
                                                        onClick={() => dec(item._id)}
                                                        aria-label="Giảm số lượng"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.qty}
                                                        onChange={(e) =>
                                                            updateQty(
                                                                item._id,
                                                                Math.max(1, parseInt(e.target.value || "1", 10))
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        className={styles.qtyBtn}
                                                        onClick={() => inc(item._id, item.stock)}
                                                        aria-label="Tăng số lượng"
                                                    >
                                                        +
                                                    </button>

                                                    <button
                                                        className={styles.removeBtn}
                                                        onClick={() => removeItem(item._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* Ghi chú */}
                                <div className={styles.noteBox}>
                                    <div className={styles.noteTitle}>Ghi chú đơn hàng</div>
                                    <textarea
                                        placeholder="Ví dụ: Giao sau 18h, gọi trước khi giao..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>

                                <label className={styles.invoice}>
                                    <input
                                        type="checkbox"
                                        checked={invoice}
                                        onChange={(e) => setInvoice(e.target.checked)}
                                    />
                                    <span>Xuất hoá đơn cho đơn hàng</span>
                                </label>
                            </section>

                            {/* RIGHT: tổng tiền & tuỳ chọn */}
                            <aside className={styles.right}>
                                <h3 className={styles.boxTitle}>Thông tin đơn hàng</h3>

                                {/* Thời gian giao hàng */}
                                <div className={styles.shipTimeBox}>
                                    <div className={styles.shipHeader}>THỜI GIAN GIAO HÀNG</div>

                                    <label className={styles.radio}>
                                        <input
                                            type="radio"
                                            name="shipmode"
                                            value="instock"
                                            checked={shipMode === "instock"}
                                            onChange={(e) => {
                                                setShipMode(e.target.value);
                                                setConfirmed(false);
                                            }}
                                        />
                                        Giao khi có hàng
                                    </label>

                                    <label className={styles.radio}>
                                        <input
                                            type="radio"
                                            name="shipmode"
                                            value="schedule"
                                            checked={shipMode === "schedule"}
                                            onChange={(e) => {
                                                setShipMode(e.target.value);
                                                setConfirmed(false);
                                            }}
                                        />
                                        Chọn thời gian
                                    </label>

                                    {/* ❗ Chỉ hiện khi chọn "Chọn thời gian" */}
                                    {shipMode === "schedule" && (
                                        <div className={styles.timeRow}>
                                            <div className={styles.col}>
                                                <label>Ngày giao</label>
                                                <div className={styles.inline}>
                                                    <select
                                                        value={dayOption}
                                                        onChange={(e) => {
                                                            setDayOption(e.target.value);
                                                            setConfirmed(false);
                                                        }}
                                                    >
                                                        <option value="today">Hôm nay</option>
                                                        <option value="tomorrow">Ngày mai</option>
                                                        <option value="custom">Chọn ngày</option>
                                                    </select>

                                                    {dayOption === "custom" && (
                                                        <input
                                                            type="date"
                                                            value={customDate}
                                                            onChange={(e) => {
                                                                setCustomDate(e.target.value);
                                                                setConfirmed(false);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.col}>
                                                <label>Thời gian giao</label>
                                                <select
                                                    value={timeSlot}
                                                    onChange={(e) => {
                                                        setTimeSlot(e.target.value);
                                                        setConfirmed(false);
                                                    }}
                                                >
                                                    <option value="08:00 - 10:00">08:00 - 10:00</option>
                                                    <option value="10:00 - 12:00">10:00 - 12:00</option>
                                                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                                                    <option value="15:00 - 17:00">15:00 - 17:00</option>
                                                    <option value="18:00 - 21:00">18:00 - 21:00</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <button className={styles.confirmBtn} onClick={confirmTime}>
                                        XÁC NHẬN THỜI GIAN
                                    </button>

                                    {confirmed ? (
                                        <div className={styles.confirmOk}>
                                            ✓ Đã xác nhận thời gian giao
                                        </div>
                                    ) : (
                                        <div className={styles.confirmWarn}>
                                            Vui lòng xác nhận thời gian giao trước khi thanh toán
                                        </div>
                                    )}
                                </div>

                                <div className={styles.totalRow}>
                                    <span>Tổng tiền:</span>
                                    <b className={styles.total}>{fmtVND(subtotal)}</b>
                                </div>

                                <ul className={styles.notes}>
                                    <li>Phí vận chuyển sẽ được tính ở trang thanh toán.</li>
                                    <li>Bạn cũng có thể nhập mã giảm giá ở trang thanh toán.</li>
                                </ul>

                                <label className={styles.agree}>
                                    <input
                                        type="checkbox"
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                    />
                                    <span>
                                        Tôi đã đọc và đồng ý với các điều khoản của đơn vị.
                                    </span>
                                </label>

                                <button
                                    className={styles.btnCheckout}
                                    disabled={!agree}
                                    onClick={handleCheckout}
                                >
                                    THANH TOÁN
                                </button>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
