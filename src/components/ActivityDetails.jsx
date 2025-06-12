// components/ActivityDetails.jsx
import React from 'react';
import '../styles/ActivityDetails.css';

// Import semua komponen aktivitas per lokasi yang sudah Anda buat
// Ini berasal dari Version 2
import HomeActivities from './activities/HomeActivities';
import BeachActivities from './activities/BeachActivities';
import LakeActivities from './activities/LakeActivities';
import MountainActivities from './activities/MountainActivities';
import TempleActivities from './activities/TempleActivities';

const ActivityDetails = ({ location, onActivity }) => {
  // Fungsi ini akan mengembalikan KOMPONEN React (dari Versi 2)
  // atau daftar link event untuk MainMap (dari Versi 1 dan 2)
  const renderActivitiesForLocation = (currentLocation) => {
    switch (currentLocation) {
      case 'MainMap':
        // Logika rendering MainMap dari kedua versi (sama)
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
        // Merender komponen aktivitas Home (dari Versi 2)
        return <HomeActivities onActivity={onActivity} />;
      case 'Beach':
        // Merender komponen aktivitas Beach (dari Versi 2)
        return <BeachActivities onActivity={onActivity} />;
      case 'Lake':
        // Merender komponen aktivitas Lake (dari Versi 2)
        return <LakeActivities onActivity={onActivity} />;
      case 'Mountain':
        // Merender komponen aktivitas Mountain (dari Versi 2)
        return <MountainActivities onActivity={onActivity} />;
      case 'Temple':
        // Merender komponen aktivitas Temple (dari Versi 2)
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
        {/* Memanggil fungsi render yang mengembalikan komponen atau JSX untuk MainMap */}
        {renderActivitiesForLocation(location)}
      </div>
    </div>
  );
};

export default ActivityDetails;