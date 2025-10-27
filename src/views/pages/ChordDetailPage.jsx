import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { extendedGuitarChords } from '../../data/allChord';
import { toneChords } from '../../data/toneChords';
import { createFingerMapping } from '../../utils/fingerMapping';
import VirtualGuitarNeck from '../../components/VirtualGuitarNeck';
import VirtualHand from '../../components/VirtualHand';
import GuitarChordSVG from '../../assets/SVG/guiarChord/GuitarChordSVG';
import styles from './ChordDetailPage.module.css';

const ChordDetailPage = () => {
  const { chordName } = useParams();
  const navigate = useNavigate();
  const [chordData, setChordData] = useState(null);
  const [fingerMapping, setFingerMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allChords, setAllChords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTone, setCurrentTone] = useState('');

  useEffect(() => {
    if (chordName && extendedGuitarChords[chordName]) {
      const chord = extendedGuitarChords[chordName];
      const mapping = createFingerMapping(chord, chordName);
      
      // Tìm tone chứa hợp âm hiện tại
      let foundTone = null;
      let sameToneChords = [];
      
      for (const [tone, chords] of Object.entries(toneChords)) {
        if (chords.includes(chordName)) {
          foundTone = tone;
          sameToneChords = chords;
          break;
        }
      }
      
      // Nếu không tìm thấy trong toneChords, fallback về cách cũ
      if (!foundTone) {
        const currentToneChar = chordName.charAt(0);
        foundTone = `Tone ${currentToneChar}`;
        sameToneChords = Object.keys(extendedGuitarChords).filter(chord => 
          extendedGuitarChords[chord] && 
          typeof extendedGuitarChords[chord] === 'object' && 
          extendedGuitarChords[chord].frets &&
          chord.charAt(0) === currentToneChar
        );
      }
      
      setCurrentTone(foundTone);
      
      setAllChords(sameToneChords);
      setChordData(chord);
      setFingerMapping(mapping);
      
      const index = sameToneChords.indexOf(chordName);
      setCurrentIndex(index >= 0 ? index : 0);
      setLoading(false);
      
      // Cuộn lên đầu trang khi component mount
      setTimeout(() => {
        // Thử nhiều cách cuộn
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    } else {
      setLoading(false);
    }
  }, [chordName]);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (!chordData) {
    return (
      <div className={styles.error}>
        <h2>Không tìm thấy hợp âm "{chordName}"</h2>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const getChordInfo = () => {
    const { frets, barre } = chordData;
    const info = {
      name: chordName,
      frets: frets,
      barre: barre,
      fingerMapping: fingerMapping,
      notes: []
    };

    // Phân tích các nốt trong hợp âm
    frets.forEach((fret, index) => {
      const stringNumber = 6 - index;
      if (fret === 'x') {
        info.notes.push({
          string: stringNumber,
          fret: 'x',
          finger: null,
          type: 'muted'
        });
      } else if (fret === 0) {
        info.notes.push({
          string: stringNumber,
          fret: 0,
          finger: null,
          type: 'open'
        });
      } else if (typeof fret === 'number') {
        const finger = fingerMapping[index];
        const isBarre = barre && fret === barre.fret && 
          stringNumber >= barre.toString && stringNumber <= barre.fromString;
        
        info.notes.push({
          string: stringNumber,
          fret: fret,
          finger: isBarre ? 1 : finger,
          type: isBarre ? 'barre' : 'fretted'
        });
      }
    });

    return info;
  };

  // Hàm chuyển hợp âm
  const goToNextChord = () => {
    if (currentIndex < allChords.length - 1) {
      const nextChord = allChords[currentIndex + 1];
      navigate(`/tools/chords/${nextChord}`);
      // Cuộn lên đầu trang sau khi navigate
      setTimeout(() => {
        // Thử nhiều cách cuộn
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  };

  const goToPreviousChord = () => {
    if (currentIndex > 0) {
      const prevChord = allChords[currentIndex - 1];
      navigate(`/tools/chords/${prevChord}`);
      // Cuộn lên đầu trang sau khi navigate
      setTimeout(() => {
        // Thử nhiều cách cuộn
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  };

  const chordInfo = getChordInfo();

  return (
    <div className={styles.chordDetailPage} data-scroll-top>
      <div className={styles.header}>
        <button onClick={() => navigate('/tools/chords')} className={styles.backButton}>
          ← Quay lại
        </button>
        <div className={styles.chordInfo}>
          <h1 className={styles.chordName}>Hợp âm {chordName}</h1>
          <div className={styles.toneInfo}>
            {currentTone} ({allChords.length} hợp âm)
          </div>
        </div>
        <div className={styles.navigation}>
          <button 
            onClick={goToPreviousChord} 
            className={styles.navButton}
            disabled={currentIndex === 0}
            title="Hợp âm trước"
          >
            <FaChevronLeft />
          </button>
          <span className={styles.chordCounter}>
            {currentIndex + 1} / {allChords.length}
          </span>
          <button 
            onClick={goToNextChord} 
            className={styles.navButton}
            disabled={currentIndex === allChords.length - 1}
            title="Hợp âm tiếp theo"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <VirtualGuitarNeck 
            chordData={chordData} 
            fingerMapping={fingerMapping}
            chordName={chordName}
          />
        </div>

        <div className={styles.rightPanel}>
          <VirtualHand 
            fingerMapping={fingerMapping}
            chordData={chordData}
          />
          
          <div className={styles.chordInfo}>
            <h3>Thông tin hợp âm</h3>
            <div className={styles.notesList}>
              {chordInfo.notes.map((note, index) => (
                <div key={index} className={styles.noteItem}>
                  <span className={styles.stringLabel}>Dây {note.string}:</span>
                  {note.type === 'muted' && (
                    <span className={styles.muted}>Không chơi (X)</span>
                  )}
                  {note.type === 'open' && (
                    <span className={styles.open}>Buông (0)</span>
                  )}
                  {note.type === 'fretted' && (
                    <span className={styles.fretted}>
                      Ngăn {note.fret} - Ngón {note.finger}
                    </span>
                  )}
                  {note.type === 'barre' && (
                    <span className={styles.barre}>
                      Ngăn {note.fret} - Barre (Ngón {note.finger})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.sameToneChords}>
            <h3>Các hợp âm cùng tone:</h3>
            <div className={styles.chordsGrid}>
              {allChords
                .filter(chord => chord !== chordName) // Loại bỏ hợp âm hiện tại
                .map((chord, index) => (
                  <Link
                    key={chord}
                    to={`/tools/chords/${chord}`}
                    className={styles.chordCard}
                    onClick={() => {
                      // Cuộn lên đầu trang khi click
                      setTimeout(() => {
                        // Thử nhiều cách cuộn
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }, 100);
                    }}
                  >
                    <GuitarChordSVG chord={chord} width={150} />
                    <div className={styles.chordName}>{chord}</div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordDetailPage;
