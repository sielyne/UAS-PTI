// src/components/MapAndAvatar.jsx
import React from 'react';
import '../styles/MapAndAvatar.css';

const MapAndAvatar = ({ player, avatarPosition, isWalking }) => {
  console.log("Render Avatar:", player.avatar, "Is Walking:", isWalking);

  const getLocationImage = (location) => {
    switch (location) {
      case 'Home': return '/assets/HomeMap.png';
      case 'Mountain': return '/assets/MountainMap.png';
      case 'Lake': return '/assets/LakeMap.png';
      case 'Beach': return '/assets/BeachMap.png';
      case 'Temple': return '/assets/TempleMap.png';
      case 'MainMap':
      default: return '/assets/mainMap.jpg';
    }
  };

  // 🔁 Fungsi untuk menentukan avatar yang ditampilkan
  const getAvatarImage = () => {
    if (isWalking) {
      if (player.avatar.includes('bebek')) return '/assets/bebek-walk.gif';
      if (player.avatar.includes('ayam')) return '/assets/ayam-walk.gif';
      if (player.avatar.includes('capi')) return '/assets/capi-walk.gif';
    }
    return player.avatar;
  };

  return (
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
          src={getAvatarImage()}
          alt="Player Avatar"
          className="player-avatar-image"
        />
      </div>
    </div>
  );
};

export default MapAndAvatar;
