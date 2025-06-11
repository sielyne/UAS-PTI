import React, { useEffect, useState } from 'react';
import '../styles/MapAndAvatar.css';

const MapAndAvatar = ({ player, avatarPosition }) => {
  const [isWalking, setIsWalking] = useState(false);

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

  useEffect(() => {
    let keysPressed = {};

    const handleKeyDown = (e) => {
      keysPressed[e.key] = true;
      if (
        keysPressed["ArrowUp"] || keysPressed["ArrowDown"] ||
        keysPressed["ArrowLeft"] || keysPressed["ArrowRight"] ||
        keysPressed["w"] || keysPressed["a"] ||
        keysPressed["s"] || keysPressed["d"]
      ) {
        setIsWalking(true);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed[e.key] = false;
      if (
        !keysPressed["ArrowUp"] && !keysPressed["ArrowDown"] &&
        !keysPressed["ArrowLeft"] && !keysPressed["ArrowRight"] &&
        !keysPressed["w"] && !keysPressed["a"] &&
        !keysPressed["s"] && !keysPressed["d"]
      ) {
        setIsWalking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
          src={player.avatar}
          alt="Player Avatar"
          className={`player-avatar-image ${isWalking ? 'walking-avatar' : ''}`}
        />
      </div>
    </div>
  );
};

export default MapAndAvatar;
