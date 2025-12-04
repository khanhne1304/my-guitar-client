import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
import VisaCardForm from './VisaCardForm';
import { useState } from 'react';

export default function PaymentMethods({ method, setMethod, onSwitch, cardInfo, onCardInfoChange }) {
  const opt = [
    { id: 'cod', label: 'Thanh toán khi giao hàng (COD)' },
    { id: 'onpay-visa', label: 'Thẻ Visa (VNPay)' },
  ];

  const [errors, setErrors] = useState({});

  return (
    <div>
      {opt.map((o) => (
        <div key={o.id}>
          <label className={styles['checkout__pay-row']}>
            <input
              type="radio"
              name="pay"
              value={o.id}
              checked={method === o.id}
              onChange={(e) => {
                onSwitch?.();
                setMethod(e.target.value);
                // Reset errors when switching payment method
                if (e.target.value !== 'onpay-visa') {
                  setErrors({});
                  // Reset card info when switching away from Visa
                  if (onCardInfoChange) {
                    onCardInfoChange({
                      cardNumber: '',
                      cardHolder: '',
                      expiryDate: '',
                      cvv: '',
                    });
                  }
                }
              }}
            />
            <span>{o.label}</span>
          </label>
          {method === 'onpay-visa' && o.id === 'onpay-visa' && (
            <VisaCardForm
              cardInfo={cardInfo}
              onCardInfoChange={onCardInfoChange}
              errors={errors}
              setErrors={setErrors}
            />
          )}
        </div>
      ))}
    </div>
  );
}
