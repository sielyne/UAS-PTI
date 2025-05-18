import React from 'react';
import HomeActivities from './activities/HomeActivities.jsx';
import LakeActivities from './activities/LakeActivities.jsx';
import MountainActivities from './activities/MountainActivities.jsx';
import TempleActivities from './activities/TempleActivities.jsx';
import BeachActivities from './activities/BeachActivities.jsx';

const ActivityDetails = ({ location, onActivity, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div id={`activity-${location.toLowerCase()}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="location-greeting">You're at {location}!</div>
      <div className="activity-panel">
        {location === 'Home' && <HomeActivities onActivity={onActivity} />}
        {location === 'Lake' && <LakeActivities onActivity={onActivity} />}
        {location === 'Mountain' && <MountainActivities onActivity={onActivity} />}
        {location === 'Temple' && <TempleActivities onActivity={onActivity} />}
        {location === 'Beach' && <BeachActivities onActivity={onActivity} />}
      </div>
    </div>
  );
};

export default ActivityDetails;