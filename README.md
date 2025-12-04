# MyGuitar - Ứng dụng bán nhạc cụ trực tuyến

My Guitar là một nền tảng thương mại điện tử kết hợp công cụ học nhạc, mang đến cho người dùng trải nghiệm toàn diện trong việc mua sắm và học tập nhạc cụ, đặc biệt là guitar.
Hệ thống cho phép người dùng dễ dàng duyệt sản phẩm, đặt hàng, theo dõi đơn hàng, đồng thời luyện tập và khám phá âm nhạc ngay trên cùng một ứng dụng.

## Các tính năng chính

### Trang người dùng (Client)

* **Xác thực người dùng**
  Đăng ký, đăng nhập, quên mật khẩu, đặt lại mật khẩu qua **OTP**.
* **Duyệt sản phẩm**
  Xem danh mục, sản phẩm nổi bật, sản phẩm khuyến mãi và chi tiết sản phẩm.
* **Tìm kiếm & Lọc nâng cao**
  Theo từ khóa, danh mục, khoảng giá, sắp xếp và phân trang.
* **Chi tiết sản phẩm**
  Hiển thị hình ảnh, thông tin, đánh giá và sản phẩm liên quan.
* **Giỏ hàng**
  Thêm, cập nhật số lượng, xóa sản phẩm; lưu giỏ hàng cục bộ (LocalStorage).
* **Thanh toán (Checkout)**

  * Xem trước đơn hàng (địa chỉ, phí vận chuyển, voucher).
  * Hỗ trợ thanh toán khi nhận hàng (**COD**).
* **Quản lý đơn hàng**
  Xem lịch sử và theo dõi trạng thái đơn hàng theo thời gian thực.
* **Tài khoản người dùng**
  Cập nhật hồ sơ, đổi mật khẩu, quản lý sổ địa chỉ.
* **Tính năng tương tác**
  Thêm sản phẩm yêu thích, viết và đọc đánh giá.
* **Voucher**
  Tìm kiếm, lưu và áp dụng mã giảm giá khi thanh toán.
* **Công cụ luyện tập âm nhạc**

  *  **Tuner (Máy lên dây)**
  *  **Metronome (Máy đếm nhịp)**
  *  **Thư viện & chi tiết hợp âm**
  *  **Luyện hợp âm và guitar ảo**

### Trang quản trị (Admin)

* **Dashboard tổng quan**: giao diện điều khiển trung tâm (`AdminPage`).
* **Quản lý sản phẩm**: thêm, sửa, xóa, xem chi tiết qua API backend.
* **Quản lý danh mục & thương hiệu (Category/Brand)**: CRUD đầy đủ.
* **Quản lý đơn hàng**: xem danh sách, chi tiết, cập nhật trạng thái.
* **Quản lý voucher (Coupon)**: tạo, chỉnh sửa và hủy mã giảm giá.
* **Quản lý người dùng**: xem và cập nhật thông tin cơ bản.
* **Thông báo hệ thống**: chuông thông báo và trang trung tâm thông báo.
  
## Các công nghệ sử dụng
### Frontend
#### User: 
* **React (CRA + CRACO)** 

* **JavaScript (ES6+)** 

* **CSS Modules và style tùy biến** 

* **Hooks tùy chỉnh (sử dụng services + hooks tự viết)** 

* **Context API (Auth, Cart, Category, Practice, Favorites)**

* **Router tùy chỉnh (AppRouter)**
#### Admin: 
* **RReact**

* **Trang quản trị riêng (AdminPage)**

* **State management qua Context/ViewModel**
  
### Backend

* **Node.js, Express** 

* **MongoDB, Mongoose** 

* **JSON Web Token (JWT)** 

* **Middleware**  xác thực và xử lý lỗi tùy chỉnh 

* **Script seed dữ liệu (Admin, Coupon, Danh mục, Sản phẩm)**
  
## Công cụ phát triển
* **Postman / REST Client để kiểm thử API** 

* **Git & GitHub để quản lý phiên bản mã nguồn**
## Cấu trúc dự án
Dự án được chia làm 2 phần là giao diện (client) và máy chủ (server/backend – API)

```text
Nhom16-Source_code/
├── my-guitar-server/                 # Backend (Node.js, Express, MongoDB)
│   ├── src/
│   │   ├── config/                   # Cấu hình (kết nối DB, biến môi trường)
│   │   ├── controllers/              # Xử lý request/response theo module
│   │   ├── middlewares/              # Auth JWT, xử lý lỗi
│   │   ├── models/                   # Schema Mongoose (User, Product, Order, ...)
│   │   ├── routes/                   # Định tuyến REST API theo tài nguyên
│   │   ├── services/                 # Logic nghiệp vụ tái sử dụng
│   │   ├── utils/                    # Tiện ích (lọc/sort/paginate)
│   │   └── validators/               # Validate dữ liệu đầu vào
│   ├── scripts/                      # Seed dữ liệu (admin, coupon)
│   ├── server.js                     # Khởi tạo app, mount middleware & routes
│   ├── package.json
│   └── README.md
└── my-guitar-client/                 # Frontend người dùng (React + CRA + craco)
    ├── public/                       # Tài nguyên tĩnh (favicon, manifest, logo)
    ├── src/
    │   ├── assets/                   # Ảnh/SVG (guitar chord)
    │   ├── components/               # Component tái sử dụng (OTP, Notification, Practice, Guitar ảo)
    │   ├── Constants/                # Hằng số hiển thị (cover danh mục)
    │   ├── context/                  # React Context (Auth, Cart, Category, Favorites, Practice, Address)
    │   ├── data/                     # Dữ liệu hợp âm, tông
    │   ├── helpers/                  # Tiện ích nghiệp vụ (địa lý, vận chuyển, bài hát)
    │   ├── hooks/                    # Custom hooks (products, price, delivery, ...)
    │   ├── models/                   # Mô hình dữ liệu cho view
    │   ├── routers/                  # Cấu hình router ứng dụng
    │   ├── services/                 # Gọi API (auth, user, product, order, cart, ...)
    │   ├── utils/                    # Tiện ích chung (currency, pricing, storage, validators, audio)
    │   ├── viewmodels/               # ViewModel cho từng tính năng/trang
    │   ├── views/
    │   │   ├── components/           # Bộ UI theo trang
    │   │   ├── layouts/              # Khung layout
    │   │   └── pages/                # Trang: Home, Products, Details, Cart, Checkout, Songs, Tools,...
    │   ├── App.js                    # Entry React app
    │   ├── index.js                  # Mount React root
    │   └── index.css                 # Style global
    ├── craco.config.js               # Cấu hình build (CRA customization)
    ├── package.json
    └── README.md
``` 
## Yêu cầu hệ thống
* Node.js >= 16 (khuyến nghị >= 18) và npm/yarn
* MongoDB (chạy local hoặc dịch vụ cloud như Atlas)
* Postman hoặc tương đương (kiểm thử API)
* Trình duyệt hiện đại (Chrome/Edge/Firefox) để chạy client
* Trình soạn thảo mã (VS Code khuyến nghị)
  
## Hướng dẫn cài đặt
### 1 Tạo một thư mục chứa dự án
### 2 Truy cập vào thư mục vừa tạo
Mở bằng các trình terminal riêng biệt cho Frontend và Backe4 Backend:
#### Clone repository:
```text
gỉt clone: https://github.com/khanhne1304/my-guitar-server.git
cd my-guitar-server
```
#### Cài đặt dependency
``` text
npm install
```
## Chạy dự án
Mở chương trình trong 2 terminal riêng biệt
### Terminal 1: Chạy Frontend
```text
npm run start
```
### Terminal 2: Chạy Backend
```text
npm run 
```
Sau khi chạy thành công chương trình sẽ có thể truy cập ở http://localhost:3000
