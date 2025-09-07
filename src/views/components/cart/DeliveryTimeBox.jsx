import styles from '../../pages/CartPage/CartPage.module.css';

export default function DeliveryTimeBox({
  shipMode,
  setShipMode,
  dayOption,
  setDayOption,
  customDate,
  setCustomDate,
  timeSlot,
  setTimeSlot,
  confirmed,
  setConfirmed,
  onConfirm,
}) {
  return (
    <div className={styles['cart__ship-time-box']}>
      <div className={styles['cart__ship-header']}>THỜI GIAN GIAO HÀNG</div>

      <label className={styles['cart__radio']}>
        <input
          type="radio"
          name="shipmode"
          value="instock"
          checked={shipMode === 'instock'}
          onChange={(e) => {
            setShipMode(e.target.value);
            setConfirmed(false);
          }}
        />
        Giao khi có hàng
      </label>

      <label className={styles['cart__radio']}>
        <input
          type="radio"
          name="shipmode"
          value="schedule"
          checked={shipMode === 'schedule'}
          onChange={(e) => {
            setShipMode(e.target.value);
            setConfirmed(false);
          }}
        />
        Chọn thời gian
      </label>

      {shipMode === 'schedule' && (
        <div className={styles['cart__time-row']}>
          <div className={styles['cart__col']}>
            <label>Ngày giao</label>
            <div className={styles['cart__inline']}>
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

              {dayOption === 'custom' && (
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

          <div className={styles['cart__col']}>
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

      <button className={styles['cart__confirm-btn']} onClick={onConfirm}>
        XÁC NHẬN THỜI GIAN
      </button>

      {confirmed ? (
        <div className={styles['cart__confirm-ok']}>
          ✓ Đã xác nhận thời gian giao
        </div>
      ) : (
        <div className={styles['cart__confirm-warn']}>
          Vui lòng xác nhận thời gian giao trước khi thanh toán
        </div>
      )}
    </div>
  );
}
