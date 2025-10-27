# Hướng dẫn Debug Course API

## Vấn đề: API lấy được danh sách khóa học nhưng giao diện không hiển thị

### Bước 1: Kiểm tra API Backend
```bash
# Kiểm tra API backend có hoạt động không
curl -X GET "http://localhost:4000/api/courses" -H "Content-Type: application/json"
```

### Bước 2: Kiểm tra Frontend
1. Mở browser và truy cập `http://localhost:3000/courses`
2. Mở Developer Tools (F12)
3. Vào tab Console
4. Chạy các lệnh debug sau:

```javascript
// Kiểm tra network requests
checkNetworkRequests();

// Debug API calls
debugCourseAPI();

// Test với các tham số khác nhau
testCourseAPIWithParams();
```

### Bước 3: Kiểm tra Network Tab
1. Vào tab Network trong Developer Tools
2. Reload trang `/courses`
3. Tìm request đến `/api/courses`
4. Kiểm tra:
   - Status code (200, 404, 500, etc.)
   - Response body
   - Request headers
   - CORS errors

### Bước 4: Kiểm tra Console Errors
Tìm các lỗi có thể gặp:
- CORS errors
- Network errors
- JavaScript errors
- API response format errors

### Bước 5: Kiểm tra Component State
Trong Console, chạy:
```javascript
// Kiểm tra component state
const courseListElement = document.querySelector('[class*="courseList"]');
console.log('Course list element:', courseListElement);

// Kiểm tra React DevTools
// Cài đặt React Developer Tools extension
```

## Các nguyên nhân có thể gặp:

### 1. CORS Issues
- Backend không cho phép frontend gọi API
- Kiểm tra CORS configuration trong server.js

### 2. URL Configuration
- Kiểm tra BASE_URL trong apiClient.js
- Kiểm tra environment variables

### 3. Response Format
- API trả về format khác với expected
- Kiểm tra response.data.courses vs response.courses

### 4. Component Rendering
- Component không re-render sau khi nhận data
- State không được update đúng cách

### 5. CSS Issues
- Component bị ẩn bởi CSS
- Layout issues

## Debug Commands Available:

```javascript
// Test basic API
debugCourseAPI();

// Test with different parameters
testCourseAPIWithParams();

// Check network capabilities
checkNetworkRequests();

// Test course service directly
testCourseAPI();

// Test creating course (requires auth)
testCreateCourse();
```

## Expected Response Format:
```json
{
  "success": true,
  "message": "Lấy danh sách khóa học thành công",
  "data": {
    "courses": [
      {
        "_id": "1",
        "title": "Guitar Cơ Bản",
        "slug": "guitar-co-ban",
        "level": "beginner",
        "thumbnail": "/images/guitar-basic.jpg",
        "summary": "Khóa học guitar cơ bản cho người mới bắt đầu",
        "durationWeeks": 4,
        "lessonCount": 10
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## Troubleshooting Steps:

1. **Kiểm tra API trực tiếp**: `curl http://localhost:4000/api/courses`
2. **Kiểm tra frontend console**: Mở F12 và xem console errors
3. **Kiểm tra network tab**: Xem request/response
4. **Kiểm tra component state**: Sử dụng React DevTools
5. **Test API từ frontend**: Sử dụng debug commands

## Common Issues & Solutions:

### Issue 1: CORS Error
**Solution**: Kiểm tra CORS config trong server.js
```javascript
// server.js
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
};
```

### Issue 2: Wrong API URL
**Solution**: Kiểm tra BASE_URL trong apiClient.js
```javascript
const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000/api';
```

### Issue 3: Response Format Mismatch
**Solution**: Kiểm tra response structure trong courseService.js
```javascript
// Expected: response.data.courses
// Actual: response.courses
```

### Issue 4: Component Not Re-rendering
**Solution**: Kiểm tra useEffect dependencies và state updates
```javascript
useEffect(() => {
  // Make sure this runs when data changes
}, [courses]);
```

Hãy chạy các debug commands và cho tôi biết kết quả để tôi có thể giúp bạn sửa lỗi cụ thể!
