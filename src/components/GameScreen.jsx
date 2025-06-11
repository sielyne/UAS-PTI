import React from 'react';
import Status from './Status';
import MapAndAvatar from './MapAndAvatar';
import Joystick from './Joystick';
import ActivityDetails from './ActivityDetails';
import Inventory from './Inventory';
import EventPopup from './activities/EventPopup';
import '../styles/GameScreen.css';

const GameScreen = ({
  player,
  gameTime,
  avatarPosition,
  onMove,
  onBackToMainMap,
  onActivity,
  isWalking //
}) => {
  return (
    <div className="game-screen-container">
      {/* Status Bar - Always at the very top */}
      <Status player={player} gameTime={gameTime} />

      {/* Main Game Area - Using CSS Grid for Map and Sidebar */}
      <div className="game-main-area">
        {/* Left Column: Map and Avatar */}
        <div className="game-map-column"> {/* New wrapper for map for finer control */}
          <MapAndAvatar player={player} avatarPosition={avatarPosition} isWalking={isWalking} />

          {/* Floating Controls (Joystick & Back Button) - Positioned over the map */}
          <div className="game-overlay-controls">
            <Joystick onMove={onMove} />

            {player.location !== 'MainMap' && (
              <button
                onClick={onBackToMainMap}
                className="back-to-main-map-button"
              >
                Back to Main Map
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar for Activities and Inventory */}
        <div className="game-right-sidebar"> {/* New container for Activity and Inventory */}
          <ActivityDetails location={player.location} onActivity={onActivity} />
          <Inventory playerInventory={player.inventory} playerMoney={player.money} />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
