// HomeModel.js

export class HomeState {
  constructor({ products = [], loading = false, err = '' }) {
    this.products = products;
    this.loading = loading;
    this.err = err;
  }
}
