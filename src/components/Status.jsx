import React, { useEffect } from 'react';

const Status = ({ player, gameTime }) => {
  const updateBarColors = (barId, value) => {
    const bar = document.getElementById(barId);
    if (bar) {
      if (value <= 20) {
        bar.style.backgroundColor = "red";
      } else if (value <= 50) {
        bar.style.backgroundColor = "orange";
      } else if (value <= 80) {
        bar.style.backgroundColor = "yellowgreen";
      } else {
        bar.style.backgroundColor = "green";
      }
    }
  };

  const formatTime = () => {
    const hourFormatted = gameTime.hour.toString().padStart(2, '0');
    const minuteFormatted = gameTime.minute.toString().padStart(2, '0');
    return `Day ${gameTime.day} - ${hourFormatted}:${minuteFormatted}`;
  };

  const getGreeting = () => {
    const hour = gameTime.hour;
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon";
    } else if (hour >= 18 && hour < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  useEffect(() => {
    updateBarColors('happiness-bar', player.happiness);
    updateBarColors('hunger-bar', player.hunger);
    updateBarColors('hygiene-bar', player.hygiene);
    updateBarColors('energy-bar', player.energy);
  }, [player.happiness, player.hunger, player.hygiene, player.energy]);

  return (
    <div id="status">
      <div id="status-container">
        <div id="greeting-time">
          <span id="greeting">{`${getGreeting()}, ${player.name}!`}</span>
          <span>Money(Rp.{player.money.toLocaleString()})</span>
          <span id="current-time">{formatTime()}</span>
        </div>
        <div id="status-life">
          <div className="life-bar">
            <span>Happiness</span>
            <div className="bar">
              <div className="fill" id="happiness-bar" style={{ width: `${player.happiness}%` }}></div>
            </div>
            <span id="happiness">{player.happiness}</span>
          </div>
          <div className="life-bar">
            <span>Hunger</span>
            <div className="bar">
              <div className="fill" id="hunger-bar" style={{ width: `${player.hunger}%` }}></div>
            </div>
            <span id="hunger">{player.hunger}</span>
          </div>
          <div className="life-bar">
            <span>Hygiene</span>
            <div className="bar">
              <div className="fill" id="hygiene-bar" style={{ width: `${player.hygiene}%` }}></div>
            </div>
            <span id="hygiene">{player.hygiene}</span>
          </div>
          <div className="life-bar">
            <span>Energy</span>
            <div className="bar">
              <div className="fill" id="energy-bar" style={{ width: `${player.energy}%` }}></div>
            </div>
            <span id="energy">{player.energy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;