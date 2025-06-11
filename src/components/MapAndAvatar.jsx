import React from 'react';
import '../styles/MapAndAvatar.css';

const MapAndAvatar = ({ player, avatarPosition }) => {
  const getLocationImage = (location) => {
    switch (location) {
      case 'Home': return '/assets/HomeMap.png';
      case 'Mountain': return '/assets/MountainMap.png';
      case 'Lake': return '/assets/LakeMap.png';
      case 'Beach': return '/assets/BeachMap.png';
      case 'Temple': return '/assets/TempleMap.png';
      case 'MainMap':
      default: return '/assets/MainMap.jpg';
    }
  };

  return (
    // Tambahkan div ini sebagai wrapper yang akan diatur oleh GameScreen.css
    <div className="map-and-avatar-container">
      <img
        src={getLocationImage(player.location)}
        alt={`Map of ${player.location}`}
        className="map-image"
      />

      <div
        className="avatar-marker"
        style={{
          left: `${avatarPosition.x}%`,
          top: `${avatarPosition.y}%`,
        }}
      >
        <img
          src={player.avatar}
          alt="Player Avatar"
          className="player-avatar-image"
        />
      </div>
    </div>
  );
};

export default MapAndAvatar;