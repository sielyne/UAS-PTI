import React, { useState, useEffect, useCallback, useRef } from 'react';
import AvatarSelection from './components/AvatarSelection';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EventPopup from './components/activities/EventPopup';
import './index.css';

// Constants for consumable item effects
const CONSUMABLE_ITEM_EFFECTS = {
  'Meat': { hunger: 30, energy: 5, happiness: 0, hygiene: 0 },
  'Freshwater Fish': { hunger: 20, energy: 10, happiness: 5, hygiene: 0 },
  'Comfort Food': { hunger: 25, energy: 15, happiness: 10, hygiene: 0 },
  'Fish': { hunger: 20, energy: 10, happiness: 5, hygiene: 0 },
  'Mountain Herb': { hunger: 5, energy: 15, happiness: 5, hygiene: 0 },
};

// Constants for non-consumable item effects (e.g., tool)
const NON_CONSUMABLE_ITEM_EFFECTS = {
  'Meditation Guide': { activityBonus: { 'Pray': { happiness: 10, energy: 5 } } },
};

// Map activity names to their corresponding GIF files
// Pastikan nama file GIF sesuai dengan nama aktivitas dan ada di folder yang benar
const ACTIVITY_GIFS = {
    'Work': '/assets/gifs/kerja.gif',
    'Eat': '/assets/gifs/makan.gif', // Ini bisa jadi GIF umum untuk makan
    'Use Consumable Item': '/assets/gifs/makan.gif', // Bisa pakai GIF yang sama
    'Swim': '/assets/gifs/renang.gif',
    'Fishing': '/assets/gifs/mancing.gif',
    'Hike': '/assets/gifs/hiking.gif',
    'Sleep': '/assets/gifs/tidur.gif',
    'Take a Bath': '/assets/gifs/mandi.gif',
    'Buy Souvenir': '/assets/gifs/souvenir.gif',
    'Explore': '/assets/gifs/explore.gif',
    'Explore Area': '/assets/gifs/explore.gif', // Jika 'Explore Area' adalah alias
    'Pray': '/assets/gifs/doa.gif',
    // Tambahkan GIF untuk aktivitas lain jika ada
    // Misalnya, untuk travel:
    'Go to Home': '/assets/gifs/travel.gif',
    'Go to Mountain': '/assets/gifs/travel.gif',
    'Go to Lake': '/assets/gifs/travel.gif',
    'Go to Beach': '/assets/gifs/travel.gif',
    'Go to Temple': '/assets/gifs/travel.gif',
    'Go to MainMap': '/assets/gifs/travel.gif',
};


const App = () => {
  const [isWalking, setIsWalking] = useState(false);
  const [player, setPlayer] = useState({
    name: "",
    avatar: "",
    money: 750000,
    happiness: 50,
    hunger: 50,
    hygiene: 50,
    energy: 50,
    location: "MainMap",
    inventory: {
      'Meat': { type: 'food', stock: 2 },
      'Meditation Guide': { type: 'tool', stock: 1 }
    }
  });

  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
  const [gameTime, setGameTime] = useState({ hour: 8, minute: 0, day: 1 });
  const [gameStarted, setGameStarted] = useState(false);
  const timeIntervalRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const triggeredEventsRef = useRef({});
  
  const walkTimeout = useRef(null);

  // --- NEW STATES FOR ACTIVITY ANIMATION ---
  const [isActivityAnimating, setIsActivityAnimating] = useState(false);
  const [currentActivityGif, setCurrentActivityGif] = useState(null);
  const activityTimeoutRef = useRef(null); // Ref untuk menyimpan timeout animasi
  const pendingActivity = useRef(null); // Ref untuk menyimpan aktivitas yang tertunda
  // --- END NEW STATES ---

  const mapAreas = {
    MainMap: {
      Home: { x: [10, 20], y: [10, 25] },
      Mountain: { x: [40, 60], y: [15, 25] },
      Lake: { x: [70, 90], y: [25, 35] },
      Beach: { x: [70, 90], y: [70, 90] },
      Temple: { x: [40, 60], y: [60, 75] }
    }
  };

  const locationEvents = {
    'Home': [
      {
        id: 'home_relax',
        message: "You found an opportunity to relax and recharge at home.",
        rewards: {
          happiness: 15,
          energy: 10,
          inventory: {
            'Comfort Food': { type: 'food', stock: 1 },
            'Passport': { type: 'collectible', stock: 1 }
          }
        },
        requiredActivity: 'Sleep'
      },
    ],
    'Temple': [
      {
        id: 'temple_reflection',
        message: "You feel peace in the temple. There is an opportunity for reflection.",
        rewards: {
          happiness: 25,
          energy: 15,
          inventory: { 'Meditation Guide': { type: 'tool', stock: 1 } }
        },
        requiredActivity: 'Pray'
      }
    ],
    'Beach': [
      {
        id: 'beach_waves',
        message: "The waves are calling! There's something special at the beach.",
        rewards: {
          happiness: 20,
          money: 300000,
          inventory: { 'Rare Seashell': { type: 'collectible', stock: 1 } }
        },
        requiredActivity: 'Swim'
      }
    ],
    'Lake': [
      {
        id: 'lake_patience',
        message: "The lake looks calm, perfect for practicing your patience.",
        rewards: {
          happiness: 18,
          hunger: 15,
          inventory: { 'Freshwater Fish': { type: 'food', stock: 1 } }
        },
        requiredActivity: 'Fishing'
      }
    ],
    'Mountain': [
      {
        id: 'mountain_adventure',
        message: "The mountain view promises adventure. A discovery awaits.",
        rewards: {
          happiness: 30,
          energy: -10,
          hygiene: -5,
          inventory: { 'Mountain Herb': { type: 'plant', stock: 1 } }
        },
        requiredActivity: 'Hike'
      }
    ]
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

  const applyPassiveItemEffects = useCallback(() => {
    setPlayer(prevPlayer => {
      let newHappiness = prevPlayer.happiness;
      const collectibles = Object.keys(prevPlayer.inventory).filter(
        itemName => prevPlayer.inventory[itemName].type === 'collectible'
      );
      if (collectibles.length > 0) {
        newHappiness = Math.min(100, newHappiness + (collectibles.length * 1));
      }
      return { ...prevPlayer, happiness: newHappiness };
    });
  }, []);

  const startGameTime = useCallback(() => {
    const REAL_WORLD_INTERVAL_MS = 20 * 1000;
    const GAME_TIME_INCREMENT_MINUTES = 10;

    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);

    timeIntervalRef.current = setInterval(() => {
      setGameTime(prevTime => {
        let newMinute = prevTime.minute + GAME_TIME_INCREMENT_MINUTES;
        let newHour = prevTime.hour;
        let newDay = prevTime.day;

        let hourChanged = false;
        if (newMinute >= 60) {
          newHour += Math.floor(newMinute / 60);
          newMinute %= 60;
          hourChanged = true;
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour %= 24;
        }

        if (hourChanged && (newHour % 6 === 0 || (prevTime.hour === 23 && newHour === 5))) {
          decreasePlayerStatus();
          applyPassiveItemEffects();
        }

        return { hour: newHour, minute: newMinute, day: newDay };
      });
    }, REAL_WORLD_INTERVAL_MS);
  }, [decreasePlayerStatus, applyPassiveItemEffects]);

  useEffect(() => {
    if (
      player.hunger <= 0 ||
      player.hygiene <= 0 ||
      player.energy <= 0 ||
      player.happiness <= 0
    ) {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      setGameOver(true);
      setGameStarted(false);
      alert(`Game Over! ${player.name}'s journey ended due to low stats.`);
    }
  }, [player]);

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
    triggerLocationEvent('MainMap');
  };

  const restartGame = () => {
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    timeIntervalRef.current = null;
    setPlayer({
      name: "",
      avatar: "",
      money: 750000,
      happiness: 50,
      hunger: 50,
      hygiene: 50,
      energy: 50,
      location: "MainMap",
      inventory: {
        'Meat': { type: 'food', stock: 2 },
        'Meditation Guide': { type: 'tool', stock: 1 }
      }
    });
    setAvatarPosition({ x: 50, y: 50 });
    setGameTime({ hour: 8, minute: 0, day: 1 });
    setGameStarted(false);
    setGameOver(false);
    setShowEventPopup(false);
    setCurrentEvent(null);
    triggeredEventsRef.current = {};
    // Reset activity animation states
    setIsActivityAnimating(false);
    setCurrentActivityGif(null);
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    pendingActivity.current = null;
  };


  const triggerLocationEvent = useCallback((location) => {
    const potentialEvents = locationEvents[location];
    if (potentialEvents && potentialEvents.length > 0) {
      const availableEvents = potentialEvents.filter(event =>
        !triggeredEventsRef.current[event.id] && (!event.condition || event.condition(player))
      );

      if (availableEvents.length > 0) {
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        setCurrentEvent(randomEvent);
        setShowEventPopup(true);
        // Do NOT mark as triggered here. Mark it when event is successfully completed via activity.
      } else {
        setCurrentEvent(null);
        setShowEventPopup(false);
      }
    } else {
      setCurrentEvent(null);
      setShowEventPopup(false);
    }
  }, [player]);


  const checkAreaTransition = useCallback((newX, newY) => {
    if (player.location === 'MainMap' && mapAreas.MainMap) {
      const travelCost = 5;
      const moneyCost = 500000;

      for (const [area, bounds] of Object.entries(mapAreas.MainMap)) {
        if (newX >= bounds.x[0] && newX <= bounds.x[1] &&
            newY >= bounds.y[0] && newY <= bounds.y[1]) {

          if (player.money < moneyCost) {
            alert("Insufficient money to move to this location (Rp 500,000 required).");
            return false;
          }
          if (player.energy < travelCost) {
            alert(`You don't have enough energy (${travelCost}) to enter ${area}!`);
            return false;
          }

          setPlayer(prevPlayer => ({
            ...prevPlayer,
            location: area,
            energy: Math.max(0, prevPlayer.energy - travelCost),
            money: Math.max(0, prevPlayer.money - moneyCost),
            happiness: Math.min(100, prevPlayer.happiness + 5),
          }));
          setAvatarPosition({ x: 50, y: 50 });

          // No direct event trigger here, handle in onActivity if "Go to" is clicked
          return true;
        }
      }
    }
    return false;
  }, [player.location, player.money, player.energy, mapAreas.MainMap]);


  const handleMove = useCallback((direction) => {
    if (isActivityAnimating) return; // Prevent movement during activity animation

    const energyCostPerStep = 1;
    if (player.energy < energyCostPerStep) {
      alert("You don't have enough energy to move!");
      setIsWalking(false);
      return;
    }

    const moveDistance = 2;
    let newX = avatarPosition.x;
    let newY = avatarPosition.y;

    switch (direction) {
      case 'up': newY = Math.max(5, avatarPosition.y - moveDistance); break;
      case 'down': newY = Math.min(95, avatarPosition.y + moveDistance); break;
      case 'left': newX = Math.max(5, avatarPosition.x - moveDistance); break;
      case 'right': newX = Math.min(95, avatarPosition.x + moveDistance); break;
      default: break;
    }

    setIsWalking(true);
    // Timeout untuk menghentikan animasi setelah jeda singkat
    // Ini akan direset di useEffect keyboard handling jika tombol ditekan terus
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = setTimeout(() => setIsWalking(false), 300);

    if (!checkAreaTransition(newX, newY)) {
      setAvatarPosition({ x: newX, y: newY });
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        energy: Math.max(0, prevPlayer.energy - energyCostPerStep)
      }));
    }
  }, [player.energy, avatarPosition, checkAreaTransition, isActivityAnimating]);


  const handleBackToMainMap = useCallback(() => {
    if (isActivityAnimating) return; // Prevent action during activity animation

    const travelEnergyCost = 15;
    const travelMoneyCost = 50000;

    if (player.money < travelMoneyCost) {
        alert(`Insufficient money to go back to Main Map (Rp ${travelMoneyCost.toLocaleString()} required).`);
        return;
    }
    if (player.energy < travelEnergyCost) {
        alert(`You don't have enough energy (${travelEnergyCost}) to go back to Main Map!`);
        return;
    }

    const performBackToMainMap = () => {
        setPlayer(prevPlayer => ({
            ...prevPlayer,
            location: 'MainMap',
            energy: Math.max(0, prevPlayer.energy - travelEnergyCost),
            money: Math.max(0, prevPlayer.money - travelMoneyCost),
            happiness: Math.min(100, prevPlayer.happiness + 5),
        }));
        setAvatarPosition({ x: 50, y: 50 });
        triggerLocationEvent('MainMap');
        alert(`You returned to Main Map. -${travelEnergyCost} Energy, -Rp${travelMoneyCost.toLocaleString()} Money, +5 Happiness.`);
    };

    // Trigger animation for travel
    setCurrentActivityGif(ACTIVITY_GIFS['Go to MainMap']); // Use travel GIF
    setIsActivityAnimating(true);
    activityTimeoutRef.current = setTimeout(() => {
      setIsActivityAnimating(false);
      setCurrentActivityGif(null);
      performBackToMainMap(); // Apply rewards after animation
    }, 7000); // 7 seconds animation
  }, [player, setPlayer, triggerLocationEvent, isActivityAnimating]);


  const applyEventRewards = useCallback(() => {
    if (currentEvent && currentEvent.rewards) {
      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };
        const rewards = currentEvent.rewards;

        if (rewards.happiness !== undefined) { newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + rewards.happiness)); }
        if (rewards.energy !== undefined) { newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + rewards.energy)); }
        if (rewards.hunger !== undefined) { newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + rewards.hunger)); }
        if (rewards.hygiene !== undefined) { newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + rewards.hygiene)); }
        if (rewards.money !== undefined) { newPlayer.money = prevPlayer.money + rewards.money; }

        if (rewards.inventory) {
          newPlayer.inventory = { ...prevPlayer.inventory };
          Object.entries(rewards.inventory).forEach(([item, data]) => {
            newPlayer.inventory[item] = {
              ...newPlayer.inventory[item],
              type: data.type || 'unknown',
              stock: (newPlayer.inventory[item]?.stock || 0) + data.stock
            };
          });
        }
        return newPlayer;
      });
      // Mark event as triggered ONLY when rewards are successfully applied
      triggeredEventsRef.current = { ...triggeredEventsRef.current, [currentEvent.id]: true };
    }
  }, [currentEvent, setPlayer]);


  const handleActivity = useCallback((activity) => {
    if (isActivityAnimating) return; // Prevent new activity during animation

    let activityPerformedSuccessfully = false;
    let alertMessage = "";
    let willAnimate = true; // Default to true for most activities

    const performActivityLogic = () => { // Function to encapsulate activity logic
      if (activity.startsWith('Go to ')) {
        const targetLocation = activity.replace('Go to ', '');
        if (player.location === 'MainMap' && mapAreas.MainMap[targetLocation]) {
          const travelEnergyCost = 15;
          const travelMoneyCost = 500000;

          if (player.money < travelMoneyCost) {
            alertMessage = `Insufficient money to travel to ${targetLocation} (Rp ${travelMoneyCost.toLocaleString()} required).`;
            willAnimate = false; // No animation if failed
          } else if (player.energy < travelEnergyCost) {
            alertMessage = `You don't have enough energy (${travelEnergyCost}) to travel to ${targetLocation}!`;
            willAnimate = false; // No animation if failed
          } else {
            setPlayer(prevPlayer => ({
              ...prevPlayer,
              location: targetLocation,
              energy: Math.max(0, prevPlayer.energy - travelEnergyCost),
              money: Math.max(0, prevPlayer.money - travelMoneyCost),
              happiness: Math.min(100, prevPlayer.happiness + 5),
            }));
            setAvatarPosition({ x: 50, y: 50 });
            alertMessage = `You traveled to ${targetLocation}. -${travelEnergyCost} Energy, -Rp${travelMoneyCost.toLocaleString()} Money, +5 Happiness.`;
            activityPerformedSuccessfully = true;
            triggerLocationEvent(targetLocation); // Trigger event for new location
          }
        } else if (player.location !== 'MainMap' && targetLocation === 'MainMap') {
          // This case is now handled by handleBackToMainMap which includes animation
          handleBackToMainMap();
          activityPerformedSuccessfully = true;
          willAnimate = false; // handleBackToMainMap already handles its own animation
        } else {
          alertMessage = `Invalid travel to ${targetLocation} from ${player.location}.`;
          willAnimate = false;
        }
        if (alertMessage && !willAnimate) { alert(alertMessage); } // Alert immediately for failed travel
        return; // Exit if it's a travel activity
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
              alertMessage = "You worked hard! +IDR 500,000, -20 Energy, -5 Happiness, -10 Hunger.";
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = "You don't have enough energy (20) to work!"; willAnimate = false;
            }
          } else {
            alertMessage = `You cannot work in ${player.location}! Try at home or Main Map.`; willAnimate = false;
          }
          break;

        case 'Eat':
        case 'Use Consumable Item':
            const availableConsumableItems = Object.keys(player.inventory).filter(itemName =>
              (player.inventory[itemName].type === 'food' || player.inventory[itemName].type === 'plant') &&
              player.inventory[itemName].stock > 0 && CONSUMABLE_ITEM_EFFECTS[itemName]
            );

            let itemToUse = null;
            if (activity === 'Use Consumable Item' && availableConsumableItems.length > 0) {
              itemToUse = prompt(`Select an item to use (available: ${availableConsumableItems.join(', ')}):`);
              if (!itemToUse || !availableConsumableItems.includes(itemToUse)) {
                alertMessage = "Invalid choice or item not available."; willAnimate = false; break;
              }
            } else if (activity === 'Eat' && player.location === 'Home') {
              if (availableConsumableItems.length > 0) {
                itemToUse = availableConsumableItems[0];
              } else {
                alertMessage = "You don't have any food to eat at home! Try buying some or fishing."; willAnimate = false; break;
              }
            } else if (activity === 'Eat' && player.location !== 'Home') {
              const restaurantCost = 100000;
              if (player.money >= restaurantCost) {
                setPlayer(prevPlayer => ({
                  ...prevPlayer,
                  money: prevPlayer.money - restaurantCost,
                  hunger: Math.min(100, prevPlayer.hunger + 40),
                  happiness: Math.min(100, prevPlayer.happiness + 10),
                  energy: Math.min(100, prevPlayer.energy + 10),
                }));
                alertMessage = `You ate at a restaurant in ${player.location}. -IDR 100,000, +40 Hunger, +10 Happiness, +10 Energy.`;
                activityPerformedSuccessfully = true;
                break;
              } else {
                alertMessage = "You don't have enough money to eat at a restaurant!"; willAnimate = false; break;
              }
            } else {
              alertMessage = "No consumable items available or invalid choice for 'Eat'."; willAnimate = false; break;
            }

            if (itemToUse) {
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
                let msg = `You used ${itemToUse}. `;
                if (effects.hunger !== undefined) {
                  newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + effects.hunger));
                  msg += `${effects.hunger > 0 ? '+' : ''}${effects.hunger} Hunger, `;
                }
                if (effects.energy !== undefined) {
                  newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + effects.energy));
                  msg += `${effects.energy > 0 ? '+' : ''}${effects.energy} Energy, `;
                }
                if (effects.happiness !== undefined) {
                  newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + effects.happiness));
                  msg += `${effects.happiness > 0 ? '+' : ''}${effects.happiness} Happiness, `;
                }
                if (effects.hygiene !== undefined) {
                  newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + effects.hygiene));
                  msg += `${effects.hygiene > 0 ? '+' : ''}${effects.hygiene} Hygiene, `;
                }
                msg += `-1 ${itemToUse}.`;
                alertMessage = msg;
                return newPlayer;
              });
              activityPerformedSuccessfully = true;
            } else {
              willAnimate = false; // No animation if no item was used (e.g., if prompt was cancelled)
            }
            break;

        case 'Swim':
          if (player.location === 'Beach') {
            const energyCost = 20;
            const hygieneCost = 10;
            if (player.energy >= energyCost) {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 25),
                energy: Math.max(0, prevPlayer.energy - energyCost),
                hygiene: Math.max(0, prevPlayer.hygiene - hygieneCost),
              }));
              alertMessage = `You swam at ${player.location}. +25 Happiness, -${energyCost} Energy, -${hygieneCost} Hygiene.`;
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough energy (${energyCost}) to swim!`; willAnimate = false;
            }
          } else {
            alertMessage = `You can only swim at the Beach!`; willAnimate = false;
          }
          break;

        case 'Fishing':
          if (player.location === 'Lake') {
            const energyCost = 20;
            const hygieneCost = 10;
            if (player.energy >= energyCost) {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 25),
                energy: Math.max(0, prevPlayer.energy - energyCost),
                hygiene: Math.max(0, prevPlayer.hygiene - hygieneCost),
                inventory: {
                  ...prevPlayer.inventory,
                  'Fish': { type: 'food', stock: (prevPlayer.inventory['Fish']?.stock || 0) + 1 }
                }
              }));
              alertMessage = `You fished at ${player.location}. +25 Happiness, -${energyCost} Energy, -${hygieneCost} Hygiene, +1 Fish.`;
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough energy (${energyCost}) to fish!`; willAnimate = false;
            }
          } else {
            alertMessage = `You can only fish at the Lake!`; willAnimate = false;
          }
          break;

        case 'Hike':
          if (player.location === 'Mountain') {
            const energyCost = 25;
            const hungerCost = 15;
            if (player.energy >= energyCost) {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 30),
                energy: Math.max(0, prevPlayer.energy - energyCost),
                hunger: Math.max(0, prevPlayer.hunger - hungerCost),
              }));
              alertMessage = `You hiked in the Mountains. +30 Happiness, -${energyCost} Energy, -${hungerCost} Hunger.`;
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough energy (${energyCost}) to hike!`; willAnimate = false;
            }
          } else {
            alertMessage = `You can only hike in the Mountains!`; willAnimate = false;
          }
          break;

        case 'Sleep':
          if (player.location === 'Home') {
            const energyGain = 50;
            setPlayer(prevPlayer => ({ ...prevPlayer, energy: Math.min(100, prevPlayer.energy + energyGain) }));
            setGameTime(prevTime => {
              let newHour = prevTime.hour + 6;
              let newDay = prevTime.day;
              if (newHour >= 24) {
                newDay += Math.floor(newHour / 24);
                newHour %= 24;
              }
              return { ...prevTime, hour: newHour, minute: 0, day: newDay };
            });
            alertMessage = "You slept. +50 Energy, 6 hours passed.";
            activityPerformedSuccessfully = true;
          } else {
            alertMessage = "You can only sleep at home!"; willAnimate = false;
          }
          break;

        case 'Take a Bath':
          if (player.location === 'Home') {
            const hygieneGain = 40;
            const energyCost = 5;
            if (player.energy >= energyCost) {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                hygiene: Math.min(100, prevPlayer.hygiene + hygieneGain),
                energy: Math.max(0, prevPlayer.energy - energyCost),
              }));
              alertMessage = "You took a bath. +40 Hygiene, -5 Energy.";
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough energy (${energyCost}) to take a bath!`; willAnimate = false;
            }
          } else {
            alertMessage = "You can only take a bath at home!"; willAnimate = false;
          }
          break;

        case 'Buy Souvenir':
          if (player.location !== 'Home') {
            const souvenirCost = 200000;
            if (player.money >= souvenirCost) {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                money: prevPlayer.money - souvenirCost,
                happiness: Math.min(100, prevPlayer.happiness + 20),
                inventory: {
                  ...prevPlayer.inventory,
                  'Souvenir': {
                    type: 'collectible',
                    stock: (prevPlayer.inventory['Souvenir']?.stock || 0) + 1
                  }
                }
              }));
              alertMessage = `You bought a souvenir in ${player.location}. -IDR 200,000, +20 Happiness, +1 Souvenir.`;
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough money (IDR ${souvenirCost.toLocaleString()} required) to buy a souvenir!`; willAnimate = false;
            }
          } else {
            alertMessage = "There are no souvenirs to buy at home!"; willAnimate = false;
          }
          break;

        case 'Explore':
        case 'Explore Area':
          if (player.location !== 'Home' && player.location !== 'Mountain') {
            const energyCost = 20;
            const hygieneCost = 10;
            if (player.energy >= energyCost) {
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 25),
                energy: Math.max(0, prevPlayer.energy - energyCost),
                hygiene: Math.max(0, prevPlayer.hygiene - hygieneCost),
              }));
              alertMessage = `You explored ${player.location}. +25 Happiness, -${energyCost} Energy, -${hygieneCost} Hygiene.`;
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough energy (${energyCost}) to explore!`; willAnimate = false;
            }
          } else if (player.location === 'Home') {
            alertMessage = "There's nothing new to explore at home!"; willAnimate = false;
          } else if (player.location === 'Mountain') {
            alertMessage = "You should 'Hike' in the mountains instead of 'Explore'!"; willAnimate = false;
          }
          break;

        case 'Pray':
          if (player.location === 'Temple') {
            const energyCost = 10;
            if (player.energy >= energyCost) {
              let happinessBonus = 0;
              let energyBonus = 0;
              if (player.inventory['Meditation Guide'] && player.inventory['Meditation Guide'].stock > 0) {
                if (NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide']?.activityBonus?.['Pray']) {
                  happinessBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].happiness || 0;
                  energyBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].energy || 0;
                }
              }
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                happiness: Math.min(100, prevPlayer.happiness + 30 + happinessBonus),
                energy: Math.min(100, prevPlayer.energy - energyCost + energyBonus),
              }));
              alertMessage = `You prayed at the Temple. +${30 + happinessBonus} Happiness, -${energyCost - energyBonus} Energy.${happinessBonus > 0 || energyBonus > 0 ? ' (Meditation Guide blessing!)' : ''}`;
              activityPerformedSuccessfully = true;
            } else {
              alertMessage = `You don't have enough energy (${energyCost}) to pray!`; willAnimate = false;
            }
          } else {
            alertMessage = "You can only pray at the Temple!"; willAnimate = false;
          }
          break;

        default:
          alertMessage = `Unknown activity: ${activity}`; willAnimate = false;
          break;
      }

      // --- Logika Pengklaiman Hadiah Event (Setelah Animasi Selesai) ---
      // Ini akan dipanggil setelah animasi selesai atau di-fast forward
      if (activityPerformedSuccessfully && currentEvent &&
          currentEvent.location === player.location &&
          currentEvent.requiredActivity === activity) {
        applyEventRewards();
        setShowEventPopup(false);
        setCurrentEvent(null);
      }

      if (alertMessage) {
        alert(alertMessage);
      }
    }; // END performActivityLogic

    // --- Start Activity Animation Logic ---
    if (willAnimate && ACTIVITY_GIFS[activity]) {
        setCurrentActivityGif(ACTIVITY_GIFS[activity]);
        setIsActivityAnimating(true);
        // Store the activity logic to be executed after animation or fast-forward
        pendingActivity.current = performActivityLogic;

        activityTimeoutRef.current = setTimeout(() => {
            setIsActivityAnimating(false);
            setCurrentActivityGif(null);
            if (pendingActivity.current) {
                pendingActivity.current(); // Execute the stored logic
                pendingActivity.current = null; // Clear it
            }
        }, 7000); // 7 seconds animation
    } else {
        // If no animation, execute immediately
        performActivityLogic();
    }
  }, [player, currentEvent, applyEventRewards, handleBackToMainMap, mapAreas.MainMap, triggerLocationEvent, isActivityAnimating]); // isActivityAnimating added to dependencies

  // --- NEW: Fast Forward Function ---
  const handleFastForward = useCallback(() => {
    if (isActivityAnimating) {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current); // Clear the animation timeout
      }
      setIsActivityAnimating(false); // Stop animation
      setCurrentActivityGif(null); // Clear GIF
      if (pendingActivity.current) {
        pendingActivity.current(); // Execute the stored activity logic immediately
        pendingActivity.current = null; // Clear it
      }
    }
  }, [isActivityAnimating]);
  // --- END NEW ---


  useEffect(() => {
    let keysPressed = {};

    const handleKeyDown = (event) => {
      // Disable movement and activity start if animating or popup is open
      if (!gameStarted || gameOver || showEventPopup || isActivityAnimating) {
        if (walkTimeout.current) clearTimeout(walkTimeout.current);
        setIsWalking(false);
        return;
      }

      const key = event.key.toLowerCase();
      keysPressed[key] = true;

      let direction = null;
      switch (key) {
        case 'arrowup': case 'w': direction = 'up'; break;
        case 'arrowdown': case 's': direction = 'down'; break;
        case 'arrowleft': case 'a': direction = 'left'; break;
        case 'arrowright': case 'd': direction = 'right'; break;
        default: break;
      }

      if (direction) {
        event.preventDefault();
        handleMove(direction);

        if (!isWalking) {
          setIsWalking(true);
        }
        if (walkTimeout.current) {
          clearTimeout(walkTimeout.current);
        }
        walkTimeout.current = setTimeout(() => {
          const anyMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => keysPressed[k]);
          if (!anyMovementKey) {
            setIsWalking(false);
          }
        }, 150);
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      keysPressed[key] = false;

      const anyMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
        .some(k => keysPressed[k]);

      if (!anyMovementKey) {
        if (walkTimeout.current) clearTimeout(walkTimeout.current);
        setIsWalking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (walkTimeout.current) clearTimeout(walkTimeout.current);
    };
  }, [gameStarted, gameOver, showEventPopup, handleMove, isWalking, isActivityAnimating]); // isActivityAnimating added to dependencies

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
          // --- NEW PROPS ---
          isActivityAnimating={isActivityAnimating}
          currentActivityGif={currentActivityGif}
          onFastForward={handleFastForward}
          // --- END NEW PROPS ---
        />
      )}

      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}

      {showEventPopup && currentEvent && (
        <EventPopup
          event={currentEvent}
          onClose={() => {
            setShowEventPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default App;