// src/views/checkout/CheckOutHistory.jsx
import { useEffect, useState } from 'react';
import styles from './CheckOutHistory.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { getMyOrdersApi } from '../../../services/orderService';

export default function CheckOutHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchOrders() {
            try {
                const data = await getMyOrdersApi();
                console.log("📦 Orders API data:", data); // <== Kiểm tra log ở đây

                // ✅ Chỉ setOrders nếu data là mảng
                setOrders(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e.message || 'Không thể tải đơn hàng');
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);



    return (
        <div className={styles.history}>
            <Header />
            <main className={styles.history__main}>
                <h2 className={styles.history__title}>Lịch sử đơn hàng</h2>

                {loading && <p>Đang tải...</p>}
                {error && <p className={styles.history__error}>{error}</p>}

                {!loading && !error && orders.length === 0 && (
                    <p className={styles.history__empty}>Bạn chưa có đơn hàng nào</p>
                )}

                <div className={styles.history__list}>
                    {orders.map((order) => (
                        <div key={order._id} className={styles.history__card}>
                            <div className={styles.history__header}>
                                <span>Mã đơn: <b>{order._id}</b></span>
                                <span className={`${styles.history__status} ${styles[`status--${order.status}`]}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className={styles.history__body}>
                                <p><b>Ngày đặt:</b> {new Date(order.createdAt).toLocaleString()}</p>
                                <p><b>Tổng tiền:</b> {order.total.toLocaleString()}₫</p>

                                {Array.isArray(order.items) && (
                                    <ul>
                                        {order.items.map((it, i) => (
                                            <li key={i}>{it.name} × {it.qty} ({it.price.toLocaleString()}₫)</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );


    return (
        <div className={styles.history}>
            <Header />
            <main className={styles.history__main}>
                <h2 className={styles.history__title}>Lịch sử đơn hàng</h2>

                {loading && <p>Đang tải...</p>}
                {error && <p className={styles.history__error}>{error}</p>}

                {!loading && !error && orders.length === 0 && (
                    <p className={styles.history__empty}>Bạn chưa có đơn hàng nào</p>
                )}

                <div className={styles.history__list}>
                    {orders.map((order) => (
                        <div key={order._id} className={styles.history__card}>
                            <div className={styles.history__header}>
                                <span>Mã đơn: <b>{order._id}</b></span>
                                <span className={`${styles.history__status} ${styles[`status--${order.status}`]}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className={styles.history__body}>
                                <p><b>Ngày đặt:</b> {new Date(order.createdAt).toLocaleString()}</p>
                                <p><b>Tổng tiền:</b> {order.total.toLocaleString()}₫</p>
                                <ul>
                                    {order.items.map((it, i) => (
                                        <li key={i}>{it.name} × {it.qty} ({it.price.toLocaleString()}₫)</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
