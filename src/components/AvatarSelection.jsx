import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
  onAvatarSelect(selectedAvatar); // Pilih avatar pertama saat komponen mount
  }, []); // Array dependensi kosong, hanya berjalan sekali saat mount // Hanya bergantung pada onAvatarSelect // Hanya berjalan saat onAvatarSelect atau selectedAvatar berubah (termasuk mount awal)

  const handleNextAvatar = () => {
   setCurrentAvatarIndex((prevIndex) => {
     const newIndex = (prevIndex + 1) % avatars.length;
     onAvatarSelect(avatars[newIndex]); // Pastikan memanggil dengan avatar baru
     return newIndex;
   });
 };

 const handlePrevAvatar = () => {
   setCurrentAvatarIndex((prevIndex) => {
     const newIndex = (prevIndex - 1 + avatars.length) % avatars.length;
     onAvatarSelect(avatars[newIndex]); // Pastikan memanggil dengan avatar baru
     return newIndex;
   });
 };

  const handleStartGame = () => {
    if (!playerName.trim()) {
      alert("Masukkan nama terlebih dahulu!");
      return;
    }

    onStartGame(playerName); // Pemilihan avatar sudah terjadi di useEffect dan handleNext/Prev
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