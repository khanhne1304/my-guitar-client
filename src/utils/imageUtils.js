/**
 * Image utilities để xử lý và chuẩn hóa ảnh từ link bên ngoài
 */

/**
 * Thêm tham số resize cho các dịch vụ ảnh phổ biến
 * @param {string} url - URL ảnh gốc
 * @param {number} width - Chiều rộng mong muốn
 * @param {number} height - Chiều cao mong muốn
 * @returns {string} - URL đã được tối ưu
 */
export function optimizeImageUrl(url, width = 300, height = 200) {
  if (!url || typeof url !== 'string') return '';
  
  const lowerUrl = url.toLowerCase();
  
  // Xử lý cho các dịch vụ ảnh phổ biến
  if (lowerUrl.includes('unsplash.com')) {
    // Unsplash: thêm tham số w và h
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&h=${height}&fit=crop&crop=center`;
  }
  
  if (lowerUrl.includes('picsum.photos')) {
    // Lorem Picsum: thay đổi kích thước trong URL
    return url.replace(/\d+\/\d+/, `${width}/${height}`);
  }
  
  if (lowerUrl.includes('placehold.co')) {
    // Placehold.co: thay đổi kích thước
    return url.replace(/\d+x\d+/, `${width}x${height}`);
  }
  
  if (lowerUrl.includes('via.placeholder.com')) {
    // Via placeholder: thay đổi kích thước
    return url.replace(/\d+x\d+/, `${width}x${height}`);
  }
  
  // Đối với các URL khác, trả về URL gốc
  return url;
}

/**
 * Kiểm tra xem URL có phải là ảnh hợp lệ không
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean}
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  
  // Kiểm tra extension
  const hasValidExtension = imageExtensions.some(ext => lowerUrl.includes(ext));
  
  // Kiểm tra protocol
  const hasValidProtocol = lowerUrl.startsWith('http://') || 
                          lowerUrl.startsWith('https://') || 
                          lowerUrl.startsWith('data:');
  
  return hasValidExtension || hasValidProtocol;
}

/**
 * Tạo URL fallback khi ảnh lỗi
 * @param {number} width - Chiều rộng
 * @param {number} height - Chiều cao
 * @param {string} text - Text hiển thị
 * @returns {string}
 */
export function createFallbackImageUrl(width = 300, height = 200, text = 'No Image') {
  return `https://placehold.co/${width}x${height}?text=${encodeURIComponent(text)}`;
}

/**
 * Preload ảnh để kiểm tra xem có load được không
 * @param {string} url - URL ảnh
 * @returns {Promise<boolean>}
 */
export function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

