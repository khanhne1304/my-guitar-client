# Tích hợp Nhận diện Hợp âm vào Giao diện

## ✅ Các thay đổi đã thực hiện

### 1. Cập nhật Service (`src/services/aiPracticeService.js`)
- ✅ Thêm method `analyzeAudioWithChords()` để gọi API endpoint mới

### 2. Cập nhật Component (`src/views/pages/ToolsPage/AIPracticePage/AIPracticePage.jsx`)
- ✅ Thay đổi `handleAnalyze()` để sử dụng `analyzeAudioWithChords()` thay vì `analyzeAudioClip()`
- ✅ Thêm hiển thị card "Nhận diện hợp âm" với:
  - Chord metrics (accuracy, confidence, coverage, số segments)
  - Timeline của predicted chords với timestamps và confidence
- ✅ Cập nhật text button: "Phân tích với nhận diện hợp âm"
- ✅ Cập nhật subtitle để mô tả chính xác tính năng

### 3. Cập nhật Styles (`AIPracticePage.module.css`)
- ✅ Thêm styles cho chord metrics display
- ✅ Thêm styles cho chord timeline/list
- ✅ Responsive design cho các card mới

## 📊 Cấu trúc dữ liệu Response

Component hiện nhận response với cấu trúc:

```javascript
{
  success: true,
  data: {
    file: { originalname, mimetype, size },
    chordRecognition: {
      predicted_chords: [
        { time: 0.0, duration: 4.83, predicted_chord: "B:maj", confidence: 0.58 }
      ],
      metrics: {
        chord_accuracy: 1.0,
        mean_chord_confidence: 0.49,
        chord_coverage: 0.98,
        n_chord_segments: 8
      }
    },
    features: { ... },
    scores: {
      regression: { overall_score: 81.2, ... },
      classification: { level_class: 2 }
    }
  }
}
```

## 🎨 Giao diện mới

### Card "Nhận diện hợp âm"

Hiển thị:
1. **Metrics**:
   - Độ chính xác hợp âm (nếu có ground truth)
   - Độ tin cậy trung bình
   - Độ phủ (coverage)
   - Số đoạn hợp âm

2. **Timeline**:
   - Danh sách các hợp âm được nhận diện
   - Timestamp (start - end)
   - Tên hợp âm
   - Confidence score

3. **Lưu ý**:
   - Hiển thị khi không có ground truth

## 🔄 Workflow

```
User uploads audio
    ↓
Click "Phân tích với nhận diện hợp âm"
    ↓
Frontend calls: aiPracticeService.analyzeAudioWithChords()
    ↓
API: POST /api/ai/practice/analyze-with-chords
    ↓
Backend processes with chord recognition
    ↓
Response with chordRecognition + scores
    ↓
UI displays:
  - Overall score card
  - Detailed scores card
  - Chord recognition card (NEW)
  - Explanation card
```

## 📝 Lưu ý

1. **Backward Compatibility**: Nếu API không trả về `chordRecognition`, card sẽ không hiển thị (không gây lỗi)

2. **Chord Accuracy**: Chỉ hiển thị khi có giá trị > 0 (có ground truth)

3. **Performance**: Phân tích với chord recognition mất thời gian hơn (~2-5 giây)

4. **Error Handling**: Component xử lý lỗi và hiển thị message phù hợp

## 🚀 Cách test

1. Start server và client
2. Upload audio file
3. Click "Phân tích với nhận diện hợp âm"
4. Kiểm tra:
   - Card "Nhận diện hợp âm" hiển thị
   - Metrics được hiển thị đúng
   - Timeline chords hiển thị với timestamps
   - Overall score và detailed scores vẫn hoạt động bình thường

