import React, { useState, useEffect } from 'react';
import './App.css'
import AvatarSelection from './components/AvatarSelection.jsx';
import ActivityDetails from './components/ActivityDetails.jsx';
import GameInterface from './components/GameInterface.jsx';
import Status from './components/Status.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';

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

  const handleMove = (direction) => {
        if (player.energy < 5) {
          alert("You don't have enough energy to move!");
          return;
        }
    
        let newLocation = player.location;
        if (direction === 'up') {
          if (player.location === 'Home') newLocation = 'Mountain';
          else if (player.location === 'Lake') newLocation = 'Home';
          else if (player.location === 'Beach') newLocation = 'Temple';
          else if (player.location === 'Temple') newLocation = 'Mountain';
        } else if (direction === 'down') {
          if (player.location === 'Home') newLocation = 'Lake';
          else if (player.location === 'Mountain') newLocation = 'Temple';
          else if (player.location === 'Temple') newLocation = 'Beach';
          else if (player.location === 'Beach') newLocation = 'Lake';
        } else if (direction === 'left') {
          if (player.location === 'Mountain') newLocation = 'Home';
          else if (player.location === 'Temple') newLocation = 'Home';
          else if (player.location === 'Beach') newLocation = 'Lake';
        } else if (direction === 'right') {
          if (player.location === 'Home') newLocation = 'Temple';
          else if (player.location === 'Lake') newLocation = 'Beach';
          else if (player.location === 'Temple') newLocation = 'Mountain';
        }
    
        if (newLocation !== player.location) {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            location: newLocation,
            energy: Math.max(0, prevPlayer.energy - 5),
            money: prevPlayer.money - 500000,
            happiness: Math.min(100, prevPlayer.happiness + 5),
          }));
        }
      };

    const handleActivity = (activity) => {
        switch (activity) {
          case 'Work':
            if (player.location === 'Home') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                money: prevPlayer.money + 500000,
                energy: Math.max(0, prevPlayer.energy - 15),
                hygiene: Math.max(0, prevPlayer.hygiene - 10),
                hunger: Math.max(0, prevPlayer.hunger - 10),
              }));
              alert("You worked at home. +Rp500.000, -15 Energy, -10 Hygiene, -10 Hunger");
            } else {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                money: prevPlayer.money + 1000000,
                energy: Math.max(0, prevPlayer.energy - 20),
                hygiene: Math.max(0, prevPlayer.hygiene - 15),
                hunger: Math.max(0, prevPlayer.hunger - 15),
              }));
              alert(`You worked at ${player.location}. +Rp1.000.000, -20 Energy, -15 Hygiene, -15 Hunger`);
            }
            break;
          case 'Eat':
            if (player.location === 'Home') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                hunger: Math.min(100, prevPlayer.hunger + 30),
                energy: Math.min(100, prevPlayer.energy + 5),
              }));
              alert("You ate home-cooked food. +30 Hunger, +5 Energy");
            } else {
              if (player.money >= 100000) {
                setPlayer(prevPlayer => ({
                  ...prevPlayer,
                  money: prevPlayer.money - 100000,
                  hunger: Math.min(100, prevPlayer.hunger + 40),
                  happiness: Math.min(100, prevPlayer.happiness + 10),
                  energy: Math.min(100, prevPlayer.energy + 10),
                }));
                alert(`You ate at a restaurant in ${player.location}. -Rp100.000, +40 Hunger, +10 Happiness, +10 Energy`);
              } else {
                alert("You don't have enough money to eat at a restaurant!");
                return;
              }
            }
            break;
          case 'Play':
            if (player.location === 'Beach') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 25),
                energy: Math.max(0, prevPlayer.energy - 20),
                hygiene: Math.max(0, prevPlayer.hygiene - 10),
              }));
              alert(`You enjoyed swimming at ${player.location}. +25 Happiness, -20 Energy, -10 Hygiene`);
            } else if (player.location === 'Lake') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 25),
                energy: Math.max(0, prevPlayer.energy - 20),
                hygiene: Math.max(0, prevPlayer.hygiene - 10),
              }));
              alert(`You enjoyed fishing at ${player.location}. +25 Happiness, -20 Energy, -10 Hygiene`);
            } else if (player.location === 'Mountain') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 30),
                energy: Math.max(0, prevPlayer.energy - 25),
                hunger: Math.max(0, prevPlayer.hunger - 15),
              }));
              alert(`You hiked at the Mountain. +30 Happiness, -25 Energy, -15 Hunger`);
            } else {
              alert(`You can't play at ${player.location}!`);
              return;
            }
            break;
          case 'Sleep':
            if (player.location === 'Home') {
              setPlayer(prevPlayer => ({ ...prevPlayer, energy: Math.min(100, prevPlayer.energy + 50) }));
              setGameTime(prevTime => ({ ...prevTime, hour: Math.min(24, prevTime.hour + 6), minute: 0 }));
              alert("You slept. +50 Energy, 6 hours passed");
            } else {
              alert("You can only sleep at home!");
              return;
            }
            break;
          case 'Take a Bath':
            if (player.location === 'Home') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                hygiene: Math.min(100, prevPlayer.hygiene + 40),
                energy: Math.max(0, prevPlayer.energy - 5),
              }));
              alert("You took a bath. +40 Hygiene, -5 Energy");
            } else {
              alert("You can only take a bath at home!");
              return;
            }
          break;
          case 'Buy Souvenir':
            if (player.location !== 'Home') {
              if (player.money >= 200000) {
                setPlayer(prevPlayer => ({
                  ...prevPlayer,
                  money: prevPlayer.money - 200000,
                  happiness: Math.min(100, prevPlayer.happiness + 20),
                }));
                alert(`You bought a souvenir at ${player.location}. -Rp200.000, +20 Happiness`);
              } else {
                alert("You don't have enough money to buy a souvenir!");
                return;
              }
            } else {
              alert("There are no souvenirs to buy at home!");
              return;
            }
            break;
          case 'Explore':
            if (player.location !== 'Home') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 25),
                energy: Math.max(0, prevPlayer.energy - 20),
                hygiene: Math.max(0, prevPlayer.hygiene - 10),
              }));
              alert(`You explored ${player.location}. +25 Happiness, -20 Energy, -10 Hygiene`);
            } else {
              alert("There's nothing new to explore at home!");
              return;
            }
            break;
          case 'Pray':
            if (player.location === 'Temple') {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 20),
                energy: Math.max(0, prevPlayer.energy - 10),
              }));
              alert("You prayed at the Temple. +20 Happiness, -10 Energy");
            } else {
              alert("You can only pray at the Temple!");
              return;
            }
            break;
          default:
            break;
        }
      };

  return (
    <div>
      {!gameStarted && (
        <AvatarSelection onAvatarSelect={selectAvatar} onStartGame={startGame} />
      )}
      {gameStarted && !gameOver && (
        <div id="game-container">
          <Status player={player} gameTime={gameTime} />
          <GameInterface player={player} onMove={handleMove} />
          <ActivityDetails location={player.location} onActivity={handleActivity} isVisible={true} />
        </div>
      )}
      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}
    </div>
  );
};

export default App;