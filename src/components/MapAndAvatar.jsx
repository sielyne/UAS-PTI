
import React from 'react';
import '../styles/MapAndAvatar.css';

const MapAndAvatar = ({ player, avatarPosition, isWalking }) => {
  console.log("Render Avatar:", player.avatar, "Is Walking:", isWalking);

  const getLocationImage = (location) => {
    switch (location) {
      case 'Home': return '/UAS-PTI/assets/HomeMap.png';
      case 'Mountain': return '/UAS-PTI/assets/MountainMap.png';
      case 'Lake': return '/UAS-PTI/assets/LakeMap.png';
      case 'Beach': return '/UAS-PTI/assets/BeachMap.png';
      case 'Temple': return '/UAS-PTI/assets/TempleMap.png';
      case 'MainMap':
      default: return '/UAS-PTI/assets/mainMap.jpg';
}
  };

  const getAvatarImage = () => {
    const timestamp = Date.now(); 
    let avatarSrc = player.avatar;

    if (isWalking) {
      if (player.avatar.includes('bebek')) avatarSrc = `/UAS-PTI/assets/bebek-walk.gif?t=${timestamp}`;
      else if (player.avatar.includes('ayam')) avatarSrc = `/UAS-PTI/assets/ayam-walk.gif?t=${timestamp}`;
      else if (player.avatar.includes('capi')) avatarSrc = `/UAS-PTI/assets/capi-walk.gif?t=${timestamp}`;
    }

    console.log("Avatar Image src:", avatarSrc); 
    return avatarSrc;
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
