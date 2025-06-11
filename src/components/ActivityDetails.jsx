import React from 'react';
import '../styles/ActivityDetails.css'; // Import CSS file

const ActivityDetails = ({ location, onActivity }) => {
  const getActivitiesForLocation = (location) => {
    const commonActivities = ['Work'];

    switch (location) {
      case 'Home':
        return [...commonActivities, 'Eat', 'Sleep', 'Take a Bath'];
      case 'Beach':
        return [...commonActivities, 'Eat', 'Play', 'Buy Souvenir', 'Explore'];
      case 'Lake':
        return [...commonActivities, 'Eat', 'Play', 'Buy Souvenir', 'Explore'];
      case 'Mountain':
        return [...commonActivities, 'Eat', 'Play', 'Buy Souvenir', 'Explore'];
      case 'Temple':
        return [...commonActivities, 'Eat', 'Pray', 'Buy Souvenir', 'Explore'];
      default:
        return commonActivities;
    }
  };

  const activities = getActivitiesForLocation(location);

  return (
    <div className="activity-details-container">
      <h3 className="activity-details-title">
        Activities at {location}
      </h3>
      <div className="activity-details-buttons">
        {activities.map((activity) => (
          <button
            key={activity}
            onClick={() => onActivity(activity)}
            className="activity-details-button"
          >
            {activity}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityDetails;