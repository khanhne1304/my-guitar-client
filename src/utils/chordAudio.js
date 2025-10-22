// Utility để phát âm thanh hợp âm bằng Web Audio API
class ChordAudioPlayer {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.oscillators = [];
  }

  // Khởi tạo AudioContext
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3; // Âm lượng mặc định
    }
  }

  // Tần số của các nốt guitar (dây buông)
  getStringFrequencies() {
    return {
      1: 329.63, // E4 (dây 1)
      2: 246.94, // B3 (dây 2) 
      3: 196.00, // G3 (dây 3)
      4: 146.83, // D3 (dây 4)
      5: 110.00, // A2 (dây 5)
      6: 82.41   // E2 (dây 6)
    };
  }

  // Tính tần số của nốt tại ngăn cụ thể
  getFretFrequency(stringNumber, fret) {
    const baseFrequencies = this.getStringFrequencies();
    const baseFreq = baseFrequencies[stringNumber];
    
    if (fret === 0) {
      return baseFreq; // Dây buông
    }
    
    // Công thức: f = f0 * 2^(fret/12)
    return baseFreq * Math.pow(2, fret / 12);
  }

  // Phân tích hợp âm từ chordData
  analyzeChord(chordData) {
    const { frets } = chordData;
    const frequencies = [];
    
    frets.forEach((fret, index) => {
      const stringNumber = 6 - index; // Chuyển đổi index thành số dây
      
      // Chỉ phát các dây có nốt (không phải "x" và >= 0)
      if (typeof fret === 'number' && fret >= 0) {
        const frequency = this.getFretFrequency(stringNumber, fret);
        frequencies.push({
          string: stringNumber,
          fret: fret,
          frequency: frequency
        });
      }
    });
    
    return frequencies;
  }


  // Phát âm thanh hợp âm
  async playChord(chordData) {
    try {
      this.initAudioContext();
      
      // Resume AudioContext nếu bị suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Dừng các oscillator cũ
      this.stopAllOscillators();
      
      // Phân tích hợp âm
      const frequencies = this.analyzeChord(chordData);
      
      if (frequencies.length === 0) {
        console.warn('Không có nốt nào để phát');
        return;
      }

      
      // Tạo oscillator cho mỗi nốt
      frequencies.forEach((note, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.frequency, this.audioContext.currentTime);
        
        // Envelope cho âm thanh tự nhiên hơn
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        // Phát âm thanh với delay nhỏ giữa các nốt
        oscillator.start(this.audioContext.currentTime + index * 0.05);
        oscillator.stop(this.audioContext.currentTime + 2);
        
        this.oscillators.push(oscillator);
      });
      
    } catch (error) {
      console.error('Lỗi khi phát âm thanh hợp âm:', error);
      throw error;
    }
  }

  // Dừng tất cả oscillator
  stopAllOscillators() {
    this.oscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator đã được dừng
      }
    });
    this.oscillators = [];
  }

  // Phát âm thanh hợp âm từ tên hợp âm
  async playChordByName(chordName) {
    try {
      // Import chord data
      const { extendedGuitarChords } = await import('../data/allChord');
      
      if (!extendedGuitarChords[chordName]) {
        throw new Error(`Không tìm thấy hợp âm: ${chordName}`);
      }
      
      const chordData = extendedGuitarChords[chordName];
      await this.playChord(chordData);
      
    } catch (error) {
      console.error('Lỗi khi phát âm thanh hợp âm:', error);
      throw error;
    }
  }

  // Cleanup
  destroy() {
    this.stopAllOscillators();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Tạo instance singleton
const chordAudioPlayer = new ChordAudioPlayer();

export default chordAudioPlayer;
