import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

export default function PaymentMethods({ method, setMethod, onSwitch }) {
  const opt = [
    { id: 'cod', label: 'Thanh toán khi giao hàng (COD)' },
    { id: 'vnpay', label: 'Thanh toán online qua VNPay (ATM nội địa / QR)' },
  ];

  return (
    <div>
      {opt.map((o) => (
        <label key={o.id} className={styles['checkout__pay-row']}>
          <input
            type="radio"
            name="pay"
            value={o.id}
            checked={method === o.id}
            onChange={(e) => {
              onSwitch?.();
              setMethod(e.target.value);
            }}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
