// CategoryModel.js

export class CategoryState {
  constructor({ slug = '', products = [], loading = false, err = '' }) {
    this.slug = slug;
    this.products = products;
    this.loading = loading;
    this.err = err;
  }
}
