// src/components/activities/EventPopup.jsx (atau di mana pun file ini berada)
import React from "react";
import '../../styles/EventPopup.css';

const EventPopup = ({ event, onClose, onAttemptActivity }) => { // onAttemptActivity adalah applyEventRewards
  const formatRewards = (rewards) => {
    const rewardsList = [];

    if (rewards.happiness) {
      rewardsList.push(`Happiness: ${rewards.happiness > 0 ? '+' : ''}${rewards.happiness}`);
    }
    if (rewards.energy) {
      rewardsList.push(`Energy: ${rewards.energy > 0 ? '+' : ''}${rewards.energy}`);
    }
    if (rewards.hunger) {
      rewardsList.push(`Hunger: ${rewards.hunger > 0 ? '+' : ''}${rewards.hunger}`);
    }
    if (rewards.hygiene) {
      rewardsList.push(`Hygiene: ${rewards.hygiene > 0 ? '+' : ''}${rewards.hygiene}`);
    }
    if (rewards.money) {
      rewardsList.push(`Money: +Rp${rewards.money.toLocaleString()}`);
    }
    if (rewards.inventory) {
      Object.entries(rewards.inventory).forEach(([itemName, itemData]) => {
        rewardsList.push(`${itemName}: +${itemData.stock}`);
      });
    }

    return rewardsList;
  };

  // Ubah fungsi ini jika tombol '✕' juga harus memberikan rewards
  // Atau tetap seperti ini jika '✕' hanya menutup tanpa rewards
  const handleClosePopup = () => {
    // Pesan ini hanya jika Anda ingin pemain MENUNDA mendapatkan hadiah
    // Jika tombol 'Go to Activities Menu' langsung memberikan hadiah, pesan ini bisa dihapus
    alert(`Event akan tetap aktif di ${event.location}. Anda bisa mendapatkan hadiah dengan mengklik "Go to Activities Menu" atau melakukan aktivitas 'Event' di sana.`);
    onClose();
  };

  // src/components/activities/EventPopup.jsx

// ... (kode di atasnya sama) ...

const handleCollectRewards = () => {
  console.log("EventPopup: Tombol 'Klaim Hadiah & Tutup' diklik."); // DEBUGGING
  onAttemptActivity(); // Ini adalah applyEventRewards dari App.js
  onClose(); // Menutup popup
};

// ... (kode di bawahnya sama) ...

  return (
    <div className="event-popup-overlay">
      <div className="event-popup-container">
        <div className="event-popup-header">
          <h2 className="event-popup-title">🎉 Event</h2>
          <button className="event-popup-close" onClick={handleClosePopup}>
            ✕
          </button>
        </div>

        <div className="event-popup-content">
          <div className="event-location">
            <h3>Current Location: {event.location}</h3>
          </div>

          <div className="event-message">
            <p>{event.message}</p>
          </div>

          <div className="event-rewards">
            {/* Ubah teks ini agar lebih jelas */}
            <h4>🎁 Rewards (klik tombol di bawah untuk klaim):</h4>
            <ul>
              {formatRewards(event.rewards).map((reward, index) => (
                <li key={index}>{reward}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="event-popup-footer">
          <button className="event-popup-button" onClick={handleCollectRewards}>
            Klaim Hadiah & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;