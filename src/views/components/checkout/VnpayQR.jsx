import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
import { fmtVND } from '../../../utils/currency'; 

export default function VnpayQR({
  visible, showQR, setShowQR, paid, setPaid, orderId, total, orderInfo, qrUrl
}) {
  if (!visible || !showQR) return null;

  return (
    <div className={styles['checkout__qr-box']}>
      <div className={styles['checkout__qr-title']}>Thanh toán VNPay QR</div>

      <div className={styles['checkout__qr-meta']}>
        <div>
          <div>Mã đơn: <b>{orderId}</b></div>
          <div>Số tiền: <b>{fmtVND(total)}</b></div>
          <div>Nội dung: <b>{orderInfo}</b></div>
        </div>
        <img className={styles['checkout__qr-img']} src={qrUrl} alt="VNPay QR" />
      </div>

      <div className={styles['checkout__qr-note']}>
        * Quét mã bằng ứng dụng ngân hàng/VNPay. (Demo, không phát sinh giao dịch thật)
      </div>

      <div className={styles['checkout__qr-actions']}>
        <button
          className={styles['checkout__btn--dark']}   
          onClick={() => setPaid(true)}
        >
          Tôi đã thanh toán
        </button>
        {paid && (
          <span className={styles['checkout__paid-ok']}>
            ✓ Đã xác nhận thanh toán
          </span>
        )}
      </div>
    </div>
  );
}
