// AccountModel.js

export class AccountUser {
  constructor({
    id,
    name,
    fullName,
    email,
    username,
    phone,
    phoneNumber,
    address,
    createdAt,
    created_at,
  }) {
    this.id = id;
    this.name = name;
    this.fullName = fullName;
    this.email = email;
    this.username = username;
    this.phone = phone;
    this.phoneNumber = phoneNumber;
    this.address = address;
    this.createdAt = createdAt || created_at;
  }
}
