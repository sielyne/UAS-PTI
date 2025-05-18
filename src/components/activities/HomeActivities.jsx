import React from 'react';

const HomeActivities = ({ onActivity }) => {
  return (
    <>
      <div className="activity-option">
        <span className="info-icon" title="Work to earn +Rp500.000. This action will consume -15 Energy, -10 Hygiene, -10 Hunger!">
          i
        </span>
        <button onClick={() => onActivity('Work')}>Work</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="Eat home-cooked food to earn +30 Hunger and +5 Energy!">
          i
        </span>
        <button onClick={() => onActivity('Eat')}>Eat</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="Take a bath to earn +40 Hygiene. This action will consume -5 Energy!">
          i
        </span>
        <button onClick={() => onActivity('Take a Bath')}>Take a Bath</button>
      </div>
      <div className="activity-option">
        <span className="info-icon" title="get some sleep to earn +50 Energy, 6 hours will passed!">
          i
        </span>
        <button onClick={() => onActivity('Sleep')}>Sleep</button>
      </div>
    </>
  );
};

export default HomeActivities;