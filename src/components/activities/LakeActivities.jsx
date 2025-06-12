import React from 'react';

const LakeActivities = ({ onActivity }) => {
  return (
    <>
      <div className="activity-option">
        <span className="info-icon" title="Work at Lake to earn +Rp1.000.000. This action will consume -20 Energy, -15 Hygiene, -15 Hunger!">
          i
        </span>
        <button onClick={() => onActivity('Work')}>Work</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="Eat at restaurant in Lake to earn +40 Hunger, +10 Happiness and +10 Energy. This action will consume -Rp100.000!">
          i
        </span>
        <button onClick={() => onActivity('Eat')}>Eat</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="Fishing at Lake to earn +25 Happiness. This action will consume -20 Energy and -10 Hygiene!">
          i
        </span>
        <button onClick={() => onActivity('Fishing')}>Fishing</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="Buy a souvenir at Lake to earn +20 Happiness. This action will consume -Rp200.000!">
          i
        </span>
        <button onClick={() => onActivity('Buy Souvenir')}>Buy Souvenir</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="Explore Lake to earn +25 Happiness. This action consume -20 Energy and -10 Hygiene">
          i
        </span>
        <button onClick={() => onActivity('Explore')}>Explore Area</button>
      </div>
    </>
  );
};

export default LakeActivities;
