import React, { useRef, useEffect } from 'react';
import Status from './Status';
import MapAndAvatar from './MapAndAvatar';
import Joystick from './Joystick';
import ActivityDetails from './ActivityDetails';
import Inventory from './Inventory';
import '../styles/GameScreen.css';



const GameScreen = ({
  player,
  gameTime,
  avatarPosition,
  onMove,
  onBackToMainMap,
  onActivity,
  isWalking,
  isActivityAnimating, // NEW PROP
  currentActivityGif,  // NEW PROP
  onFastForward        // NEW PROP
}) => {
  // gameMapColumnRef tidak lagi diperlukan untuk positioning overlay
  // const gameMapColumnRef = useRef(null);
  const animationOverlayRef = useRef(null); // Ref untuk overlay animasi

  // Effect untuk mengontrol display overlay
  useEffect(() => {
    if (animationOverlayRef.current) {
      if (isActivityAnimating) {
        animationOverlayRef.current.style.display = 'flex'; // Tampilkan overlay
        // Style lain seperti z-index, background-color, dll. akan diatur di CSS
      } else {
        animationOverlayRef.current.style.display = 'none'; // Sembunyikan overlay
      }
    }
  }, [isActivityAnimating]); // Jalankan ulang effect ini ketika isActivityAnimating berubah

  return (
    <div className="game-screen-container">
      {/* Status Bar - Always at the very top */}
      <Status player={player} gameTime={gameTime} />

      {/* Main Game Area - Menggunakan CSS Grid untuk Map dan Sidebar */}
      <div className="game-main-area">
        {/* Left Column: Map and Avatar */}
        {/* Pastikan game-map-column memiliki position: relative di CSS */}
        <div className="game-map-column">
          <MapAndAvatar player={player} avatarPosition={avatarPosition} isWalking={isWalking} />

          {/* Activity Animation Overlay - Ditempatkan di sini, akan menutupi map */}
          {/* Posisi overlay ini akan diatur sepenuhnya oleh CSS relatif terhadap .game-map-column */}
          {currentActivityGif && ( // Render hanya jika ada GIF
            <div className="activity-animation-overlay" ref={animationOverlayRef}>
              <img src={currentActivityGif} alt="Activity Animation" className="activity-gif-map" />
              <button className="fast-forward-button-overlay" onClick={onFastForward}>
                Fast Forward
              </button>
            </div>
          )}


          {/* Floating Controls (Joystick & Back Button) - Posisi over the map */}
          <div className="game-overlay-controls">
            <Joystick onMove={onMove} />

            {player.location !== 'MainMap' && (
              <button
                onClick={onBackToMainMap}
                className="back-to-main-map-button"
              >
                Back to Main Map
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar for Activities and Inventory */}
        <div className="game-right-sidebar">
          <ActivityDetails location={player.location} onActivity={onActivity} player={player} />
          <Inventory playerInventory={player.inventory} playerMoney={player.money} />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;