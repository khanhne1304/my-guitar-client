// YIN pitch detection cho guitar (E2 ~ E4) - Cải thiện để giảm nhiễu
// Có loại DC offset + giới hạn dải tần + nội suy parabolic + noise filtering

export function detectPitch(bufferIn, sampleRate) {
  const len = bufferIn.length;

  // 1) Remove DC offset (copy sang buffer mới để không phá hủy input)
  const buffer = new Float32Array(len);
  let mean = 0;
  for (let i = 0; i < len; i++) mean += bufferIn[i];
  mean /= len;
  for (let i = 0; i < len; i++) buffer[i] = bufferIn[i] - mean;

  // 2) RMS để đánh giá độ mạnh của tín hiệu
  let rms = 0;
  for (let i = 0; i < len; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / len);
  
  // Noise gate: chỉ xử lý khi tín hiệu đủ mạnh
  const NOISE_THRESHOLD = 0.001; // Giảm ngưỡng để dễ detect hơn
  if (rms < NOISE_THRESHOLD) return null;

  // 3) Pre-emphasis filter để tăng cường fundamental frequency
  const preEmphasisBuffer = new Float32Array(len);
  const alpha = 0.97; // Pre-emphasis coefficient
  preEmphasisBuffer[0] = buffer[0];
  for (let i = 1; i < len; i++) {
    preEmphasisBuffer[i] = buffer[i] - alpha * buffer[i - 1];
  }

  // 4) Giới hạn tau theo dải tần guitar (giảm nhiễu & tăng chính xác)
  const MIN_F = 70;   // thấp hơn E2 một chút để "tha"
  const MAX_F = 500;  // cao hơn E4 để bắt overtone
  let minTau = Math.max(2, Math.floor(sampleRate / MAX_F));
  let maxTau = Math.min(Math.floor(sampleRate / MIN_F), Math.floor(len / 2));

  const yin = new Float32Array(maxTau + 1);

  // 5) Difference function với pre-emphasized signal
  for (let tau = minTau; tau <= maxTau; tau++) {
    let sum = 0;
    for (let i = 0; i < maxTau; i++) {
      const d = preEmphasisBuffer[i] - preEmphasisBuffer[i + tau];
      sum += d * d;
    }
    yin[tau] = sum;
  }

  // 6) Cumulative mean normalized difference
  let runningSum = 0;
  yin[minTau] = 1;
  for (let tau = minTau + 1; tau <= maxTau; tau++) {
    runningSum += yin[tau];
    yin[tau] = yin[tau] * tau / (runningSum || 1e-12);
  }

  // 7) Tìm ngưỡng với adaptive threshold
  const BASE_THRESHOLD = 0.1; // Giảm ngưỡng để dễ detect hơn
  const ADAPTIVE_FACTOR = Math.min(0.5, rms / 0.01); // Giảm adaptive factor
  const THRESHOLD = BASE_THRESHOLD * (1 + ADAPTIVE_FACTOR);
  
  let tauEstimate = -1;
  let minYin = Infinity;
  
  for (let tau = minTau; tau <= maxTau; tau++) {
    if (yin[tau] < minYin) minYin = yin[tau];
    
    if (yin[tau] < THRESHOLD) {
      // đi tới đáy local minimum
      while (tau + 1 <= maxTau && yin[tau + 1] < yin[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }
  
  // Nếu không vượt ngưỡng, vẫn thử với min global
  if (tauEstimate === -1) {
    let minIdx = -1;
    for (let tau = minTau; tau <= maxTau; tau++) {
      if (yin[tau] === minYin) { minIdx = tau; break; }
    }
    tauEstimate = minIdx;
  }

  // 8) Parabolic interpolation (nội suy 3 điểm cho chính xác sub-sample)
  const x0 = tauEstimate > minTau ? tauEstimate - 1 : tauEstimate;
  const x2 = tauEstimate + 1 <= maxTau ? tauEstimate + 1 : tauEstimate;
  const s0 = yin[x0], s1 = yin[tauEstimate], s2 = yin[x2];
  const denom = (s0 - 2 * s1 + s2) || 1e-12;
  const betterTau = tauEstimate + 0.5 * (s0 - s2) / denom;

  const freq = sampleRate / betterTau;
  
  // 9) Validation: kiểm tra frequency có hợp lý không
  if (freq <= 0 || !isFinite(freq) || freq < MIN_F || freq > MAX_F) {
    return null;
  }
  
  // 10) Confidence score dựa trên YIN value và RMS
  const confidence = Math.max(0, Math.min(1, (1 - minYin) * (rms / 0.01)));
  
  return { freq, confidence, rms };
}
