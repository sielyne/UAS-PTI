import React from 'react';
import '../styles/GameInterface.css';

const GameInterface = ({ player, onMove }) => {
  return (
    <div id="game-interface">
      <div id="map-container">
        <img id="game-map" src="/assets/MainMap.jpg" alt="Game Map"/>
      </div>
      <div id="avatar-container">
        <img id="avatar-display" src={player.avatar} alt="Player Avatar" />
      </div>
    </div>
  )
};

export default GameInterface;