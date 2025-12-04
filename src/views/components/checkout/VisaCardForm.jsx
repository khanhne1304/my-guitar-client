import { useState, useEffect } from 'react';
import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

const VISA_CARD_STORAGE_KEY = 'saved_visa_card';

// Load saved card from localStorage
const loadSavedCard = () => {
  try {
    const saved = localStorage.getItem(VISA_CARD_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading saved card:', error);
  }
  return null;
};

// Save card to localStorage
const saveCardToStorage = (cardData) => {
  try {
    // Only save holder name and expiry date for security
    // Don't save card number and CVV
    const dataToSave = {
      cardHolder: cardData.cardHolder || '',
      expiryDate: cardData.expiryDate || '',
      // Store last 4 digits for display only
      last4: cardData.cardNumber ? cardData.cardNumber.slice(-4) : '',
    };
    localStorage.setItem(VISA_CARD_STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving card:', error);
    return false;
  }
};

export default function VisaCardForm({ cardInfo, onCardInfoChange, errors, setErrors }) {
  const [cardNumber, setCardNumber] = useState(cardInfo?.cardNumber || '');
  const [cardHolder, setCardHolder] = useState(cardInfo?.cardHolder || '');
  const [expiryDate, setExpiryDate] = useState(cardInfo?.expiryDate || '');
  const [cvv, setCvv] = useState(cardInfo?.cvv || '');
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSavedCard, setHasSavedCard] = useState(false);

  // Format card number: add spaces every 4 digits
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  // Format expiry date: MM/YY
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Validate card number (Visa starts with 4, 16 digits)
  const validateCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    if (!cleaned) return 'Vui lòng nhập số thẻ';
    if (!/^\d+$/.test(cleaned)) return 'Số thẻ chỉ được chứa chữ số';
    if (cleaned.length !== 16) return 'Số thẻ phải có 16 chữ số';
    if (!cleaned.startsWith('4')) return 'Thẻ Visa phải bắt đầu bằng số 4';
    return '';
  };

  // Validate card holder name
  const validateCardHolder = (value) => {
    if (!value.trim()) return 'Vui lòng nhập tên chủ thẻ';
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) return 'Tên chủ thẻ chỉ được chứa chữ cái';
    if (value.trim().length < 2) return 'Tên chủ thẻ phải có ít nhất 2 ký tự';
    return '';
  };

  // Validate expiry date
  const validateExpiryDate = (value) => {
    if (!value) return 'Vui lòng nhập ngày hết hạn';
    if (!/^\d{2}\/\d{2}$/.test(value)) return 'Định dạng: MM/YY';
    
    const [month, year] = value.split('/').map(Number);
    if (month < 1 || month > 12) return 'Tháng không hợp lệ';
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const fullYear = 2000 + year;
    
    if (fullYear < currentDate.getFullYear() || 
        (fullYear === currentDate.getFullYear() && month < currentMonth)) {
      return 'Thẻ đã hết hạn';
    }
    return '';
  };

  // Validate CVV
  const validateCVV = (value) => {
    if (!value) return 'Vui lòng nhập CVV';
    if (!/^\d+$/.test(value)) return 'CVV chỉ được chứa chữ số';
    if (value.length !== 3) return 'CVV phải có 3 chữ số';
    return '';
  };

  // Handle card number change
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    
    const error = validateCardNumber(formatted);
    setErrors((prev) => ({ ...prev, cardNumber: error }));
    
    onCardInfoChange({
      ...cardInfo,
      cardNumber: formatted.replace(/\s/g, ''),
    });
  };

  // Handle card holder change
  const handleCardHolderChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCardHolder(value);
    
    const error = validateCardHolder(value);
    setErrors((prev) => ({ ...prev, cardHolder: error }));
    
    onCardInfoChange({
      ...cardInfo,
      cardHolder: value,
    });
  };

  // Handle expiry date change
  const handleExpiryDateChange = (e) => {
    const value = e.target.value;
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    
    const error = validateExpiryDate(formatted);
    setErrors((prev) => ({ ...prev, expiryDate: error }));
    
    onCardInfoChange({
      ...cardInfo,
      expiryDate: formatted,
    });
  };

  // Handle CVV change
  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
    
    const error = validateCVV(value);
    setErrors((prev) => ({ ...prev, cvv: error }));
    
    onCardInfoChange({
      ...cardInfo,
      cvv: value,
    });
  };

  // Load saved card on mount
  useEffect(() => {
    const saved = loadSavedCard();
    if (saved && !cardInfo?.cardHolder) {
      // Only load if form is empty
      setCardHolder(saved.cardHolder || '');
      setExpiryDate(saved.expiryDate || '');
      setHasSavedCard(!!saved.last4);
      
      // Update parent with saved info (without card number and CVV for security)
      onCardInfoChange({
        cardNumber: '',
        cardHolder: saved.cardHolder || '',
        expiryDate: saved.expiryDate || '',
        cvv: '',
      });
    }
  }, []);

  // Sync with parent cardInfo changes
  useEffect(() => {
    if (cardInfo) {
      setCardNumber(cardInfo.cardNumber ? formatCardNumber(cardInfo.cardNumber) : '');
      setCardHolder(cardInfo.cardHolder || '');
      setExpiryDate(cardInfo.expiryDate || '');
      setCvv(cardInfo.cvv || '');
    }
  }, [cardInfo?.cardNumber, cardInfo?.cardHolder, cardInfo?.expiryDate, cardInfo?.cvv]);

  // Handle save button click
  const handleSave = () => {
    // Validate all fields before saving
    const cardNumberError = validateCardNumber(cardNumber);
    const cardHolderError = validateCardHolder(cardHolder);
    const expiryDateError = validateExpiryDate(expiryDate);
    const cvvError = validateCVV(cvv);

    const allErrors = {
      cardNumber: cardNumberError,
      cardHolder: cardHolderError,
      expiryDate: expiryDateError,
      cvv: cvvError,
    };

    setErrors(allErrors);

    // Check if there are any errors
    const hasErrors = Object.values(allErrors).some((error) => error !== '');

    if (hasErrors) {
      setSaveMessage('Vui lòng nhập đầy đủ và đúng thông tin thẻ!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Save to localStorage
    const cardData = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardHolder: cardHolder,
      expiryDate: expiryDate,
      cvv: cvv,
    };

    if (saveCardToStorage(cardData)) {
      setSaveMessage('Đã lưu thông tin thẻ thành công!');
      setHasSavedCard(true);
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Lỗi khi lưu thông tin thẻ!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className={styles['checkout__visa-form']}>
      <div className={styles['checkout__form-row']}>
        <div className={styles['checkout__form-group']}>
          <label className={styles['checkout__form-label']}>
            Số thẻ <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            className={`${styles['checkout__input']} ${errors?.cardNumber ? styles['checkout__input--error'] : ''}`}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
          />
          {errors?.cardNumber && (
            <span className={styles['checkout__error']}>{errors.cardNumber}</span>
          )}
        </div>
      </div>

      <div className={styles['checkout__form-row']}>
        <div className={styles['checkout__form-group']}>
          <label className={styles['checkout__form-label']}>
            Tên chủ thẻ <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            className={`${styles['checkout__input']} ${errors?.cardHolder ? styles['checkout__input--error'] : ''}`}
            placeholder="NGUYEN VAN A"
            value={cardHolder}
            onChange={handleCardHolderChange}
          />
          {errors?.cardHolder && (
            <span className={styles['checkout__error']}>{errors.cardHolder}</span>
          )}
        </div>
      </div>

      <div className={styles['checkout__form-row']} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className={styles['checkout__form-group']}>
          <label className={styles['checkout__form-label']}>
            Ngày hết hạn <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            className={`${styles['checkout__input']} ${errors?.expiryDate ? styles['checkout__input--error'] : ''}`}
            placeholder="MM/YY"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            maxLength={5}
          />
          {errors?.expiryDate && (
            <span className={styles['checkout__error']}>{errors.expiryDate}</span>
          )}
        </div>

        <div className={styles['checkout__form-group']}>
          <label className={styles['checkout__form-label']}>
            CVV <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            className={`${styles['checkout__input']} ${errors?.cvv ? styles['checkout__input--error'] : ''}`}
            placeholder="123"
            value={cvv}
            onChange={handleCVVChange}
            maxLength={3}
          />
          {errors?.cvv && (
            <span className={styles['checkout__error']}>{errors.cvv}</span>
          )}
        </div>
      </div>

      <div className={styles['checkout__form-row']}>
        <button
          type="button"
          className={styles['checkout__save-btn']}
          onClick={handleSave}
        >
          💾 Lưu thông tin thẻ
        </button>
        {saveMessage && (
          <div className={saveMessage.includes('thành công') ? styles['checkout__save-success'] : styles['checkout__save-error']}>
            {saveMessage}
          </div>
        )}
        {hasSavedCard && (
          <div className={styles['checkout__saved-info']}>
            ✓ Đã tải thông tin đã lưu (tên chủ thẻ và ngày hết hạn). Vui lòng nhập lại số thẻ và CVV để bảo mật.
          </div>
        )}
      </div>
    </div>
  );
}

