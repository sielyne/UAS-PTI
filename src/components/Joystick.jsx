import React from 'react';
import '../styles/Joystick.css'; // Import CSS file

const Joystick = ({ onMove }) => {
  return (
    <div className="joystick-wrapper">
      <div className="joystick-grid">
        <div></div>
        <button
          onClick={() => onMove('up')}
          className="joystick-button"
        >
          ↑
        </button>
        <div></div>

        <button
          onClick={() => onMove('left')}
          className="joystick-button"
        >
          ←
        </button>
        <div></div>
        <button
          onClick={() => onMove('right')}
          className="joystick-button"
        >
          →
        </button>

        <div></div>
        <button
          onClick={() => onMove('down')}
          className="joystick-button"
        >
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );
};

export default Joystick;