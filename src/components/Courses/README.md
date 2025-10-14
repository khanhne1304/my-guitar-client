# Course Components Documentation

## Tổng quan
Module Course Components cung cấp các component React để hiển thị và quản lý khóa học trong ứng dụng.

## Components

### 1. CourseCard.jsx
**Mục đích**: Hiển thị thông tin cơ bản của một khóa học dạng card

**Props**:
- `course` (Object): Dữ liệu khóa học
  - `_id`: ID khóa học
  - `title`: Tiêu đề
  - `description`: Mô tả
  - `thumbnail`: URL ảnh đại diện
  - `level`: Mức độ (beginner, intermediate, advanced)
  - `lessonCount`: Số bài học
  - `createdBy`: Thông tin người tạo
  - `createdAt`: Ngày tạo

**Tính năng**:
- Hiển thị thumbnail với fallback
- Badge level với màu sắc phù hợp
- Thông tin tóm tắt khóa học
- Nút "Xem chi tiết" link đến trang chi tiết

### 2. CourseList.jsx
**Mục đích**: Hiển thị danh sách khóa học với tìm kiếm và lọc

**Tính năng**:
- Grid layout responsive (1-4 columns)
- Tìm kiếm theo title và description
- Lọc theo level (beginner, intermediate, advanced)
- Pagination với navigation
- Loading skeleton
- Error handling với retry
- Empty state

**State Management**:
- `courses`: Danh sách khóa học
- `loading`: Trạng thái loading
- `error`: Lỗi nếu có
- `searchTerm`: Từ khóa tìm kiếm
- `selectedLevel`: Level được chọn
- `currentPage`: Trang hiện tại
- `pagination`: Thông tin phân trang

### 3. CourseDetail.jsx
**Mục đích**: Hiển thị chi tiết khóa học và danh sách bài học

**Tính năng**:
- Breadcrumb navigation
- Hiển thị đầy đủ thông tin khóa học
- Thumbnail với fallback
- Thông tin creator và ngày tạo
- Danh sách bài học (mock data)
- Action buttons (Bắt đầu học, Yêu thích)
- Loading skeleton
- Error handling

**Mock Data**:
- Sử dụng mock lessons vì chưa có Lesson model
- Có thể thay thế bằng API call thực tế

### 4. CourseForm.jsx
**Mục đích**: Form tạo mới hoặc chỉnh sửa khóa học

**Tính năng**:
- Form validation với error messages
- Preview section
- Character counters
- URL validation cho thumbnail
- Loading states
- Error handling
- Auto-detect edit mode từ URL params

**Form Fields**:
- `title`: Tiêu đề (required, 3-200 chars)
- `description`: Mô tả (optional, max 2000 chars)
- `thumbnail`: URL ảnh (optional, valid image URL)
- `level`: Mức độ (required, enum)

## Pages

### 1. CoursesPage.jsx
- Wrapper cho CourseList component
- Background styling

### 2. CourseDetailPage.jsx
- Wrapper cho CourseDetail component
- Background styling

### 3. AdminCourseNewPage.jsx
- Wrapper cho CourseForm component (create mode)
- Background styling

### 4. AdminCourseEditPage.jsx
- Wrapper cho CourseForm component (edit mode)
- Background styling

## Routing

Các routes đã được thêm vào `publicRoute.js`:

```javascript
{ path: "/courses", element: <CoursesPage /> },
{ path: "/courses/:id", element: <CourseDetailPage /> },
{ path: "/admin/courses/new", element: <AdminCourseNewPage /> },
{ path: "/admin/courses/:id/edit", element: <AdminCourseEditPage /> },
```

## Services

### courseService.js
Cung cấp các functions để gọi API:

- `getAllCourses(params)`: Lấy danh sách với filtering
- `getCourseById(id)`: Lấy chi tiết khóa học
- `createCourse(data)`: Tạo khóa học mới
- `updateCourse(id, data)`: Cập nhật khóa học
- `deleteCourse(id)`: Xóa khóa học
- `getCoursesByLevel(level)`: Lấy theo level
- `searchCourses(term)`: Tìm kiếm
- `getMyCourses()`: Lấy khóa học của user
- `addLessonToCourse(courseId, lessonId)`: Thêm bài học
- `removeLessonFromCourse(courseId, lessonId)`: Xóa bài học

## Styling

Sử dụng Tailwind CSS với:
- Responsive design
- Hover effects
- Loading animations
- Error states
- Form validation styling
- Card layouts
- Grid systems

## Error Handling

Tất cả components đều có:
- Loading states
- Error states với retry buttons
- Validation errors
- Network error handling
- Empty states

## Performance

- Debounced search (500ms)
- Pagination để giảm load
- Lazy loading cho images
- Optimized re-renders
- Error boundaries

## Testing

Để test các components:

1. **Manual Testing**:
   - Navigate to `/courses`
   - Test search và filter
   - Test pagination
   - Test course detail page
   - Test create/edit forms

2. **API Testing**:
   - Đảm bảo backend server đang chạy
   - Test với data thực tế
   - Test error scenarios

## Future Improvements

1. **Lesson Integration**:
   - Tích hợp với Lesson model
   - Video player component
   - Progress tracking

2. **User Features**:
   - Enrollment system
   - Progress tracking
   - Reviews và ratings
   - Favorites

3. **Admin Features**:
   - Bulk operations
   - Analytics dashboard
   - Content management

4. **Performance**:
   - Virtual scrolling cho large lists
   - Image optimization
   - Caching strategies
