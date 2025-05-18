import React from 'react';

const GameInterface = ({ player, onMove }) => {
  return (
    <div id="game-interface">
      <div id="avatar-container">
        <img id="avatar-display" src={player.avatar} alt="Player Avatar" />
      </div>
      <div id="joystick">
        <button id="up" onClick={() => onMove('up')}>
          ▲
        </button>
        <button id="left" onClick={() => onMove('left')}>
          ◄
        </button>
        <div></div>
        <button id="right" onClick={() => onMove('right')}>
          ►
        </button>
        <button id="down" onClick={() => onMove('down')}>
          ▼
        </button>
      </div>
    </div>
  );
};

export default GameInterface;