import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

export default function PaymentMethods({ method, setMethod, onSwitch }) {
  const opt = [
    { id: 'cod', label: 'Thanh toán khi giao hàng (COD)' },
    { id: 'onpay-atm', label: 'Thanh toán online bằng thẻ ATM nội địa & ví điện tử (VNPay)' },
    { id: 'onpay-visa', label: 'Thẻ Visa/Master/JCB/American Express/CUP (VNPay)' },
    { id: 'onpay-installment', label: 'Thanh toán trả góp qua thẻ tín dụng (≥ 5.000.000đ)' },
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
