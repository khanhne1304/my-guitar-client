// ProductDetailsModel.js

export class Product {
  constructor({
    _id,
    slug,
    name,
    sku,
    price,
    stock,
    brand,
    category,
    images,
    highlights,
    gifts,
    createdAt,
  }) {
    this._id = _id;
    this.slug = slug;
    this.name = name;
    this.sku = sku;
    this.price = price;
    this.stock = stock;
    this.brand = brand;
    this.category = category;
    this.images = images || [];
    this.highlights = highlights || [];
    this.gifts = gifts || [];
    this.createdAt = createdAt;
  }
}

export class GalleryImage {
  constructor({ url, alt }) {
    this.url = url;
    this.alt = alt;
  }
}
