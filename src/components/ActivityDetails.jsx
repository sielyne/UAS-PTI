// components/ActivityDetails.jsx
import React from 'react';
import '../styles/ActivityDetails.css'; // Pastikan file CSS ini terhubung

const ActivityDetails = ({ location, onActivity }) => {
  const getActivitiesForLocation = (currentLocation) => {
    if (currentLocation === 'MainMap') {
      return (
        <>
          <h4 className="activity-details-title">Events:</h4> {/* Judul untuk bagian event */}
          <p className="activity-link" onClick={() => onActivity('Go to Home')}>Go to Home</p>
          <p className="activity-link" onClick={() => onActivity('Go to Temple')}>Go to Temple</p>
          <p className="activity-link" onClick={() => onActivity('Go to Beach')}>Go to Beach</p>
          <p className="activity-link" onClick={() => onActivity('Go to Lake')}>Go to Lake</p>
          <p className="activity-link" onClick={() => onActivity('Go to Mountain')}>Go to Mountain</p>
        </>
      );
    } else {
      switch (currentLocation) {
        case 'Home':
          return ['Eat', 'Sleep', 'Take a Bath', 'Event'];
        case 'Beach':
          return ['Eat', 'Play', 'Buy Souvenir', 'Explore', 'Event'];
        case 'Lake':
          return ['Eat', 'Play', 'Buy Souvenir', 'Explore', 'Event'];
        case 'Mountain':
          return ['Eat', 'Play', 'Buy Souvenir', 'Explore', 'Event'];
        case 'Temple':
          return ['Eat', 'Pray', 'Buy Souvenir', 'Explore', 'Event'];
        default:
          return [];
      }
    }
  };

  return (
    <div className="activity-details-container">
      <h3 className="activity-details-title">
        {location === 'MainMap' ? 'Main Map Events' : `Activities at ${location}`}
      </h3>
      <div className="activity-details-list">
        {location === 'MainMap' ? (
          getActivitiesForLocation(location)
        ) : (
          getActivitiesForLocation(location).map((activity) => (
            <button
              key={activity}
              onClick={() => onActivity(activity)}
              className="activity-details-button"
            >
              {activity}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityDetails;
