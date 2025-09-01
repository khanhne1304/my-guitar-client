
import styles from '../../pages/CartPage/cart.module.css';
    import { fmtVND } from '../../../untils/currency';
    import CartItemRow from './CartItemRow';


    export default function CartList({ items, onDec, onInc, onUpdate, onRemove }) {
    const decorated = (items || []).map((x) => ({ ...x, _fmtPrice: fmtVND(x.price) }));
    return (
    <div className={styles.list}>
    {decorated.map((item) => (
    <CartItemRow
    key={item._id}
    item={item}
    onDec={onDec}
    onInc={onInc}
    onUpdate={onUpdate}
    onRemove={onRemove}
    />
    ))}
    </div>
    );
    }