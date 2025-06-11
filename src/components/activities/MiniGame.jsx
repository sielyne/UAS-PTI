import React, { useState, useEffect } from 'react';

const MiniGame = ({ onComplete, onFail, location }) => {
  const [itemPosition, setItemPosition] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(30); // 30 detik untuk menemukan item
  const [message, setMessage] = useState("Temukan item yang tersembunyi!");
  const [found, setFound] = useState(false);

  useEffect(() => {
    // Menghasilkan posisi acak untuk item (antara 10-90% untuk menghindari tepi)
    const randomX = Math.floor(Math.random() * 80) + 10;
    const randomY = Math.floor(Math.random() * 80) + 10;
    setItemPosition({ x: randomX, y: randomY });

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (!found) {
            onFail("Waktu habis! Kamu tidak menemukan itemnya.");
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup saat komponen di-unmount
  }, [found, onFail]);

  // Fungsi ini akan dipanggil saat item "ditemukan" (disimulasikan dengan klik pada div)
  const handleItemClick = () => {
    if (!found) {
      setFound(true);
      onComplete("Berhasil! Kamu menemukan itemnya!");
      setMessage("Item Ditemukan!");
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      zIndex: 1001, // Di atas joystick/activities
      backdropFilter: 'blur(5px)'
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Cari Item yang Hilang!</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Waktu Tersisa: {timeLeft} detik</p>
      <p style={{ fontSize: '1rem', color: '#f39c12' }}>{message}</p>

      {/* Item tersembunyi - untuk demo, klik pada div ini akan "menemukan" item.
          Dalam implementasi game sungguhan, avatar pemain harus bergerak mendekati. */}
      {!found && (
        <div
          onClick={handleItemClick} // Disimulasikan: klik untuk menemukan
          style={{
            position: 'absolute',
            left: `${itemPosition.x}%`,
            top: `${itemPosition.y}%`,
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            border: '2px dashed yellow',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,0,0.3)',
            // Animasi sederhana (jika diperlukan)
            animation: 'pulse 1s infinite alternate'
          }}
        >
          {/* Tidak ada gambar di sini, hanya area interaktif */}
        </div>
      )}

      {/* Style untuk animasi, bisa dipindahkan ke CSS terpisah */}
      <style>{`
        @keyframes pulse {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default MiniGame;
