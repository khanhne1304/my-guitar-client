const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
];

const ALLOWED_EXT = ['mp3', 'wav', 'webm', 'ogg', 'mp4', 'm4a'];

export const MAX_AUDIO_SIZE_MB = 200;

/**
 * @param {File} file
 * @returns {string|null} error message or null if ok
 */
export function validateAudioFile(file, maxMb = MAX_AUDIO_SIZE_MB) {
  if (!file) return 'Chưa chọn file âm thanh.';
  const ext = file.name.split('.').pop()?.toLowerCase();
  const okType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.includes(ext || '');
  if (!okType) {
    return 'Định dạng không hỗ trợ. Dùng MP3, WAV, WEBM, OGG hoặc M4A.';
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > maxMb) {
    return `File quá lớn (${sizeMb.toFixed(1)} MB). Giới hạn ${maxMb} MB.`;
  }
  return null;
}
