# Hướng Dẫn Sử Dụng Hệ Thống Khóa Học Guitar

## 🎯 Tổng Quan

Hệ thống khóa học guitar đã được tích hợp hoàn chỉnh vào ứng dụng với đầy đủ tính năng:

- ✅ **Danh sách khóa học** với filter theo level
- ✅ **Chi tiết khóa học** với modules và lessons
- ✅ **Giao diện học bài** với metronome tích hợp
- ✅ **Adaptive learning** - gợi ý bài học thông minh
- ✅ **Progress tracking** - theo dõi tiến độ học tập

## 🚀 Cách Truy Cập

### 1. Từ Menu Chính
- Click vào **"Khóa học"** trong menu header
- Hoặc truy cập trực tiếp: `http://localhost:3000/courses`

### 2. URL Routes
- `/courses` - Danh sách khóa học
- `/courses/:slug` - Chi tiết khóa học
- `/learning/:slug/lessons/:ml` - Học bài (ml = "1.3")

## 📚 Cấu Trúc Khóa Học

### 3 Khóa Học Mẫu:

#### 1. **Guitar Cơ Bản** (8 tuần)
- **Module 1**: Làm quen với Guitar
  - Tư thế cầm đàn và cơ bản
  - Tuning đàn guitar
- **Module 2**: Hợp âm cơ bản
  - Hợp âm C (C Major)
  - Hợp âm G (G Major)
- **Module 3**: Tiết tấu cơ bản
  - Tiết tấu D D U U D U
- **Module 4**: Bài hát đầu tiên
  - Happy Birthday - Đơn giản

#### 2. **Guitar Trung Cấp** (10 tuần)
- **Module 1**: Scale đầu tiên
  - Scale C Major
- **Module 2**: Power Chords
  - Power Chord cơ bản

#### 3. **Guitar Nâng Cao** (12 tuần)
- **Module 1**: Barre Chords
  - F Major Barre Chord

## 🎵 Tính Năng Chính

### 1. **Danh Sách Khóa Học**
- Filter theo level: Cơ bản, Trung cấp, Nâng cao
- Tìm kiếm theo tên khóa học
- Hiển thị thông tin: số bài học, thời lượng, level

### 2. **Chi Tiết Khóa Học**
- Thông tin tổng quan khóa học
- Danh sách modules và lessons
- Click vào lesson để bắt đầu học
- Hiển thị tiến độ học tập (nếu đã đăng nhập)

### 3. **Giao Diện Học Bài**
- **Mục tiêu học tập**: Hiển thị objectives của bài học
- **Nội dung**: Text, video, audio, tabs, chords
- **Practice Checklist**: Danh sách việc cần làm
- **Metronome**: BPM control, volume control
- **Practice Log**: Ghi log luyện tập với BPM và ghi chú
- **Nút hoàn thành**: Đánh dấu hoàn thành bài học

### 4. **Metronome Tích Hợp**
- Sử dụng Web Audio API
- BPM control từ 60-200
- Volume control
- Visual indicator
- Start/Stop functionality

### 5. **Adaptive Learning**
- Hệ thống gợi ý bài học tiếp theo
- Kiểm tra prerequisites
- Chỉ unlock bài mới khi đạt >= 70 điểm
- Theo dõi acquiredSkills

## 🔧 Cách Sử Dụng

### 1. **Xem Danh Sách Khóa Học**
```
1. Truy cập /courses
2. Sử dụng filter để lọc theo level
3. Tìm kiếm theo tên khóa học
4. Click vào khóa học để xem chi tiết
```

### 2. **Học Bài**
```
1. Từ chi tiết khóa học, click vào lesson
2. Đọc mục tiêu học tập
3. Xem nội dung (video, text, tabs, chords)
4. Luyện tập với metronome
5. Tick vào checklist
6. Ghi log luyện tập
7. Click "Hoàn thành bài học"
```

### 3. **Sử Dụng Metronome**
```
1. Bật metronome trong giao diện học bài
2. Điều chỉnh BPM (60-200)
3. Điều chỉnh volume
4. Click "Chạy" để bắt đầu
5. Click "Dừng" để dừng
```

## 🎨 UI/UX Features

### 1. **Responsive Design**
- Tối ưu cho desktop, tablet, mobile
- Grid layout cho danh sách khóa học
- Card design cho khóa học

### 2. **Interactive Elements**
- Hover effects trên cards
- Loading states
- Error handling
- Success messages

### 3. **Visual Indicators**
- Level badges (Cơ bản, Trung cấp, Nâng cao)
- Lesson type badges (Lý thuyết, Hợp âm, Tiết tấu, Bài hát, Luyện tập)
- Progress indicators
- Status indicators (Hoàn thành, Đang học)

## 🔗 API Integration

### 1. **Course Service**
```javascript
// Lấy danh sách khóa học
const courses = await getCourses();

// Lấy chi tiết khóa học
const course = await getCourseById(slug);

// Lấy chi tiết bài học
const lesson = await getCourseById(`${slug}/lessons/${ml}`);
```

### 2. **Progress Service**
```javascript
// Bắt đầu học bài
await startLesson(courseId, lessonKey);

// Ghi log luyện tập
await logPractice(lessonKey, minutes, bpm, notes);

// Hoàn thành bài học
await completeLesson(lessonKey, score, acquiredSkills);

// Lấy bài học tiếp theo
const nextLesson = await getNextLesson(courseSlug);
```

## 🐛 Troubleshooting

### 1. **Không Load Được Khóa Học**
- Kiểm tra backend có đang chạy không
- Kiểm tra API connection
- Chạy `npm run seed:courses` để seed dữ liệu

### 2. **Metronome Không Hoạt Động**
- Kiểm tra browser support cho Web Audio API
- Đảm bảo user đã interact với page
- Kiểm tra console cho errors

### 3. **Links Không Hoạt Động**
- Kiểm tra routes trong AppRouter.jsx
- Đảm bảo components được import đúng
- Kiểm tra URL parameters

## 📈 Mở Rộng

### 1. **Thêm Khóa Học Mới**
1. Cập nhật `seedCourses.js`
2. Chạy `npm run seed:courses`
3. Hoặc sử dụng API để tạo course mới

### 2. **Customize UI**
- Cập nhật CSS modules
- Thêm animations
- Cải thiện responsive design

### 3. **Thêm Tính Năng**
- Social features
- Gamification
- Advanced analytics
- Mobile app

## ✅ Kết Luận

Hệ thống khóa học guitar đã được tích hợp hoàn chỉnh với:

- ✅ **3 khóa học mẫu** với nội dung phong phú
- ✅ **Giao diện học bài** hoàn chỉnh
- ✅ **Metronome tích hợp** với Web Audio API
- ✅ **Adaptive learning** thông minh
- ✅ **Progress tracking** chi tiết
- ✅ **Responsive design** cho mọi thiết bị

Hệ thống sẵn sàng để sử dụng và có thể mở rộng thêm nhiều tính năng khác! 🎸
