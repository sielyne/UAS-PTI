import { useState, useEffect } from 'react';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import '../styles/AvatarSelection.css';


export default function AvatarSelection({ onSelect, onStart }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    new Swiper('.swiper-container', {
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      keyboard: { enabled: true, onlyInViewport: true },
    });
  }, []);

  function handleAvatarClick(avatar) {
    setSelectedAvatar(avatar);
    onSelect(avatar); // callback ke parent jika dibutuhkan
  }

  function handleStart() {
    if (!playerName.trim()) return alert('Masukkan nama!');
    if (!selectedAvatar) return alert('Pilih avatar dulu!');
    onStart(playerName, selectedAvatar);
  }

  return (
    <div>
      <div id="title">
          <img src="/assets/logo1.png"/>
          <h1>Ucup Menjelajah Nusantara</h1>
      </div>
      <div id="avatar-selection">
        <h2>Pilih avatarmu!</h2>
        <div className="swiper-container">
          <div className="swiper-wrapper">
            {["/assets/ayam ygy.png", "/assets/bebek ygy.png", "/assets/capi ygy.png"].map((img) => (
              <div className="swiper-slide" key={img}>
                <img
                  src={img}
                  alt={img}
                  style={{
                    border: selectedAvatar === img ? '5px solid green' : 'none'
                  }}
                  onClick={() => handleAvatarClick(img)}
                />
              </div>
            ))}
          </div>
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-pagination"></div>
        </div>

        <div id="input-section">
          <input
            type="text"
            placeholder="Masukkan nama"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleStart}>Start</button>
        </div>
      </div>
  </div>
  );
}
