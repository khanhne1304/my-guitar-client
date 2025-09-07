// ProductsModel.js

// Định nghĩa Product
export class Product {
  constructor({ id, name, slug, category, price, image }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.category = category;
    this.price = price;
    this.image = image;
  }
}

// Định nghĩa Category
export class Category {
  constructor({ id, name, slug, image }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.image = image;
  }
}
