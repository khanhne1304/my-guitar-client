import styles from '../../pages/CheckoutPage/checkout.module.css';
import { fmtVND } from '../../../untils/currency'; // hoặc '../../../utils/currency'

export default function VnpayQR({
  visible, showQR, setShowQR, paid, setPaid, orderId, total, orderInfo, qrUrl
}) {
  if (!visible || !showQR) return null;

  return (
    <div className={styles.qrBox}>
      <div className={styles.qrTitle}>Thanh toán VNPay QR</div>

      <div className={styles.qrMeta}>
        <div>
          <div>Mã đơn: <b>{orderId}</b></div>
          <div>Số tiền: <b>{fmtVND(total)}</b></div>
          <div>Nội dung: <b>{orderInfo}</b></div>
        </div>
        <img className={styles.qrImg} src={qrUrl} alt="VNPay QR" />
      </div>

      <div className={styles.qrNote}>
        * Quét mã bằng ứng dụng ngân hàng/VNPay. (Demo, không phát sinh giao dịch thật)
      </div>

      <div className={styles.qrActions}>
        <button className={styles.grayBtn} onClick={() => setPaid(true)}>Tôi đã thanh toán</button>
        {paid && <span className={styles.paidOk}>✓ Đã xác nhận thanh toán</span>}
      </div>
    </div>
  );
}
