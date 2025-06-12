import React, { useState, useEffect, useCallback } from 'react';
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
  'Meditation Guide': { activityBonus: { 'Pray': { happiness: 10, energy: 5 } } }, // Provides a bonus to the Pray activity
};

const App = () => {
  const [isWalking, setIsWalking] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
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
      'Meat': { type: 'food', stock: 2 }
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
      Home: { x: [10, 20], y: [10, 25] }, // Adjusted Y coordinates
      Mountain: { x: [40, 60], y: [15, 25] }, // Adjusted Y coordinates
      Lake: { x: [70, 90], y: [25, 35] }, // Adjusted Y coordinates
      Beach: { x: [70, 90], y: [70, 90] }, // Adjusted Y coordinates
      Temple: { x: [40, 60], y: [60, 75] } // Adjusted Y coordinates
    }
  };

  const locationEvents = {
    Home: {
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
    Temple: {
      message: "You feel peace in the temple. There is an opportunity for reflection.",
      rewards: {
        happiness: 25,
        energy: 15,
        inventory: { 'Meditation Guide': { type: 'tool', stock: 1 } }
      },
      requiredActivity: 'Pray'
    },
    Beach: {
      message: "The waves are calling! There's something special at the beach.",
      rewards: {
        happiness: 20,
        money: 300000,
        inventory: { 'Rare Seashell': { type: 'collectible', stock: 1 } }
      },
      requiredActivity: 'Swim' // Changed from 'Play' to 'Swim'
    },
    Lake: {
      message: "The lake looks calm, perfect for practicing your patience.",
      rewards: {
        happiness: 18,
        hunger: 15,
        inventory: { 'Freshwater Fish': { type: 'food', stock: 1 } }
      },
      requiredActivity: 'Fishing' // Changed from 'Play' to 'Fishing'
    },
    Mountain: {
      message: "The mountain view promises adventure. A discovery awaits.",
      rewards: {
        happiness: 30,
        energy: -10,
        hygiene: -5,
        inventory: { 'Mountain Herb': { type: 'plant', stock: 1 } }
      },
      requiredActivity: 'Hike' // Changed from 'Explore' to 'Hike'
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

  // Passive effects from collectible items
  const applyPassiveItemEffects = useCallback(() => {
    setPlayer(prevPlayer => {
      let newHappiness = prevPlayer.happiness;
      const collectibles = Object.keys(prevPlayer.inventory).filter(
        itemName => prevPlayer.inventory[itemName].type === 'collectible'
      );
      if (collectibles.length > 0) {
        // Each collectible grants +1 happiness per time period
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
  }, [decreasePlayerStatus, applyPassiveItemEffects]);

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
      money: 750000,
      happiness: 50,
      hunger: 50,
      hygiene: 50,
      energy: 50,
      location: "MainMap",
      inventory: {
        'Meat': { type: 'food', stock: 2 },
        'Passport': { type: 'collectible', stock: 1 },
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
      const travelCost = 5; // Fixed energy cost for travel
      const moneyCost = 500000; // Fixed money cost for travel

      for (const [area, bounds] of Object.entries(mapAreas.MainMap)) {
        if (newX >= bounds.x[0] && newX <= bounds.x[1] &&
          newY >= bounds.y[0] && newY <= bounds.y[1]) {
          // Check if player has enough money before transitioning
          if (player.money < moneyCost) {
            alert("Insufficient money to move to this location (Rp 500,000 required).");
            return false; // Prevent transition
          }

          setPlayer(prevPlayer => ({
            ...prevPlayer,
            location: area,
            energy: Math.max(0, prevPlayer.energy - travelCost), // Using fixed travelCost
            money: Math.max(0, prevPlayer.money - moneyCost), // Using fixed moneyCost
            happiness: Math.min(100, prevPlayer.happiness + 5),
          }));
          setAvatarPosition({ x: 50, y: 50 });

          triggerLocationEvent(area);
          return true;
        }
      }
    }
    return false;
  }, [player.location, player.money, mapAreas.MainMap, triggerLocationEvent]); // Added player.money to dependencies

  const handleMove = useCallback((direction) => {
    // Changed energy cost to 1 to allow movement until energy reaches 0
    const energyCost = 1; // Fixed energy cost for normal movement
    if (player.energy < energyCost) { // Check with appropriate cost
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
        energy: Math.max(0, prevPlayer.energy - 1) // Energy cost for each step
      }));
    }
  }, [player.energy, avatarPosition, checkAreaTransition]);

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
      alert(`Event successfully completed at ${currentEvent.location}! Rewards: ${currentEvent.rewards.happiness ? `+${currentEvent.rewards.happiness} Happiness, ` : ''}${currentEvent.rewards.energy ? `+${currentEvent.rewards.energy} Energy, ` : ''}${currentEvent.rewards.hunger ? `+${currentEvent.rewards.hunger} Hunger, ` : ''}${currentEvent.rewards.hygiene ? `+${currentEvent.rewards.hygiene} Hygiene, ` : ''}${currentEvent.rewards.money ? `+IDR${currentEvent.rewards.money.toLocaleString()}, ` : ''}${currentEvent.rewards.inventory ? Object.keys(currentEvent.rewards.inventory).map(item => `+${currentEvent.rewards.inventory[item].stock} ${item}`).join(', ') : ''}.`);
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
        const travelCost = 5;
        const moneyCost = 500000;

        // Check if player has enough money before allowing direct travel
        if (player.money < moneyCost) {
          alert(`Insufficient money to move to ${targetLocation} (Rp 500,000 required).`);
          return; // Prevent travel
        }

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
            alert("You worked hard! +IDR 500,000, -20 Energy, -5 Happiness, -10 Hunger.");
          } else {
            alert("You don't have enough energy to work!");
          }
        } else {
          alert(`You cannot work in ${player.location}! Try at home or Main Map.`);
        }
        break;

      case 'Eat':
      case 'Use Consumable Item': // New activity for using consumable items
        const availableConsumableItems = Object.keys(player.inventory).filter(itemName =>
          (player.inventory[itemName].type === 'food' || player.inventory[itemName].type === 'plant') && // Add 'plant'
          player.inventory[itemName].stock > 0 && CONSUMABLE_ITEM_EFFECTS[itemName]
        );

        if (activity === 'Use Consumable Item' && availableConsumableItems.length > 0) {
          const itemToUse = prompt(`Select an item to use (available: ${availableConsumableItems.join(', ')}):`);
          if (!itemToUse || !availableConsumableItems.includes(itemToUse)) {
            alert("Invalid choice or item not available.");
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
            let msg = `You used ${itemToUse}. `;
            if (effects.hunger) {
              newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + effects.hunger));
              msg += `${effects.hunger > 0 ? '+' : ''}${effects.hunger} Hunger, `;
            }
            if (effects.energy) {
              newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + effects.energy));
              msg += `${effects.energy > 0 ? '+' : ''}${effects.energy} Energy, `;
            }
            if (effects.happiness) {
              newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + effects.happiness));
              msg += `${effects.happiness > 0 ? '+' : ''}${effects.happiness} Happiness, `;
            }
            if (effects.hygiene) {
              newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + effects.hygiene));
              msg += `${effects.hygiene > 0 ? '+' : ''}${effects.hygiene} Hygiene, `;
            }
            msg += `-1 ${itemToUse}.`;
            alert(msg);
            return newPlayer;
          });
        } else if (activity === 'Eat' && player.location === 'Home') { // Eat logic at home remains the same for specific foods
          const homeFoodItems = Object.keys(player.inventory).filter(itemName =>
            player.inventory[itemName].type === 'food' && player.inventory[itemName].stock > 0 && CONSUMABLE_ITEM_EFFECTS[itemName]
          );
          if (homeFoodItems.length > 0) {
            const itemToEat = homeFoodItems[0]; // Just take the first one
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
              let msg = `You ate ${itemToEat}. `;
              if (effects.hunger) {
                newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + effects.hunger));
                msg += `${effects.hunger > 0 ? '+' : ''}${effects.hunger} Hunger, `;
              }
              if (effects.energy) {
                newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + effects.energy));
                msg += `${effects.energy > 0 ? '+' : ''}${effects.energy} Energy, `;
              }
              if (effects.happiness) {
                newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + effects.happiness));
                msg += `${effects.happiness > 0 ? '+' : ''}${effects.happiness} Happiness, `;
              }
              if (effects.hygiene) {
                newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + effects.hygiene));
                msg += `${effects.hygiene > 0 ? '+' : ''}${effects.hygiene} Hygiene, `;
              }
              msg += `-1 ${itemToEat}.`;
              alert(msg);
              return newPlayer;
            });
          } else {
            alert("You don't have any food to eat at home!");
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
            alert(`You ate at a restaurant in ${player.location}. -IDR 100,000, +40 Hunger, +10 Happiness, +10 Energy.`);
          } else {
            alert("You don't have enough money to eat at a restaurant!");
          }
        } else {
          alert("No consumable items available or invalid choice.");
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Swim':
        if (player.location === 'Beach') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 25),
            energy: Math.max(0, prevPlayer.energy - 20),
            hygiene: Math.max(0, prevPlayer.hygiene - 10),
          }));
          alert(`You swam at ${player.location}. +25 Happiness, -20 Energy, -10 Hygiene.`);
        } else {
          alert(`You can only swim at the Beach!`);
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Fishing':
        if (player.location === 'Lake') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 25),
            energy: Math.max(0, prevPlayer.energy - 20),
            hygiene: Math.max(0, prevPlayer.hygiene - 10),
            inventory: {
              ...prevPlayer.inventory,
              'Fish': { type: 'food', stock: (prevPlayer.inventory['Fish']?.stock || 0) + 1 }
            }
          }));
          alert(`You fished at ${player.location}. +25 Happiness, -20 Energy, -10 Hygiene, +1 Fish.`);
        } else {
          alert(`You can only fish at the Lake!`);
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Hike':
        if (player.location === 'Mountain') {
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30),
            energy: Math.max(0, prevPlayer.energy - 25),
            hunger: Math.max(0, prevPlayer.hunger - 15),
          }));
          alert(`You hiked in the Mountains. +30 Happiness, -25 Energy, -15 Hunger.`);
        } else {
          alert(`You can only hike in the Mountains!`);
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Sleep':
        if (player.location === 'Home') {
          setPlayer(prevPlayer => ({ ...prevPlayer, energy: Math.min(100, prevPlayer.energy + 50) }));
          setGameTime(prevTime => ({ ...prevTime, hour: Math.min(24, prevTime.hour + 6), minute: 0 }));
          alert("You slept. +50 Energy, 6 hours passed.");
        } else {
          alert("You can only sleep at home!");
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
          alert("You took a bath. +40 Hygiene, -5 Energy.");
        } else {
          alert("You can only take a bath at home!");
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
            alert(`You bought a souvenir in ${player.location}. -IDR 200,000, +20 Happiness, +1 Souvenir.`);
          } else {
            alert("You don't have enough money to buy a souvenir!");
          }
        } else {
          alert("There are no souvenirs to buy at home!");
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Explore': // This case will now handle general exploration, not specific to Mountain
        if (player.location !== 'Home' && player.location !== 'Mountain') { // Exclude Mountain as it has 'Hike'
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 25),
            energy: Math.max(0, prevPlayer.energy - 20),
            hygiene: Math.max(0, prevPlayer.hygiene - 10),
          }));
          alert(`You explored ${player.location}. +25 Happiness, -20 Energy, -10 Hygiene.`);
        } else if (player.location === 'Home') {
          alert("There's nothing new to explore at home!");
        } else if (player.location === 'Mountain') {
          alert("You should 'Hike' in the mountains instead of 'Explore'!");
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      case 'Pray':
        if (player.location === 'Temple') {
          let happinessBonus = 0;
          let energyBonus = 0;
          // Check if the player has a Meditation Guide
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
          alert(`You prayed at the Temple. +${30 + happinessBonus} Happiness, +${10 + energyBonus} Energy.${happinessBonus > 0 ? ' (Meditation Guide blessing!)' : ''}`);
        } else {
          alert("You can only pray at the Temple!");
        }
        if (isEventActivity) {
          applyEventRewards();
        }
        break;

      default:
        break;
    }
  }, [player, currentEvent, applyEventRewards, mapAreas, triggerLocationEvent]);


  // This is the main useEffect for keyboard handling
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
        case 'down':
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
