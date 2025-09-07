// CartModel.js

export class CartState {
  constructor({
    cartItems = [],
    subtotal = 0,
    loading = false,
    note = '',
    invoice = false,
    agree = false,
  }) {
    this.cartItems = cartItems;
    this.subtotal = subtotal;
    this.loading = loading;
    this.note = note;
    this.invoice = invoice;
    this.agree = agree;
  }
}
