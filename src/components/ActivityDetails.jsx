// components/ActivityDetails.jsx
import React from 'react';
import '../styles/ActivityDetails.css';

// Import semua komponen aktivitas per lokasi yang sudah Anda buat
import HomeActivities from './activities/HomeActivities';
import BeachActivities from './activities/BeachActivities';
import LakeActivities from './activities/LakeActivities';
import MountainActivities from './activities/MountainActivities';
import TempleActivities from './activities/TempleActivities';
// import MainMapActivities (jika Anda membuat komponen terpisah untuk ini, saat ini main map sudah di handle langsung)

const ActivityDetails = ({ location, onActivity }) => {
  // Fungsi ini sekarang akan mengembalikan KOMPONEN React, bukan array string
  const renderActivitiesForLocation = (currentLocation) => {
    switch (currentLocation) {
      case 'MainMap':
        // Jika MainMap, render daftar link event (seperti yang sudah Anda lakukan)
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
        return <HomeActivities onActivity={onActivity} />;
      case 'Beach':
        return <BeachActivities onActivity={onActivity} />;
      case 'Lake':
        return <LakeActivities onActivity={onActivity} />;
      case 'Mountain':
        return <MountainActivities onActivity={onActivity} />;
      case 'Temple':
        return <TempleActivities onActivity={onActivity} />;
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
        {renderActivitiesForLocation(location)} {/* Panggil fungsi render yang sekarang mengembalikan komponen */}
      </div>
    </div>
  );
};

export default ActivityDetails;