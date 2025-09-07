// RegisterModel.js
export class RegisterForm {
  constructor() {
    this.username = '';
    this.email = '';
    this.fullName = '';
    this.address = '';
    this.phone = '';
    this.password = '';
    this.confirm = '';
  }
}

export class User {
  constructor({
    id,
    username,
    name,
    email,
    phone,
    address,
    createdAt,
  }) {
    this.id = id;
    this.username = username;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.createdAt = createdAt;
  }
}
