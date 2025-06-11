import React from 'react';
import '../styles/Status.css'; // Import CSS file

const Status = ({ player, gameTime }) => {
  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (value) => {
    if (value >= 70) return '#27ae60';
    if (value >= 40) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="status-bar-container">
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        <p className="player-location">Location: {player.location}</p>
        <p className="player-money">Money: Rp{player.money.toLocaleString()}</p>
      </div>

      <div className="game-time">
        <p className="game-day">Day {gameTime.day}</p>
        <p className="game-clock">{formatTime(gameTime.hour, gameTime.minute)}</p>
      </div>

      <div className="player-stats">
        {[
          { label: 'Happiness', value: player.happiness },
          { label: 'Hunger', value: player.hunger },
          { label: 'Hygiene', value: player.hygiene },
          { label: 'Energy', value: player.energy }
        ].map(stat => (
          <div key={stat.label} className="stat-item">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-bar-background">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${stat.value}%`,
                  backgroundColor: getStatusColor(stat.value),
                }}
              />
            </div>
            <div className="stat-value">{stat.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Status;