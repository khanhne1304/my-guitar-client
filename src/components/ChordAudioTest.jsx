import React from 'react';
import chordAudioPlayer from '../utils/chordAudio';

const ChordAudioTest = () => {
  const testChords = ['Am', 'Em', 'C', 'G'];

  const handleTestChord = async (chordName) => {
    console.log(`\n=== Testing chord: ${chordName} ===`);
    try {
      await chordAudioPlayer.playChordByName(chordName);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '15px', 
      border: '2px solid #667eea', 
      borderRadius: '8px',
      backgroundColor: '#f8f9ff'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>🔊 Test Âm Thanh Hợp Âm</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {testChords.map(chord => (
          <button
            key={chord}
            onClick={() => handleTestChord(chord)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {chord}
          </button>
        ))}
      </div>
      <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
        Mở Console để xem các nốt được phát
      </p>
    </div>
  );
};

export default ChordAudioTest;
