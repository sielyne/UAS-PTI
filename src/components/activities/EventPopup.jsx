import React from "react";
import '../../styles/EventPopup.css'; // Import CSS file

const EventPopup = ({ event, onClose }) => { // Removed onAttemptActivity from props
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
    alert(`To get this event's rewards, you must perform the '${event.requiredActivity}' activity in the Activities menu while in ${event.location}!`);
    onClose(); // Only closes the popup
  };

  const handleGoToActivities = () => {
    alert(`Now select the '${event.requiredActivity}' activity in the Activities menu to claim the rewards at ${event.location}!`);
    onClose(); // Only closes the popup, does not directly grant rewards
  };

  return (
    <div className="event-popup-overlay">
      <div className="event-popup-container">
        <div className="event-popup-header">
          <h2 className="event-popup-title">🎉 Event Discovered!</h2>
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
            {/* Message is now specific to requiredActivity */}
            <h4>🎁 Rewards (Claim by performing '{event.requiredActivity}' activity in {event.location}):</h4>
            <ul>
              {formatRewards(event.rewards).map((reward, index) => (
                <li key={index}>{reward}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="event-popup-footer">
          <button className="event-popup-button" onClick={handleGoToActivities}>
            View Activities Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
