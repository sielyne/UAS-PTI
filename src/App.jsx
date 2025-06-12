// src/App.js
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import AvatarSelection from './components/AvatarSelection';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EventPopup from './components/activities/EventPopup';
import './index.css';

const CONSUMABLE_FOOD_EFFECTS = {
  'Daging': { hunger: 30, energy: 5 },
  'Comfort Food': { hunger: 25, happiness: 10, energy: 5 },
  'Freshwater Fish': { hunger: 35, happiness: 5 },
};

const App = () => {
  const [isMoving, setIsMoving] = useState(false);
  const [isWalking, setIsWalking] = useState(false); // Pindahkan state isWalking ke sini
  const [player, setPlayer] = useState({
    name: "",
    avatar: "",
    money: 25000000,
    happiness: 50,
    hunger: 50,
    hygiene: 50,
    energy: 50,
    location: "MainMap",
    inventory: {
      'Daging': { type: 'food', stock: 2 },
      'Mobil': { type: 'transport', stock: 1 },
    }
  });

  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
  const [gameTime, setGameTime] = useState({ hour: 8, minute: 0, day: 1 });
  const [gameStarted, setGameStarted] = useState(false);
  const [timeInterval, setTimeInterval] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const mapAreas = {
    MainMap: {
      Home: { x: [10, 30], y: [10, 30] },
      Mountain: { x: [40, 60], y: [10, 30] },
      Lake: { x: [70, 90], y: [10, 30] },
      Beach: { x: [70, 90], y: [70, 90] },
      Temple: { x: [40, 60], y: [70, 90] }
    }
  };

  const locationEvents = {
    Home: {
      message: "You enjoy a cozy morning routine at home.",
      rewards: {
        happiness: 15,
        energy: 10,
        inventory: { 'Comfort Food': { type: 'food', stock: 1 } }
      },
      activityRequired: true
    },
    Temple: {
      message: "You pray at the temple and feel spiritually refreshed.",
      rewards: {
        happiness: 25,
        energy: 15,
        inventory: { 'Meditation Guide': { type: 'tool', stock: 1 } }
      },
      activityRequired: true
    },
    Beach: {
      message: "You find a rare seashell on the beach.",
      rewards: {
        happiness: 20,
        money: 300000,
        inventory: { 'Rare Seashell': { type: 'collectible', stock: 1 } }
      },
      activityRequired: true
    },
    Lake: {
      message: "You catch a big fish while relaxing by the lake.",
      rewards: {
        happiness: 18,
        hunger: 15,
        inventory: { 'Freshwater Fish': { type: 'food', stock: 1 } }
      },
      activityRequired: true
    },
    Mountain: {
      message: "You hike up the mountain and feel mentally clear.",
      rewards: {
        happiness: 30,
        energy: -10,
        hygiene: -5,
        inventory: { 'Mountain Herb': { type: 'plant', stock: 1 } }
      },
      activityRequired: true
    }
  };

  const selectAvatar = (avatarSrc) => {
    setPlayer(prevPlayer => ({ ...prevPlayer, avatar: avatarSrc }));
  };

  const decreasePlayerStatus = useCallback(() => { // Gunakan useCallback
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      hunger: Math.max(0, prevPlayer.hunger - 1),
      hygiene: Math.max(0, prevPlayer.hygiene - 1),
      energy: Math.max(0, prevPlayer.energy - 1),
      happiness: Math.max(0, prevPlayer.happiness - 1),
    }));
  }, []); // Dependencies kosong karena setPlayer sudah dijamin stabil oleh React

  const startGameTime = useCallback(() => { // Gunakan useCallback
    const REAL_WORLD_INTERVAL_MS = 20 * 1000;
    const GAME_TIME_INCREMENT_MINUTES = 10;

    const interval = setInterval(() => {
      setGameTime(prevTime => {
        let newMinute = prevTime.minute + GAME_TIME_INCREMENT_MINUTES;
        let newHour = prevTime.hour;
        let newDay = prevTime.day;

        if (newMinute >= 60) {
          newHour += Math.floor(newMinute / 60);
          newMinute %= 60;

          if (Math.floor(prevTime.hour / 6) !== Math.floor(newHour / 6)) {
            decreasePlayerStatus(); // Memanggil useCallback
          }
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour %= 24;
        }

        return { ...prevTime, hour: newHour, minute: newMinute, day: newDay };
      });
    }, REAL_WORLD_INTERVAL_MS);
    setTimeInterval(interval);
  }, [decreasePlayerStatus]); // decreasePlayerStatus adalah dependency

  useEffect(() => {
    if (
      player.hunger <= 0 ||
      player.hygiene <= 0 ||
      player.energy <= 0 ||
      player.happiness <= 0
    ) {
      if (timeInterval) clearInterval(timeInterval);
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
    if (timeInterval) clearInterval(timeInterval);
    setTimeInterval(null);
    setPlayer({
      name: "",
      avatar: "",
      money: 25000000,
      happiness: 50,
      hunger: 50,
      hygiene: 50,
      energy: 50,
      location: "MainMap",
      inventory: {
        'Daging': { type: 'food', stock: 2 },
        'Mobil': { type: 'transport', stock: 1 },
      }
    });
    setAvatarPosition({ x: 50, y: 50 });
    setGameTime({ hour: 8, minute: 0, day: 1 });
    setGameStarted(false);
    setGameOver(false);
    setShowEventPopup(false);
    setCurrentEvent(null);
  };

  const triggerLocationEvent = useCallback((location) => { // Gunakan useCallback
    if (locationEvents[location]) {
      setCurrentEvent({
        location: location,
        message: locationEvents[location].message,
        rewards: locationEvents[location].rewards,
        activityRequired: locationEvents[location].activityRequired || false
      });
      setShowEventPopup(true);
    }
  }, []); // Dependencies kosong karena locationEvents sudah stabil

  const checkAreaTransition = useCallback((newX, newY) => { // Gunakan useCallback
    if (player.location === 'MainMap' && mapAreas.MainMap) {
      for (const [area, bounds] of Object.entries(mapAreas.MainMap)) {
        if (newX >= bounds.x[0] && newX <= bounds.x[1] &&
            newY >= bounds.y[0] && newY <= bounds.y[1]) {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            location: area,
            energy: Math.max(0, prevPlayer.energy - 5),
            money: Math.max(0, prevPlayer.money - 500000),
            happiness: Math.min(100, prevPlayer.happiness + 5),
          }));
          setAvatarPosition({ x: 50, y: 50 }); // Reset position in new map
          
          triggerLocationEvent(area); 
          return true;
        }
      }
    }
    return false;
  }, [player.location, mapAreas.MainMap, triggerLocationEvent]); // Dependencies

  const handleMove = useCallback((direction) => { // Gunakan useCallback
    if (player.energy < 5) {
      alert("You don't have enough energy to move!");
      return;
    }

    const moveDistance = 2;
    let newX = avatarPosition.x;
    let newY = avatarPosition.y;

    switch (direction) {
      case 'up':
        newY = Math.max(5, avatarPosition.y - moveDistance);
        break;
      case 'down':
        newY = Math.min(95, avatarPosition.y + moveDistance);
        break;
      case 'left':
        newX = Math.max(5, avatarPosition.x - moveDistance);
        break;
      case 'right':
        newX = Math.min(95, avatarPosition.x + moveDistance);
        break;
      default:
        break;
    }
     setIsWalking(true); // Mulai jalan
  setTimeout(() => setIsWalking(false), 500);

    if (!checkAreaTransition(newX, newY)) {
      setAvatarPosition({ x: newX, y: newY });
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        energy: Math.max(0, prevPlayer.energy - 1)
      }));
    }
  }, [player.energy, avatarPosition, checkAreaTransition]); // Dependencies

  const handleBackToMainMap = useCallback(() => { // Gunakan useCallback
    setPlayer(prevPlayer => ({ ...prevPlayer, location: 'MainMap' }));
    setAvatarPosition({ x: 50, y: 50 });
  }, []); // Dependencies kosong, setPlayer dan setAvatarPosition adalah fungsi React yang stabil

  const applyEventRewards = useCallback(() => { // Gunakan useCallback
    if (currentEvent && currentEvent.rewards) {
        const rewards = currentEvent.rewards;
        let rewardMessage = `Event completed at ${currentEvent.location}!\n\nRewards received:\n`;

        setPlayer(prevPlayer => {
            let newPlayer = { ...prevPlayer };

            if (rewards.happiness) {
                newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + rewards.happiness));
                rewardMessage += `• Happiness: ${rewards.happiness > 0 ? '+' : ''}${rewards.happiness}\n`;
            }
            if (rewards.energy) {
                newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + rewards.energy));
                rewardMessage += `• Energy: ${rewards.energy > 0 ? '+' : ''}${rewards.energy}\n`;
            }
            if (rewards.hunger) {
                newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + rewards.hunger));
                rewardMessage += `• Hunger: ${rewards.hunger > 0 ? '+' : ''}${rewards.hunger}\n`;
            }
            if (rewards.hygiene) {
                newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + rewards.hygiene));
                rewardMessage += `• Hygiene: ${rewards.hygiene > 0 ? '+' : ''}${rewards.hygiene}\n`;
            }
            if (rewards.money) {
                newPlayer.money = Math.max(0, prevPlayer.money + rewards.money);
                rewardMessage += `• Money: +Rp${rewards.money.toLocaleString()}\n`;
            }

            if (rewards.inventory) {
                newPlayer.inventory = { ...prevPlayer.inventory };
                for (const [itemName, itemData] of Object.entries(rewards.inventory)) {
                    if (newPlayer.inventory[itemName]) {
                        newPlayer.inventory[itemName] = {
                            ...newPlayer.inventory[itemName],
                            stock: newPlayer.inventory[itemName].stock + itemData.stock
                        };
                    } else {
                        newPlayer.inventory[itemName] = { ...itemData };
                    }
                    rewardMessage += `• ${itemName}: +${itemData.stock}\n`;
                }
            }
            return newPlayer;
        });
        alert(rewardMessage);
    } else {
        alert("Error: Event data corrupted or not found for rewards!");
    }
    setShowEventPopup(false);
    setCurrentEvent(null);
}, [currentEvent]); // currentEvent adalah dependency

  const handleActivity = useCallback((activity) => { // Gunakan useCallback
    if (activity.startsWith('Go to ')) {
      const targetLocation = activity.replace('Go to ', '');
      if (mapAreas.MainMap[targetLocation]) {
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          location: targetLocation,
          energy: Math.max(0, prevPlayer.energy - 5),
          money: Math.max(0, prevPlayer.money - 500000),
          happiness: Math.min(100, prevPlayer.happiness + 5),
        }));
        setAvatarPosition({ x: 50, y: 50 });
        triggerLocationEvent(targetLocation);
        return;
      }
    }

    switch (activity) {
      case 'Event':
        if (currentEvent && currentEvent.location === player.location && currentEvent.activityRequired) {
          applyEventRewards(); 
        } else {
          alert("No active event requires this activity at your current location, or the event is already completed!");
        }
        break;

      case 'Eat':
        if (player.location === 'Home') {
          const availableFoodItems = Object.keys(player.inventory).filter(itemName =>
            player.inventory[itemName].type === 'food' && player.inventory[itemName].stock > 0 && CONSUMABLE_FOOD_EFFECTS[itemName]
          );

          if (availableFoodItems.length > 0) {
            const itemToEat = availableFoodItems[0];
            const effects = CONSUMABLE_FOOD_EFFECTS[itemToEat];

            setPlayer(prevPlayer => {
              let newPlayer = { ...prevPlayer };

              newPlayer.inventory = {
                ...newPlayer.inventory,
                [itemToEat]: {
                  ...newPlayer.inventory[itemToEat],
                  stock: newPlayer.inventory[itemToEat].stock - 1
                }
              };
              if (newPlayer.inventory[itemToEat].stock <= 0) {
                const { [itemToEat]: _, ...restInventory } = newPlayer.inventory;
                newPlayer.inventory = restInventory;
              }

              let msg = `Anda makan ${itemToEat}. `;
              if (effects.hunger) {
                newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + effects.hunger));
                msg += `${effects.hunger > 0 ? '+' : ''}${effects.hunger} Lapar, `;
              }
              if (effects.energy) {
                newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + effects.energy));
                msg += `${effects.energy > 0 ? '+' : ''}${effects.energy} Energi, `;
              }
              if (effects.happiness) {
                newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + effects.happiness));
                msg += `${effects.happiness > 0 ? '+' : ''}${effects.happiness} Kebahagiaan, `;
              }
              if (effects.hygiene) {
                newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + effects.hygiene));
                msg += `${effects.hygiene > 0 ? '+' : ''}${effects.hygiene} Kebersihan, `;
              }
              msg += `-1 ${itemToEat}.`;
              alert(msg);
              return newPlayer;
            });
          } else {
            alert("Anda tidak punya makanan untuk dimakan di rumah!");
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
            inventory: {
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
        }
        break;

      case 'Sleep':
        if (player.location === 'Home') {
          setPlayer(prevPlayer => ({ ...prevPlayer, energy: Math.min(100, prevPlayer.energy + 50) }));
          setGameTime(prevTime => ({ ...prevTime, hour: Math.min(24, prevTime.hour + 6), minute: 0 }));
          alert("Anda tidur. +50 Energi, 6 jam berlalu.");
        } else {
          alert("Anda hanya bisa tidur di rumah!");
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
                'Souvenir': {
                  type: 'collectible',
                  stock: (prevPlayer.inventory['Souvenir']?.stock || 0) + 1
                }
              }
            }));
            alert(`Anda membeli suvenir di ${player.location}. -Rp200.000, +20 Kebahagiaan, +1 Suvenir.`);
          } else {
            alert("Uang Anda tidak cukup untuk membeli suvenir!");
          }
        } else {
          alert("Tidak ada suvenir untuk dibeli di rumah!");
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
        }
        break;

      case 'Pray':
        if (player.location === 'Temple') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30),
            energy: Math.min(100, prevPlayer.energy + 10),
          }));
          alert("Anda berdoa di Kuil. +30 Kebahagiaan, +10 Energi.");
        } else {
          alert("Anda hanya bisa berdoa di Kuil!");
        }
        break;

      default:
        break;
    }
  }, [player, currentEvent, applyEventRewards, mapAreas, triggerLocationEvent]); // Dependencies

  // Ini adalah useEffect utama untuk penanganan keyboard
  useEffect(() => {
    let keysPressed = {}; // Untuk melacak tombol yang ditekan (agar bisa tahu saat tidak ada tombol ditekan)

    const handleKeyDown = (event) => {
      if (!gameStarted || gameOver || showEventPopup) {
        setIsWalking(false); // Pastikan avatar berhenti "berjalan" jika game tidak aktif atau popup muncul
        return;
      }

      keysPressed[event.key.toLowerCase()] = true;

      let direction = null;
      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          direction = 'up';
          break;
        case 'arrowdown':
        case 's':
          direction = 'down';
          break;
        case 'arrowleft':
        case 'a':
          direction = 'left';
          break;
        case 'arrowright':
        case 'd':
          direction = 'right';
          break;
        default:
          break;
      }

      if (direction) {
        event.preventDefault(); // Mencegah scrolling halaman
        handleMove(direction);
        setIsWalking(true); // Set isWalking menjadi true saat ada gerakan
      }
    };

    const handleKeyUp = (event) => {
      keysPressed[event.key.toLowerCase()] = false;

      // Cek apakah ada tombol movement yang masih ditekan
      const anyMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
                               .some(key => keysPressed[key]);

      if (!anyMovementKey) {
        setIsWalking(false); // Set isWalking menjadi false jika tidak ada tombol movement yang ditekan
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, showEventPopup, handleMove]); // Dependencies

  return (
    <div className="app-container">
      {!gameStarted && (
        <AvatarSelection onAvatarSelect={selectAvatar} onStartGame={startGame} />
      )}

      {gameStarted && !gameOver && (
        <GameScreen
          player={player}
          gameTime={gameTime}
          avatarPosition={avatarPosition}
          onMove={handleMove}
          onBackToMainMap={handleBackToMainMap}
          onActivity={handleActivity}
          isWalking={isWalking} // Lewatkan isWalking dari state App
        />
      )}

      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}

      {showEventPopup && currentEvent && (
        <EventPopup
          event={currentEvent}
          onClose={() => setShowEventPopup(false)}
          onAttemptActivity={applyEventRewards} 
        />
      )}
    </div>
  );
};

export default App;
