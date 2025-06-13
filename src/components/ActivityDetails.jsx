// components/ActivityDetails.jsx
import React from 'react';
import '../styles/ActivityDetails.css';

import HomeActivities from './activities/HomeActivities';
import BeachActivities from './activities/BeachActivities';
import LakeActivities from './activities/LakeActivities';
import MountainActivities from './activities/MountainActivities';
import TempleActivities from './activities/TempleActivities';

// ActivityDetails sekarang menerima prop 'player'
const ActivityDetails = ({ location, onActivity, player }) => { // <--- TAMBAHKAN 'player' DI SINI
  const renderActivitiesForLocation = (currentLocation) => {
    switch (currentLocation) {
      case 'MainMap':
        return (
          <>
            <h4 className="activity-details-title">Events:</h4>
            <p className="activity-link" onClick={() => onActivity('Go to Home')}>Go to Home</p>
            <p className="activity-link" onClick={() => onActivity('Go to Temple')}>Go to Temple</p>
            <p className="activity-link" onClick={() => onActivity('Go to Beach')}>Go to Beach</p>
            <p className="activity-link" onClick={() => onActivity('Go to Lake')}>Go to Lake</p>
            <p className="activity-link" onClick={() => onActivity('Go to Mountain')}>Go to Mountain</p>
          </>
        );
      case 'Home':
        return <HomeActivities onActivity={onActivity} player={player} />; // <--- TERUSKAN 'player' KE HomeActivities
      case 'Beach':
        return <BeachActivities onActivity={onActivity} player={player} />; // <--- TERUSKAN 'player' KE BeachActivities
      case 'Lake':
        return <LakeActivities onActivity={onActivity} player={player} />; // <--- TERUSKAN 'player' KE LakeActivities
      case 'Mountain':
        return <MountainActivities onActivity={onActivity} player={player} />; // <--- TERUSKAN 'player' KE MountainActivities
      case 'Temple':
        return <TempleActivities onActivity={onActivity} player={player} />; // <--- TERUSKAN 'player' KE TempleActivities
      default:
        return <p>No activities available for this location.</p>;
    }
  };

  return (
    <div className="activity-details-container">
      <h3 className="activity-details-title">
        {location === 'MainMap' ? 'Main Map Events' : `Activities at ${location}`}
      </h3>
      <div className="activity-details-list">
        {renderActivitiesForLocation(location)}
      </div>
    </div>
  );
};

export default ActivityDetails;