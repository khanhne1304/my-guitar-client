// src/utils/hpsPitchDetection.js
import FFT from "fft.js";

/**
 * Thuật toán HPS (Harmonic Product Spectrum)
 * timeDomainData: Float32Array từ AnalyserNode
 * sampleRate: audioContext.sampleRate
 */

// ✅ Sửa lỗi octave khi HPS nhận nhầm dây cao thành E2
function fixOctaveError(freq) {
  // 1️⃣ Nếu freq nằm trong vùng fundamental dây trầm (E2–A2), giữ nguyên
  if (freq >= 70 && freq <= 120) {
    return freq; // ⚡ Không nhân ngược lên nữa
  }

  // 2️⃣ Dây trầm bị bắt nhầm harmonic → chia xuống
  if (freq >= 150 && freq <= 250) {
    const half = freq / 2;
    if (half >= 70 && half <= 130) {
      console.log("↓ Downscale harmonic 2 →", half);
      freq = half;
    }
  }

  // 3️⃣ Dây cao bị tụt xuống harmonic thấp → nhân lên
  if (freq < 120) {
    if (freq * 2 >= 120 && freq * 2 <= 500) return freq * 2;
    if (freq * 3 >= 120 && freq * 3 <= 500) return freq * 3;
    if (freq * 4 >= 120 && freq * 4 <= 500) return freq * 4;
  }

  return freq;
}



export function hpsPitchDetection(timeDomainData, sampleRate) {
  const N = timeDomainData.length;
  const fft = new FFT(N);
  const out = fft.createComplexArray();
  const input = fft.createComplexArray();

  // Hanning window + chuyển sang mảng phức
  for (let i = 0; i < N; i++) {
    const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
    input[2 * i] = timeDomainData[i] * hann;
    input[2 * i + 1] = 0;
  }

  fft.transform(out, input);

  const magnitudes = new Float32Array(N / 2);
  for (let i = 0; i < N / 2; i++) {
    const re = out[2 * i];
    const im = out[2 * i + 1];
    magnitudes[i] = Math.sqrt(re * re + im * im);
  }

  // HPS
  const hps = new Float32Array(magnitudes.length);
  hps.set(magnitudes);
  const maxHarmonics = 4;
  for (let h = 2; h <= maxHarmonics; h++) {
    for (let i = 0; i < magnitudes.length / h; i++) {
      hps[i] *= magnitudes[i * h];
    }
  }

  // Tìm đỉnh
  let maxIndex = 0;
  let maxValue = -Infinity;
  for (let i = 0; i < hps.length; i++) {
    if (hps[i] > maxValue) {
      maxValue = hps[i];
      maxIndex = i;
    }
  }

  let freq = (maxIndex * sampleRate) / N;
  if (freq < 50 || freq > 2000 || !isFinite(freq)) return null;

  // ✅ Sửa lỗi octave trước khi trả về
  freq = fixOctaveError(freq);

  // Confidence đơn giản: so sánh đỉnh lớn nhất với trung bình
  let avg = 0;
  for (let i = 0; i < hps.length; i++) avg += hps[i];
  avg /= hps.length;
  const confidence = Math.min(1, (maxValue - avg) / maxValue);
  console.log("[HPS raw freq]:", (maxIndex * sampleRate) / N);
console.log("[HPS after fixOctaveError]:", freq);

  return { freq, confidence };
}
