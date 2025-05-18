import React, { useState } from 'react';
import '../styles/AvatarSelection.css'; 

const avatars = [
  '/assets/ayam ygy.png',
  '/assets/bebek ygy.png',
  '/assets/capi ygy.png',
];

const AvatarSelection = ({ onAvatarSelect, onStartGame }) => {
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [playerName, setPlayerName] = useState('');

  const selectedAvatar = avatars[currentAvatarIndex];

  const handleNextAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex + 1) % avatars.length);
  };

  const handlePrevAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex - 1 + avatars.length) % avatars.length);
  };

  const handleStartGame = () => {
    if (!playerName.trim()) {
      alert("Masukkan nama terlebih dahulu!");
      return;
    }
    
    onAvatarSelect(selectedAvatar); // Dipanggil di sini saja
    onStartGame(playerName);
  };

  return (
    <div id="game-container">
      <div id="avatar-selection">
        <h2>Pilih avatarmu!</h2>
        <div id="avatar-display-container">
          <button onClick={handlePrevAvatar}>◄ Previous</button>
          <img
            src={selectedAvatar}
            alt="Pilihan Avatar"
            className="avatar-img"
          />
          <button onClick={handleNextAvatar}>Next ►</button>
        </div>
        <div id="input-section">
          <input
            type="text"
            id="player-name"
            placeholder="Masukkan nama"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button id="next-button" onClick={handleStartGame}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
