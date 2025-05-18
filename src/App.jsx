import React, { useState, useEffect } from 'react';
import Title from './components/Title.jsx';
import AvatarSelection from './components/AvatarSelection.jsx';
import MainContainer from './components/MainContainer.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import './style.css';

const App = () => {
  const [player, setPlayer] = useState({
    name: "",
    avatar: "",
    money: 25000000,
    happiness: 50,
    hunger: 50,
    hygiene: 50,
    energy: 50,
    location: "Home"
  });
  const [gameTime, setGameTime] = useState({
    hour: 8,
    minute: 0,
    day: 1
  });
  const [gameStarted, setGameStarted] = useState(false);
  const TIME_MULTIPLIER = 60;
  const [timeInterval, setTimeInterval] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    document.body.classList.add("fade-in");
  }, []);

  const selectAvatar = (avatarName) => {
    setPlayer(prevPlayer => ({ ...prevPlayer, avatar: avatarName }));
  };

  const startGameTime = () => {
    const interval = setInterval(() => {
      setGameTime(prevTime => {
        let newMinute = prevTime.minute + 1;
        let newHour = prevTime.hour;
        let newDay = prevTime.day;

        if (newMinute >= 60) {
          newHour++;
          newMinute = 0;
          if (newHour % 6 === 0) {
            decreasePlayerStatus();
          }
        }

        if (newHour >= 24) {
          newDay++;
          newHour = 0;
        }

        return { ...prevTime, hour: newHour, minute: newMinute, day: newDay };
      });
    }, 1000 / TIME_MULTIPLIER);
    setTimeInterval(interval);
  };

  const decreasePlayerStatus = () => {
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      hunger: Math.max(0, prevPlayer.hunger - 1),
      hygiene: Math.max(0, prevPlayer.hygiene - 1),
      energy: Math.max(0, prevPlayer.energy - 1),
      happiness: Math.max(0, prevPlayer.happiness - 1),
    }));
  };

  useEffect(() => {
    if (player.hunger <= 0 || player.hygiene <= 0 || player.energy <= 0 || player.happiness <= 0) {
      clearInterval(timeInterval);
      setGameOver(true);
    }
  }, [player, timeInterval]);

  const startGame = (playerName) => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    if (!player.avatar) {
      alert('Please select an avatar!');
      return;
    }

    setPlayer(prevPlayer => ({ ...prevPlayer, name: playerName }));
    setGameStarted(true);
    startGameTime();
  };

  const restartGame = () => {
    setPlayer({
      name: "",
      avatar: "",
      money: 25000000,
      happiness: 50,
      hunger: 50,
      hygiene: 50,
      energy: 50,
      location: "Home"
    });
    setGameTime({ hour: 8, minute: 0, day: 1 });
    setGameStarted(false);
    setGameOver(false);
  };

  return (
    <div>
      <Title />
      {!gameStarted && (
        <AvatarSelection onAvatarSelect={selectAvatar} onStartGame={startGame} />
      )}
      {gameStarted && !gameOver && (
        <MainContainer player={player} gameTime={gameTime} setPlayer={setPlayer} setGameTime={setGameTime} />
      )}
      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}
    </div>
  );
};

export default App;