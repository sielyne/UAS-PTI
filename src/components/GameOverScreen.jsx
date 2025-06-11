import React from 'react';
import '../styles/GameOverScreen.css'; // Import CSS file

const GameOverScreen = ({ player, onRestart }) => {
  return (
    <div className="game-over-container">
      <h1 className="game-over-title">Game Over!</h1>
      <p className="game-over-message">
        {player.name}, your journey has ended.
      </p>
      <p className="final-money">
        Final Money: Rp{player.money.toLocaleString()}
      </p>
      <button
        onClick={onRestart}
        className="play-again-button"
      >
        Play Again
      </button>
    </div>
  );
};

export default GameOverScreen;