import React, { useState } from 'react';
import '../styles/AvatarSelection.css'; // Import CSS file

const AvatarSelection = ({ onAvatarSelect, onStartGame }) => {
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [playerName, setPlayerName] = useState('');

  const avatars = [
    { name: 'Ayam', src: '/assets/ayam ygy.png' },
    { name: 'Bebek', src: '/assets/bebek ygy.png' },
    { name: 'Capybara', src: '/assets/capi ygy.png' }
  ];

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.src);
    onAvatarSelect(avatar.src);
  };

  const handleStartGame = () => {
    onStartGame(playerName);
  };

  return (
    <div className="avatar-selection-container">
      <h1 className="avatar-selection-title">
        Life Simulation Game
      </h1>

      <div className="player-name-input-group">
        <label className="player-name-label">
          Enter Your Name:
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="player-name-input"
          placeholder="Your name here..."
        />
      </div>

      <div className="avatar-choose-section">
        <h2 className="avatar-choose-title">Choose Your Avatar:</h2>
        <div className="avatar-list">
          {avatars.map((avatar) => (
            <div
              key={avatar.name}
              onClick={() => handleAvatarSelect(avatar)}
              className={`avatar-item ${selectedAvatar === avatar.src ? 'selected' : ''}`}
            >
              <img
                src={avatar.src}
                alt={avatar.name}
                className="avatar-image"
              />
              <p className="avatar-name">{avatar.name}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleStartGame}
        disabled={!selectedAvatar || !playerName.trim()}
        className="start-game-button"
      >
        Start Game
      </button>
    </div>
  );
};

export default AvatarSelection;