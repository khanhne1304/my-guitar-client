// CheckoutModel.js

export class CheckoutForm {
  constructor() {
    this.name = '';
    this.phone = '';
    this.email = '';
    this.country = 'Vietnam';
    this.address = '';
    this.district = '';
    this.method = 'cod';
    this.note = '';
  }
}

export class CheckoutOrder {
  constructor({ orderId, subtotal, shipFee, total }) {
    this.orderId = orderId;
    this.subtotal = subtotal;
    this.shipFee = shipFee;
    this.total = total;
  }
}
