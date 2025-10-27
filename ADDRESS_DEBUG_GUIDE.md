# Hướng dẫn Debug Lỗi Địa chỉ

## 🔍 Cách Debug Lỗi Không Load Được Địa chỉ

### 1. Sử dụng Debug Tool
Mở Developer Console (F12) và chạy:
```javascript
debugAddressLoading()
```

Tool này sẽ kiểm tra:
- ✅ Token có tồn tại không
- ✅ User data có hợp lệ không  
- ✅ API calls có hoạt động không
- ✅ Response data có đúng format không

### 2. Các Lỗi Thường Gặp

#### **Lỗi: "Bạn cần đăng nhập để xem địa chỉ"**
- **Nguyên nhân**: Token không tồn tại hoặc đã hết hạn
- **Giải pháp**: 
  - Đăng nhập lại
  - Kiểm tra localStorage có token không
  - Clear cache và thử lại

#### **Lỗi: "Có lỗi khi tải danh sách địa chỉ"**
- **Nguyên nhân**: API call thất bại
- **Giải pháp**:
  - Kiểm tra server có chạy không (http://localhost:4000)
  - Kiểm tra network tab trong DevTools
  - Thử nút "Thử lại" trong UI

#### **Lỗi: "Request failed: 401"**
- **Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
- **Giải pháp**: Đăng nhập lại

#### **Lỗi: "Request failed: 500"**
- **Nguyên nhân**: Lỗi server
- **Giải pháp**: Kiểm tra server logs

### 3. Kiểm tra Network Requests

1. Mở DevTools → Network tab
2. Reload trang checkout
3. Tìm các request đến `/api/addresses`
4. Kiểm tra:
   - Status code (200 = OK, 401 = Unauthorized, 500 = Server Error)
   - Response body
   - Request headers (có Authorization header không)

### 4. Kiểm tra Console Logs

Các log quan trọng:
- `✅ Addresses loaded successfully:` - Load thành công
- `❌ Load addresses error:` - Load thất bại
- `🔄 Syncing form with default address:` - Sync địa chỉ mặc định
- `🔄 Retrying address load...` - Đang retry

### 5. Test Cases

#### Test Case 1: User chưa đăng nhập
- Kết quả mong đợi: Hiển thị "Bạn cần đăng nhập để xem địa chỉ"

#### Test Case 2: User đã đăng nhập nhưng chưa có địa chỉ
- Kết quả mong đợi: Hiển thị "Bạn chưa có địa chỉ nào"

#### Test Case 3: User có địa chỉ
- Kết quả mong đợi: Load được danh sách địa chỉ và auto-select default

#### Test Case 4: API lỗi
- Kết quả mong đợi: Hiển thị error message và nút "Thử lại"

### 6. Troubleshooting Steps

1. **Kiểm tra Server**
   ```bash
   cd my-guitar-server
   npm run dev
   ```

2. **Kiểm tra Client**
   ```bash
   cd my-guitar-client  
   npm start
   ```

3. **Clear Browser Data**
   - Clear localStorage
   - Clear cookies
   - Hard refresh (Ctrl+Shift+R)

4. **Kiểm tra Database**
   - Đảm bảo MongoDB đang chạy
   - Kiểm tra collection `addresses` có data không

### 7. Các Cải Tiến Đã Thực Hiện

- ✅ Cải thiện error handling trong AddressContext
- ✅ Thêm loading states và error messages
- ✅ Thêm retry mechanism
- ✅ Sync giữa CheckoutViewModel và AddressContext
- ✅ Thêm debug tool
- ✅ Cải thiện UI/UX cho error states

### 8. Liên Hệ

Nếu vẫn gặp vấn đề, hãy:
1. Chạy `debugAddressLoading()` và copy output
2. Screenshot error message
3. Copy network requests từ DevTools
4. Báo cáo với thông tin chi tiết
