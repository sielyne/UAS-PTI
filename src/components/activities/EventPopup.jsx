import React from "react";
import '../../styles/EventPopup.css'; // Import file CSS

const EventPopup = ({ event, onClose }) => { // Hapus onAttemptActivity dari props
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

  const handleClosePopup = () => {
    alert(`Untuk mendapatkan hadiah event ini, Anda harus melakukan aktivitas '${event.requiredActivity}' di menu Activities saat berada di ${event.location}!`);
    onClose(); // Hanya menutup popup
  };

  const handleGoToActivities = () => {
    alert(`Sekarang pilih aktivitas '${event.requiredActivity}' di menu Activities untuk mengklaim hadiah di ${event.location}!`);
    onClose(); // Hanya menutup popup, tidak langsung memberikan rewards
  };

  return (
    <div className="event-popup-overlay">
      <div className="event-popup-container">
        <div className="event-popup-header">
          <h2 className="event-popup-title">🎉 Event Ditemukan!</h2>
          <button className="event-popup-close" onClick={handleClosePopup}>
            ✕
          </button>
        </div>

        <div className="event-popup-content">
          <div className="event-location">
            <h3>Lokasi Saat Ini: {event.location}</h3>
          </div>

          <div className="event-message">
            <p>{event.message}</p>
          </div>

          <div className="event-rewards">
            {/* Pesan sekarang spesifik untuk requiredActivity */}
            <h4>🎁 Hadiah (Klaim dengan aktivitas '{event.requiredActivity}' di {event.location}):</h4>
            <ul>
              {formatRewards(event.rewards).map((reward, index) => (
                <li key={index}>{reward}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="event-popup-footer">
          <button className="event-popup-button" onClick={handleGoToActivities}>
            Lihat Menu Aktivitas
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;