// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import AvatarSelection from './components/AvatarSelection';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EventPopup from './components/activities/EventPopup';
import './index.css';

// Konstanta untuk efek item yang dapat dikonsumsi
const CONSUMABLE_ITEM_EFFECTS = {
  'Daging': { hunger: 30, energy: 5, happiness: 0, hygiene: 0 },
  'Freshwater Fish': { hunger: 20, energy: 10, happiness: 5, hygiene: 0 },
  'Comfort Food': { hunger: 25, energy: 15, happiness: 10, hygiene: 0 },
  'Ikan': { hunger: 20, energy: 10, happiness: 5, hygiene: 0 }, // Asumsi Ikan sama dengan Freshwater Fish
  'Mountain Herb': { hunger: 5, energy: 15, happiness: 5, hygiene: 0 }, // Efek untuk Mountain Herb
};

// Konstanta untuk efek item yang tidak dikonsumsi tapi punya efek (misal, tool, transport)
const NON_CONSUMABLE_ITEM_EFFECTS = {
  'Meditation Guide': { activityBonus: { 'Pray': { happiness: 10, energy: 5 } } }, // Memberikan bonus pada aktivitas Pray
  // 'Mobil' akan ditangani secara pasif dalam logika handleMove
};

const App = () => {
  const [isWalking, setIsWalking] = useState(false);
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
      'Mobil': { type: 'transport', stock: 1 }, // Punya mobil
      'Meditation Guide': { type: 'tool', stock: 1 }, // Punya Meditation Guide
      'Rare Seashell': { type: 'collectible', stock: 1 }, // Punya koleksi
      'Souvenir': { type: 'collectible', stock: 1 }, // Punya koleksi
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
      message: "Anda menemukan peluang untuk bersantai dan mengisi ulang energi di rumah.",
      rewards: {
        happiness: 15,
        energy: 10,
        inventory: { 'Comfort Food': { type: 'food', stock: 1 } }
      },
      requiredActivity: 'Sleep'
    },
    Temple: {
      message: "Anda merasakan kedamaian di kuil. Ada kesempatan untuk refleksi.",
      rewards: {
        happiness: 25,
        energy: 15,
        inventory: { 'Meditation Guide': { type: 'tool', stock: 1 } }
      },
      requiredActivity: 'Pray'
    },
    Beach: {
      message: "Ombak memanggil! Ada sesuatu yang istimewa di pantai.",
      rewards: {
        happiness: 20,
        money: 300000,
        inventory: { 'Rare Seashell': { type: 'collectible', stock: 1 } }
      },
      requiredActivity: 'Play'
    },
    Lake: {
      message: "Danau tampak tenang, sempurna untuk melatih kesabaran Anda.",
      rewards: {
        happiness: 18,
        hunger: 15,
        inventory: { 'Freshwater Fish': { type: 'food', stock: 1 } }
      },
      requiredActivity: 'Play'
    },
    Mountain: {
      message: "Pemandangan gunung menjanjikan petualangan. Ada penemuan menanti.",
      rewards: {
        happiness: 30,
        energy: -10,
        hygiene: -5,
        inventory: { 'Mountain Herb': { type: 'plant', stock: 1 } }
      },
      requiredActivity: 'Explore'
    }
  };

  const selectAvatar = (avatarSrc) => {
    setPlayer(prevPlayer => ({ ...prevPlayer, avatar: avatarSrc }));
  };

  const decreasePlayerStatus = useCallback(() => {
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      hunger: Math.max(0, prevPlayer.hunger - 1),
      hygiene: Math.max(0, prevPlayer.hygiene - 1),
      energy: Math.max(0, prevPlayer.energy - 1),
      happiness: Math.max(0, prevPlayer.happiness - 1),
    }));
  }, []);

  // Efek pasif dari item koleksi
  const applyPassiveItemEffects = useCallback(() => {
    setPlayer(prevPlayer => {
      let newHappiness = prevPlayer.happiness;
      const collectibles = Object.keys(prevPlayer.inventory).filter(
        itemName => prevPlayer.inventory[itemName].type === 'collectible'
      );
      if (collectibles.length > 0) {
        // Setiap koleksi memberikan +1 happiness per periode waktu
        newHappiness = Math.min(100, newHappiness + (collectibles.length * 1));
      }
      return { ...prevPlayer, happiness: newHappiness };
    });
  }, []);

  const startGameTime = useCallback(() => {
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
            decreasePlayerStatus();
            // Apply passive effects every 6 game hours (when status decreases)
            applyPassiveItemEffects(); 
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
  }, [decreasePlayerStatus, applyPassiveItemEffects]); // Tambahkan applyPassiveItemEffects

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

  const triggerLocationEvent = useCallback((location) => {
    if (locationEvents[location]) {
      setCurrentEvent({
        location: location,
        message: locationEvents[location].message,
        rewards: locationEvents[location].rewards,
        requiredActivity: locationEvents[location].requiredActivity
      });
      setShowEventPopup(true);
    }
  }, []);

  const checkAreaTransition = useCallback((newX, newY) => {
    if (player.location === 'MainMap' && mapAreas.MainMap) {
      const travelCost = player.inventory['Mobil'] && player.inventory['Mobil'].stock > 0 ? 3 : 5; // Biaya energi lebih rendah jika punya mobil
      const moneyCost = player.inventory['Mobil'] && player.inventory['Mobil'].stock > 0 ? 250000 : 500000; // Biaya uang lebih rendah jika punya mobil

      for (const [area, bounds] of Object.entries(mapAreas.MainMap)) {
        if (newX >= bounds.x[0] && newX <= bounds.x[1] &&
            newY >= bounds.y[0] && newY <= bounds.y[1]) {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            location: area,
            energy: Math.max(0, prevPlayer.energy - travelCost), // Menggunakan travelCost
            money: Math.max(0, prevPlayer.money - moneyCost), // Menggunakan moneyCost
            happiness: Math.min(100, prevPlayer.happiness + 5),
          }));
          setAvatarPosition({ x: 50, y: 50 });
          
          triggerLocationEvent(area);
          return true;
        }
      }
    }
    return false;
  }, [player.location, player.inventory, mapAreas.MainMap, triggerLocationEvent]); // Tambahkan player.inventory

  const handleMove = useCallback((direction) => {
    const energyCost = player.inventory['Mobil'] && player.inventory['Mobil'].stock > 0 ? 3 : 5; // Biaya energi bergerak biasa
    if (player.energy < energyCost) { // Periksa dengan biaya yang sesuai
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
    setIsWalking(true);
    setTimeout(() => setIsWalking(false), 500);

    if (!checkAreaTransition(newX, newY)) {
      setAvatarPosition({ x: newX, y: newY });
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        energy: Math.max(0, prevPlayer.energy - 1) // Biaya energi untuk setiap langkah
      }));
    }
  }, [player.energy, player.inventory, avatarPosition, checkAreaTransition]); // Tambahkan player.inventory

  const handleBackToMainMap = useCallback(() => {
    setPlayer(prevPlayer => ({ ...prevPlayer, location: 'MainMap' }));
    setAvatarPosition({ x: 50, y: 50 });
  }, []);

  const applyEventRewards = useCallback(() => {
    if (currentEvent && currentEvent.rewards && currentEvent.location === player.location) {
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        happiness: Math.min(100, prevPlayer.happiness + (currentEvent.rewards.happiness || 0)),
        energy: Math.min(100, prevPlayer.energy + (currentEvent.rewards.energy || 0)),
        money: prevPlayer.money + (currentEvent.rewards.money || 0),
        hunger: Math.min(100, prevPlayer.hunger + (currentEvent.rewards.hunger || 0)),
        hygiene: Math.min(100, prevPlayer.hygiene + (currentEvent.rewards.hygiene || 0)),
        inventory: {
          ...prevPlayer.inventory,
          ...(Object.entries(currentEvent.rewards.inventory || {}).reduce((acc, [item, data]) => {
            acc[item] = { ...data, stock: (prevPlayer.inventory[item]?.stock || 0) + data.stock };
            return acc;
          }, {}))
        }
      }));
      alert(`Event berhasil diselesaikan di ${currentEvent.location}! Rewards: ${currentEvent.rewards.happiness ? `+${currentEvent.rewards.happiness} Happiness, ` : ''}${currentEvent.rewards.energy ? `+${currentEvent.rewards.energy} Energy, ` : ''}${currentEvent.rewards.hunger ? `+${currentEvent.rewards.hunger} Hunger, ` : ''}${currentEvent.rewards.hygiene ? `+${currentEvent.rewards.hygiene} Hygiene, ` : ''}${currentEvent.rewards.money ? `+Rp${currentEvent.rewards.money.toLocaleString()}, ` : ''}${currentEvent.rewards.inventory ? Object.keys(currentEvent.rewards.inventory).map(item => `+${currentEvent.rewards.inventory[item].stock} ${item}`).join(', ') : ''}.`);
      setCurrentEvent(null);
    }
  }, [currentEvent, player.location]);

  const handleActivity = useCallback((activity) => {
    const isEventActivity = currentEvent && 
                            currentEvent.location === player.location && 
                            currentEvent.requiredActivity === activity;

    if (activity.startsWith('Go to ')) {
      const targetLocation = activity.replace('Go to ', '');
      if (mapAreas.MainMap[targetLocation]) {
        const travelCost = player.inventory['Mobil'] && player.inventory['Mobil'].stock > 0 ? 3 : 5;
        const moneyCost = player.inventory['Mobil'] && player.inventory['Mobil'].stock > 0 ? 250000 : 500000;

        setPlayer(prevPlayer => ({
          ...prevPlayer,
          location: targetLocation,
          energy: Math.max(0, prevPlayer.energy - travelCost),
          money: Math.max(0, prevPlayer.money - moneyCost),
          happiness: Math.min(100, prevPlayer.happiness + 5),
        }));
        setAvatarPosition({ x: 50, y: 50 });
        triggerLocationEvent(targetLocation);
        return;
      }
    }

    switch (activity) {
      case 'Work':
          if (player.location === 'Home' || player.location === 'MainMap') {
              if (player.energy >= 20) {
                  setPlayer(prevPlayer => ({
                      ...prevPlayer,
                      money: prevPlayer.money + 500000,
                      energy: Math.max(0, prevPlayer.energy - 20),
                      happiness: Math.max(0, prevPlayer.happiness - 5),
                      hunger: Math.max(0, prevPlayer.hunger - 10),
                  }));
                  alert("Anda bekerja keras! +Rp500.000, -20 Energi, -5 Kebahagiaan, -10 Lapar.");
              } else {
                  alert("Anda tidak punya cukup energi untuk bekerja!");
              }
          } else {
              alert(`Anda tidak bisa bekerja di ${player.location}! Coba di rumah atau Main Map.`);
          }
          break;

      case 'Eat':
      case 'Use Consumable Item': // Aktivitas baru untuk menggunakan item konsumsi
        const availableConsumableItems = Object.keys(player.inventory).filter(itemName =>
          (player.inventory[itemName].type === 'food' || player.inventory[itemName].type === 'plant') && // Tambahkan 'plant'
          player.inventory[itemName].stock > 0 && CONSUMABLE_ITEM_EFFECTS[itemName]
        );

        if (activity === 'Use Consumable Item' && availableConsumableItems.length > 0) {
            const itemToUse = prompt(`Pilih item untuk digunakan (tersedia: ${availableConsumableItems.join(', ')}):`);
            if (!itemToUse || !availableConsumableItems.includes(itemToUse)) {
                alert("Pilihan tidak valid atau item tidak tersedia.");
                break;
            }
            const effects = CONSUMABLE_ITEM_EFFECTS[itemToUse];
            setPlayer(prevPlayer => {
                let newPlayer = { ...prevPlayer };
                newPlayer.inventory = {
                    ...newPlayer.inventory,
                    [itemToUse]: {
                        ...newPlayer.inventory[itemToUse],
                        stock: newPlayer.inventory[itemToUse].stock - 1
                    }
                };
                if (newPlayer.inventory[itemToUse].stock <= 0) {
                    const { [itemToUse]: _, ...restInventory } = newPlayer.inventory;
                    newPlayer.inventory = restInventory;
                }
                let msg = `Anda menggunakan ${itemToUse}. `;
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
                msg += `-1 ${itemToUse}.`;
                alert(msg);
                return newPlayer;
            });
        } else if (activity === 'Eat' && player.location === 'Home') { // Logika Eat di rumah tetap sama untuk makanan khusus
            const homeFoodItems = Object.keys(player.inventory).filter(itemName =>
                player.inventory[itemName].type === 'food' && player.inventory[itemName].stock > 0 && CONSUMABLE_ITEM_EFFECTS[itemName]
            );
            if (homeFoodItems.length > 0) {
                const itemToEat = homeFoodItems[0]; // Hanya ambil yang pertama
                const effects = CONSUMABLE_ITEM_EFFECTS[itemToEat];
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
        } else if (activity === 'Eat' && player.location !== 'Home') {
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
        } else {
            alert("Tidak ada item konsumsi yang tersedia atau pilihan tidak valid.");
        }
        if (isEventActivity) {
          applyEventRewards();
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
        if (isEventActivity) {
          applyEventRewards();
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
        if (isEventActivity) {
          applyEventRewards();
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
        if (isEventActivity) {
          applyEventRewards();
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
        if (isEventActivity) {
          applyEventRewards();
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
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Pray':
        if (player.location === 'Temple') {
          let happinessBonus = 0;
          let energyBonus = 0;
          // Cek apakah pemain memiliki Meditation Guide
          if (player.inventory['Meditation Guide'] && player.inventory['Meditation Guide'].stock > 0) {
            if (NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide']?.activityBonus?.['Pray']) {
              happinessBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].happiness || 0;
              energyBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].energy || 0;
            }
          }
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30 + happinessBonus),
            energy: Math.min(100, prevPlayer.energy + 10 + energyBonus),
          }));
          alert(`Anda berdoa di Kuil. +${30 + happinessBonus} Kebahagiaan, +${10 + energyBonus} Energi.${happinessBonus > 0 ? ' (Berkat Meditation Guide!)' : ''}`);
        } else {
          alert("Anda hanya bisa berdoa di Kuil!");
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      default:
        break;
    }
  }, [player, currentEvent, applyEventRewards, mapAreas, triggerLocationEvent]);


  // Ini adalah useEffect utama untuk penanganan keyboard
  useEffect(() => {
    let keysPressed = {};

    const handleKeyDown = (event) => {
      if (!gameStarted || gameOver || showEventPopup) {
        setIsWalking(false);
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
        event.preventDefault();
        handleMove(direction);
        setIsWalking(true);
      }
    };

    const handleKeyUp = (event) => {
      keysPressed[event.key.toLowerCase()] = false;

      const anyMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
                               .some(key => keysPressed[key]);

      if (!anyMovementKey) {
        setIsWalking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, showEventPopup, handleMove]);

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
          isWalking={isWalking}
        />
      )}

      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}

      {showEventPopup && currentEvent && (
        <EventPopup
          event={currentEvent}
          onClose={() => setShowEventPopup(false)}
        />
      )}
    </div>
  );
};

export default App;