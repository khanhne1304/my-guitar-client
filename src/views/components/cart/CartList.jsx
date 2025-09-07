// src/components/cart/CartList.jsx
import styles from '../../pages/CartPage/CartPage.module.css';
import { fmtVND } from '../../../utils/currency';
import CartItemRow from './CartItemRow';

// Ưu tiên cartItemId để key ổn định; rồi mới tới productId và các fallback khác
const ensureId = (obj) =>
  obj?.cartItemId ||
  obj?.productId ||
  obj?._id || // fallback (có thể trùng với cartItemId ở vài backend)
  obj?.id ||
  obj?.product?._id ||
  obj?.slug ||
  null;

export default function CartList({ items, onDec, onInc, onUpdate, onRemove }) {
  const list = Array.isArray(items) ? items : [];

  const decorated = list.map((x, idx) => {
    const _key = ensureId(x) ?? `cart-item-${idx}`;
    return { ...x, _fmtPrice: fmtVND(Number(x?.price) || 0), _key };
  });

  return (
    <div className={styles['cart__list']}>
      {decorated.map((item) => (
        <CartItemRow
          key={item._key}
          item={item}
          // Truyền chính item: parent handlers sẽ tự rút id/qty (đã hỗ trợ cả item hoặc id)
          onDec={() => onDec?.(item)}
          onInc={() => onInc?.(item)}
          onUpdate={(nextQty) => onUpdate?.(item, nextQty)}
          onRemove={() => onRemove?.(item)}
        />
      ))}
    </div>
  );
}
