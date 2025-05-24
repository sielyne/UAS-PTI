import React from 'react';
import '../styles/Joystick.css';

const Joystick = ({ onMove }) => {
  return (
    <div id="joystick">
      <button id="up" onClick={() => onMove('up')}>
        ▲
      </button>
      <button id="left" onClick={() => onMove('left')}>
        ◄
      </button>
      <div></div> {/* Elemen kosong untuk mengisi grid tengah */}
      <button id="right" onClick={() => onMove('right')}>
        ►
      </button>
      <button id="down" onClick={() => onMove('down')}>
        ▼
      </button>
    </div>
  );
};

export default Joystick;