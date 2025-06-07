// App.jsx
import React, { useState, useEffect } from 'react';
import AvatarSelection from './components/AvatarSelection.jsx';
import ActivityDetails from './components/ActivityDetails.jsx';
import GameInterface from './components/GameInterface.jsx';
import Status from './components/Status.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import Inventory from './components/Inventory.jsx';
import Joystick from './components/Joystick.jsx';
import './App.css';

const App = () => {
  const [player, setPlayer] = useState({
    name: "",
    avatar: "",
    money: 25000000,
    happiness: 50,
    hunger: 50,
    hygiene: 50,
    energy: 50,
    location: "Home",
    inventory: { 
      'Daging': { type: 'food', stock: 2 },
      'Mobil': { type: 'transport', stock: 1 },
    }
  });
  const [gameTime, setGameTime] = useState({
    hour: 8,
    minute: 0,
    day: 1
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [timeInterval, setTimeInterval] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isDoingActivity, setIsDoingActivity] = useState(false);
  const [isFastForward, setIsFastForward] = useState(false);
  const [activityInProgress, setActivityInProgress] = useState("");
  const handleFastForward = () => {
  setIsFastForward(true);
};

  useEffect(() => {
    document.body.classList.add("fade-in");
  }, []);

  const selectAvatar = (avatarName) => {
    setPlayer(prevPlayer => ({ ...prevPlayer, avatar: avatarName }));
  };

  const startGameTime = () => {
    const REAL_WORLD_INTERVAL_MS = 20 * 1000;
    const GAME_TIME_INCREMENT_MINUTES = 10;

    const interval = setInterval(() => {
      setGameTime(prevTime => {
        let newMinute = prevTime.minute + GAME_TIME_INCREMENT_MINUTES;
        let newHour = prevTime.hour;
        let newDay = prevTime.day;

        if (newMinute >= 60) {
          newHour += Math.floor(newMinute / 60);
          newMinute = newMinute % 60; 

          if (Math.floor(prevTime.hour / 6) !== Math.floor(newHour / 6)) {
              decreasePlayerStatus();
          }
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24); 
          newHour = newHour % 24;
        }

        return { ...prevTime, hour: newHour, minute: newMinute, day: newDay };
      });
    }, REAL_WORLD_INTERVAL_MS);
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
      location: "Home",
      inventory: { 
        'Daging': { type: 'food', stock: 2 },
        'Mobil': { type: 'transport', stock: 1 },
      }
    });
    setGameTime({ hour: 8, minute: 0, day: 1 });
    setGameStarted(false);
    setGameOver(false);
  };

  const calculateScore = () => {
  let score = 0;
  score += player.happiness + player.energy + player.hunger + player.hygiene;
  score += Object.keys(player.inventory).length * 10;
  return score;
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
          alert("Anda bekerja di rumah. +Rp500.000, -15 Energi, -10 Kebersihan, -10 Lapar.");
        } else {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            money: prevPlayer.money + 1000000,
            energy: Math.max(0, prevPlayer.energy - 20),
            hygiene: Math.max(0, prevPlayer.hygiene - 15),
            hunger: Math.max(0, prevPlayer.hunger - 15),
          }));
          alert(`Anda bekerja di ${player.location}. +Rp1.000.000, -20 Energi, -15 Kebersihan, -15 Lapar.`);
        }
        break;
      case 'Eat':
        if (player.location === 'Home') {
          if (player.inventory['Daging'] && player.inventory['Daging'].stock > 0) {
            setPlayer(prevPlayer => ({
              ...prevPlayer,
              hunger: Math.min(100, prevPlayer.hunger + 30),
              energy: Math.min(100, prevPlayer.energy + 5),
              inventory: {
                ...prevPlayer.inventory,
                'Daging': { ...prevPlayer.inventory['Daging'], stock: prevPlayer.inventory['Daging'].stock - 1 }
              }
            }));
            alert("Anda makan Daging masakan rumah. +30 Lapar, +5 Energi, -1 Daging.");
          } else {
            alert("Anda tidak punya Daging untuk dimakan di rumah!");
            return;
          }
        } else {
          if (player.money >= 100000) {
            setPlayer(prevPlayer => ({
              ...prevPlayer,
              money: prevPlayer.money - 100000,
              hunger: Math.min(100, prevPlayer.hunger + 40),
              happiness: Math.min(100, prevPlayer.happiness + 10),
              energy: Math.min(100, prevPlayer.energy + 10),
            }));
            alert(`Anda makan di restoran ${player.location}. -Rp100.000, +40 Lapar, +10 Kebahagiaan, +10 Energi.`);
          } else {
            alert("Uang Anda tidak cukup untuk makan di restoran!");
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
          alert(`Anda berenang di ${player.location}. +25 Kebahagiaan, -20 Energi, -10 Kebersihan.`);
        } else if (player.location === 'Lake') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 25),
            energy: Math.max(0, prevPlayer.energy - 20),
            hygiene: Math.max(0, prevPlayer.hygiene - 10),
            inventory: { // Tambahkan Ikan ke inventaris
              ...prevPlayer.inventory,
              'Ikan': { type: 'food', stock: (prevPlayer.inventory['Ikan']?.stock || 0) + 1 }
            }
          }));
          alert(`Anda memancing di ${player.location}. +25 Kebahagiaan, -20 Energi, -10 Kebersihan, +1 Ikan.`);
        } else if (player.location === 'Mountain') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30),
            energy: Math.max(0, prevPlayer.energy - 25),
            hunger: Math.max(0, prevPlayer.hunger - 15),
          }));
          alert(`Anda mendaki di Gunung. +30 Kebahagiaan, -25 Energi, -15 Lapar.`);
        } else {
          alert(`Anda tidak bisa bermain di ${player.location}!`);
          return;
        }
        break;
      case 'Sleep':
        if (player.location === 'Home') {
          setPlayer(prevPlayer => ({ ...prevPlayer, energy: Math.min(100, prevPlayer.energy + 50) }));
          setGameTime(prevTime => ({ ...prevTime, hour: Math.min(24, prevTime.hour + 6), minute: 0 }));
          alert("Anda tidur. +50 Energi, 6 jam berlalu.");
        } else {
          alert("Anda hanya bisa tidur di rumah!");
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
          alert("Anda mandi. +40 Kebersihan, -5 Energi.");
        } else {
          alert("Anda hanya bisa mandi di rumah!");
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
              inventory: {
                ...prevPlayer.inventory,
                'Souvenir': { type: 'collectible', stock: (prevPlayer.inventory['Souvenir']?.stock || 0) + 1 }
              }
            }));
            alert(`Anda membeli suvenir di ${player.location}. -Rp200.000, +20 Kebahagiaan, +1 Suvenir.`);
          } else {
            alert("Uang Anda tidak cukup untuk membeli suvenir!");
            return;
          }
        } else {
          alert("Tidak ada suvenir untuk dibeli di rumah!");
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
          alert(`Anda menjelajahi ${player.location}. +25 Kebahagiaan, -20 Energi, -10 Kebersihan.`);
        } else {
          alert("Tidak ada yang baru untuk dijelajahi di rumah!");
          return;
        }
        break;
      case 'Pray':
        if (player.location === 'Temple') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30),
            energy: Math.min(100, player.energy + 10), // Menggunakan player.energy, bukan prevPlayer.energy
          }));
          alert("Anda berdoa di Kuil. +30 Kebahagiaan, +10 Energi.");
        } else {
          alert("Anda hanya bisa berdoa di Kuil!");
          return;
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="app-container">
      {!gameStarted && (
        <AvatarSelection onAvatarSelect={selectAvatar} onStartGame={startGame} />
      )}
      {gameStarted && !gameOver && (
        <div id="game-screen-layout"> 
          <Status player={player} gameTime={gameTime} />
          <div className="game-content-area"> 
            //<Joystick onMove={handleMove} />
            <GameInterface player={player} /> 
              {isDoingActivity && (
                   <button onClick={handleFastForward} className="fast-forward-button">
                   Fast Forward
                   </button>
              )}
            <Inventory playerInventory={player.inventory} playerMoney={player.money} />
          </div>
        </div>
      )}
      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}
    </div> 
  );
};

export default App;

/*<div className="side-panel">
              <ActivityDetails location={player.location} onActivity={handleActivity} isVisible={true} />
            </div>*/
