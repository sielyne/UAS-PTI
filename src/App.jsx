import React, { useState, useEffect, useCallback, useRef } from 'react';
import AvatarSelection from './components/AvatarSelection';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EventPopup from './components/activities/EventPopup';
import './index.css';

// --- Definisi Konstanta ---
const ACTIVITY_GIFS = {
    'Work': '/assets/gifs/kerja.gif',
    'Eat': '/assets/gifs/makan.gif',
    'Use Consumable Item': '/assets/gifs/makan.gif',
    'Swim': '/assets/gifs/renang.gif',
    'Fishing': '/assets/gifs/mancing.gif',
    'Hike': '/assets/gifs/hiking.gif',
    'Sleep': '/assets/gifs/tidur.gif',
    'Take a Bath': '/assets/gifs/mandi.gif',
    'Buy Souvenir': '/assets/gifs/souvenir.gif',
    'Explore': '/assets/gifs/explore.gif',
    'Explore Area': '/assets/gifs/explore.gif',
    'Pray': '/assets/gifs/doa.gif',
    'Go to Home': '/assets/gifs/travel.gif',
    'Go to Mountain': '/assets/gifs/travel.gif',
    'Go to Lake': '/assets/gifs/travel.gif',
    'Go to Beach': '/assets/gifs/travel.gif',
    'Go to Temple': '/assets/gifs/travel.gif',
    'Go to MainMap': '/assets/gifs/travel.gif', // Pastikan GIF ini ada
};

const CONSUMABLE_ITEM_EFFECTS = {
    'Meat': { hunger: 30, energy: 5, happiness: 0, hygiene: 0 },
    'Freshwater Fish': { hunger: 20, energy: 10, happiness: 5, hygiene: 0 },
    'Comfort Food': { hunger: 25, energy: 15, happiness: 10, hygiene: 0 },
    'Fish': { hunger: 20, energy: 10, happiness: 5, hygiene: 0 },
    'Mountain Herb': { hunger: 5, energy: 15, happiness: 5, hygiene: 0 },
};

const NON_CONSUMABLE_ITEM_EFFECTS = {
    'Meditation Guide': { activityBonus: { 'Pray': { happiness: 10, energy: 5 } } },
};

const MAP_AREAS = {
    MainMap: {
        Home: { x: [10, 20], y: [10, 25] },
        Mountain: { x: [40, 60], y: [15, 25] },
        Lake: { x: [70, 90], y: [25, 35] },
        Beach: { x: [70, 90], y: [70, 90] },
        Temple: { x: [40, 60], y: [60, 75] }
    }
};

const LOCATION_EVENTS = {
    'MainMap': [
        {
            id: 'mainmap_merchant',
            message: 'A traveling merchant arrived! You can buy rare goods if you visit the Temple.',
            requiredActivity: 'Buy Souvenir',
            location: 'Temple', // Ini adalah lokasi referensi untuk aktivitas, BUKAN lokasi pemicu event
            rewards: { money: 500000, inventory: { 'Rare Stone': { type: 'collectible', stock: 1 } } },
        },
        {
            id: 'mainmap_community_help',
            message: 'The local community needs help gathering fruits. If you help them at Home, they might reward you!',
            requiredActivity: 'Work',
            location: 'Home', // Ini adalah lokasi referensi untuk aktivitas, BUKAN lokasi pemicu event
            rewards: { happiness: 10, inventory: { 'Tropical Fruit': { type: 'food', stock: 2 } } },
        },
    ],
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
            requiredActivity: 'Sleep',
            location: 'Home' // Ini adalah lokasi pemicu event
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
            requiredActivity: 'Pray',
            location: 'Temple' // Ini adalah lokasi pemicu event
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
            requiredActivity: 'Swim',
            location: 'Beach' // Ini adalah lokasi pemicu event
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
            requiredActivity: 'Fishing',
            location: 'Lake' // Ini adalah lokasi pemicu event
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
            requiredActivity: 'Hike',
            location: 'Mountain' // Ini adalah lokasi pemicu event
        }
    ]
};

const App = () => {
    // --- States ---
    const [isAvatarSelected, setIsAvatarSelected] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [player, setPlayer] = useState({
        name: '',
        money: 750000,
        happiness: 50,
        hunger: 50,
        hygiene: 50,
        energy: 50,
        location: 'MainMap',
        inventory: {
            'Meat': { type: 'food', stock: 2 },
            'Meditation Guide': { type: 'tool', stock: 1 }
        },
        avatar: null,
    });
    const resetGame = () => {
        if (newEnergy <= 0) {
            alert("Game Over!");
            resetGame();
            return;
    }

        setAvatarPosition({ x: 5, y: 5 });
        setGameTime({ hour: 6, minute: 0 });
        setIsWalking(false);
        setIsActivityAnimating(false);
        setCurrentActivityGif(null);
        setCurrentEvent(null);
    };

    const [gameTime, setGameTime] = useState({ hour: 8, minute: 0, day: 1 });
    const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
    const [isWalking, setIsWalking] = useState(false);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null); // currentEvent sekarang akan punya properti triggerLocation

    // --- STATE UNTUK ANIMASI AKTIVITAS ---
    const [isActivityAnimating, setIsActivityAnimating] = useState(false);
    const [currentActivityGif, setCurrentActivityGif] = useState(null);

    // --- REFS ---
    const timeIntervalRef = useRef(null);
    const activityTimeoutRef = useRef(null);
    const pendingActivity = useRef(null);
    const walkTimeout = useRef(null);
    const triggeredEventsRef = useRef({});
    const isReturningToMainMapRef = useRef(false);

    // --- Callbacks (dioptimalkan dengan useCallback) ---
    const handleSetAvatar = useCallback((avatarPath) => {
        setPlayer(prevPlayer => ({
            ...prevPlayer,
            avatar: avatarPath,
        }));
    }, []);

    const handleGameStart = useCallback((playerNameInput) => {
        setPlayer(prevPlayer => ({
            ...prevPlayer,
            name: playerNameInput.trim() || 'Player',
        }));
        setIsAvatarSelected(true);
    }, []);

    const decreasePlayerStatus = useCallback(() => {
        setPlayer(prevPlayer => {
            let newPlayer = { ...prevPlayer };
            newPlayer.hunger = Math.max(0, newPlayer.hunger - 1);
            newPlayer.hygiene = Math.max(0, newPlayer.hygiene - 1);
            newPlayer.energy = Math.max(0, newPlayer.energy - 1);
            newPlayer.happiness = Math.max(0, newPlayer.happiness - 1);

            const collectibles = Object.keys(prevPlayer.inventory).filter(
                itemName => prevPlayer.inventory[itemName]?.type === 'collectible'
            );
            if (collectibles.length > 0) {
                newPlayer.happiness = Math.min(100, newPlayer.happiness + (collectibles.length * 1));
            }

            return newPlayer;
        });
    }, []);

    const triggerLocationEvent = useCallback((location, currentPlayerState) => {
        // Logika untuk mereset event yang sedang aktif saat pindah lokasi
        // Gunakan currentEvent.triggerLocation untuk memastikan kita mereset event dari lokasi pemicu yang berbeda
        const currentEventTriggerLocation = currentEvent ? currentEvent.triggerLocation : null;
        if (currentEvent && currentEventTriggerLocation !== location) {
            setShowEventPopup(false);
            setCurrentEvent(null);
        }

        const potentialEvents = LOCATION_EVENTS[location]; // Mendapatkan event berdasarkan KUNCI lokasi saat ini
        if (potentialEvents && potentialEvents.length > 0) {
            const availableEvents = potentialEvents.filter(event =>
                !triggeredEventsRef.current[event.id] && (!event.condition || event.condition(currentPlayerState))
            );

            if (availableEvents.length > 0) {
                const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
                // Simpan event yang terpilih, dan tambahkan properti triggerLocation
                // Ini memastikan kita tahu di lokasi mana event ini *sebenarnya* dipicu
                setCurrentEvent({ ...randomEvent, triggerLocation: location }); // <--- PERUBAHAN UTAMA DI SINI
                setShowEventPopup(true);
            } else {
                setCurrentEvent(null);
                setShowEventPopup(false);
            }
        } else {
            setCurrentEvent(null);
            setShowEventPopup(false);
        }
    }, [currentEvent]); // currentEvent masih dependency untuk pengecekan awal

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
            // Mark event as triggered using its original ID
            triggeredEventsRef.current = { ...triggeredEventsRef.current, [currentEvent.id]: true };
            setShowEventPopup(false);
            setCurrentEvent(null);
        }
    }, [currentEvent, setPlayer]);

    const handleMove = useCallback((direction) => {
        if (isActivityAnimating) return;
        if (player.energy < 1) {
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

        setAvatarPosition({ x: newX, y: newY });
        setPlayer(prevPlayer => ({
            ...prevPlayer,
            energy: Math.max(0, prevPlayer.energy - 1)
        }));

        setIsWalking(true);
        if (walkTimeout.current) clearTimeout(walkTimeout.current);
        walkTimeout.current = setTimeout(() => setIsWalking(false), 300);

    }, [player.energy, avatarPosition, isActivityAnimating]);

    const handleBackToMainMap = useCallback(() => {
        if (isActivityAnimating) return;

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

        if (isReturningToMainMapRef.current) return;
        isReturningToMainMapRef.current = true;

        // --- TAMBAHKAN DUA BARIS INI DI SINI ---
        setShowEventPopup(false);
        setCurrentEvent(null);
        // --- AKHIR PENAMBAHAN ---

        const performBackToMainMapEffect = (prevPlayer) => {
            if (prevPlayer.location === 'MainMap') {
                return prevPlayer;
            }
            return {
                ...prevPlayer,
                location: 'MainMap',
                energy: Math.max(0, prevPlayer.energy - travelEnergyCost),
                money: Math.max(0, prevPlayer.money - travelMoneyCost),
                happiness: Math.min(100, prevPlayer.happiness + 5),
            };
        };

        setCurrentActivityGif(ACTIVITY_GIFS['Go to MainMap']);
        setIsActivityAnimating(true);
        pendingActivity.current = {
            activityName: 'Go to MainMap',
            effectToApply: performBackToMainMapEffect,
            alertMessage: `You returned to Main Map. -${travelEnergyCost} Energy, -Rp${travelMoneyCost.toLocaleString()} Money, +5 Happiness.`,
            isLocationChange: true
        };

        activityTimeoutRef.current = setTimeout(() => {
            setIsActivityAnimating(false);
            setCurrentActivityGif(null);
            if (pendingActivity.current) {
                const { activityName: completedActivityName, effectToApply: completedEffect, alertMessage: finalAlertMessage, isLocationChange: isCompletedLocationChange } = pendingActivity.current;

                if (completedEffect) {
                    setPlayer(prevPlayer => {
                        const updatedPlayer = completedEffect(prevPlayer);
                        if (isCompletedLocationChange && updatedPlayer.location !== prevPlayer.location) {
                            setAvatarPosition({ x: 50, y: 50 });
                            // Dua baris ini sekarang bisa dihapus karena sudah dipindahkan ke atas
                            // setCurrentEvent(null);
                            // setShowEventPopup(false);
                            triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                        }
                        return updatedPlayer;
                    });
                }
                if (finalAlertMessage) alert(finalAlertMessage);

                isReturningToMainMapRef.current = false;
                pendingActivity.current = null;
            }
        }, 7000);
    }, [player, setPlayer, triggerLocationEvent, isActivityAnimating]);
    
    const handleActivity = useCallback((activityName, duration = 7000) => {
        if (isActivityAnimating) return;

        let alertMessage = "";
        let activityCostMet = true;
        let effectToApply = null;
        let isLocationChangeActivity = false;

        switch (activityName) {
            case 'Work':
                if (player.energy < 20) { alertMessage = "You don't have enough energy (20) to work!"; activityCostMet = false; }
                else if (player.location !== 'Home' && player.location !== 'MainMap') { alertMessage = `You cannot work in ${player.location}! Try at home or Main Map.`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({
                        ...prevPlayer,
                        money: prevPlayer.money + 500000,
                        energy: Math.max(0, prevPlayer.energy - 20),
                        happiness: Math.max(0, prevPlayer.happiness - 5),
                        hunger: Math.max(0, prevPlayer.hunger - 10),
                    });
                    alertMessage = "You worked hard! +IDR 500,000, -20 Energy, -5 Happiness, -10 Hunger.";
                }
                break;
            case 'Eat':
            case 'Use Consumable Item':
                const availableConsumableItems = Object.keys(player.inventory).filter(itemName =>
                    (player.inventory[itemName]?.type === 'food' || player.inventory[itemName]?.type === 'plant') &&
                    player.inventory[itemName]?.stock > 0 && CONSUMABLE_ITEM_EFFECTS[itemName]
                );

                let itemToUse = null;
                if (activityName === 'Use Consumable Item' && availableConsumableItems.length > 0) {
                    itemToUse = prompt(`Select an item to use (available: ${availableConsumableItems.join(', ')}):`);
                    if (!itemToUse || !availableConsumableItems.includes(itemToUse)) { alertMessage = "Invalid choice or item not available."; activityCostMet = false; break; }
                } else if (activityName === 'Eat' && player.location === 'Home') {
                    if (availableConsumableItems.length > 0) { itemToUse = availableConsumableItems[0]; }
                    else { alertMessage = "You don't have any food to eat at home! Try buying some or fishing."; activityCostMet = false; break; }
                } else if (activityName === 'Eat' && player.location !== 'Home') {
                    const restaurantCost = 100000;
                    if (player.money < restaurantCost) { alertMessage = "You don't have enough money to eat at a restaurant!"; activityCostMet = false; break; }
                    effectToApply = (prevPlayer) => ({
                        ...prevPlayer, money: prevPlayer.money - restaurantCost, hunger: Math.min(100, prevPlayer.hunger + 40),
                        happiness: Math.min(100, prevPlayer.happiness + 10), energy: Math.min(100, prevPlayer.energy + 10),
                    });
                    alertMessage = `You ate at a restaurant in ${player.location}. -IDR 100,000, +40 Hunger, +10 Happiness, +10 Energy.`;
                    break;
                } else { alertMessage = "No consumable items available or invalid choice."; activityCostMet = false; break; }

                if (itemToUse) {
                    const effects = CONSUMABLE_ITEM_EFFECTS[itemToUse];
                    effectToApply = (prevPlayer) => {
                        let newPlayer = { ...prevPlayer };
                        newPlayer.inventory = { ...newPlayer.inventory, [itemToUse]: { ...newPlayer.inventory[itemToUse], stock: newPlayer.inventory[itemToUse].stock - 1 } };
                        if (newPlayer.inventory[itemToUse].stock <= 0) { const { [itemToUse]: _, ...restInventory } = newPlayer.inventory; newPlayer.inventory = restInventory; }
                        if (effects.hunger !== undefined) { newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + effects.hunger)); }
                        if (effects.energy !== undefined) { newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + effects.energy)); }
                        if (effects.happiness !== undefined) { newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + effects.happiness)); }
                        if (effects.hygiene !== undefined) { newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + effects.hygiene)); }
                        return newPlayer;
                    };
                    let msg = `You used ${itemToUse}. `;
                    if (effects.hunger !== undefined) msg += `${effects.hunger > 0 ? '+' : ''}${effects.hunger} Hunger, `;
                    if (effects.energy !== undefined) msg += `${effects.energy > 0 ? '+' : ''}${effects.energy} Energy, `;
                    if (effects.happiness !== undefined) msg += `${effects.happiness > 0 ? '+' : ''}${effects.happiness} Happiness, `;
                    if (effects.hygiene !== undefined) msg += `${effects.hygiene > 0 ? '+' : ''}${effects.hygiene} Hygiene, `;
                    msg += `-1 ${itemToUse}.`;
                    alertMessage = msg;
                } else { activityCostMet = false; }
                break;
            case 'Swim':
                const swimEnergyCost = 20; const swimHygieneCost = 10;
                if (player.location !== 'Beach') { alertMessage = `You can only swim at the Beach!`; activityCostMet = false; }
                else if (player.energy < swimEnergyCost) { alertMessage = `You don't have enough energy (${swimEnergyCost}) to swim!`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, happiness: Math.min(100, prevPlayer.happiness + 25), energy: Math.max(0, prevPlayer.energy - swimEnergyCost), hygiene: Math.max(0, prevPlayer.hygiene - swimHygieneCost), });
                    alertMessage = `You swam at ${player.location}. +25 Happiness, -${swimEnergyCost} Energy, -${swimHygieneCost} Hygiene.`;
                }
                break;
            case 'Fishing':
                const fishEnergyCost = 20; const fishHygieneCost = 10;
                if (player.location !== 'Lake') { alertMessage = `You can only fish at the Lake!`; activityCostMet = false; }
                else if (player.energy < fishEnergyCost) { alertMessage = `You don't have enough energy (${fishEnergyCost}) to fish!`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, happiness: Math.min(100, prevPlayer.happiness + 25), energy: Math.max(0, prevPlayer.energy - fishEnergyCost), hygiene: Math.max(0, prevPlayer.hygiene - fishHygieneCost), inventory: { ...prevPlayer.inventory, 'Fish': { type: 'food', stock: (prevPlayer.inventory['Fish']?.stock || 0) + 1 } } });
                    alertMessage = `You fished at ${player.location}. +25 Happiness, -${fishEnergyCost} Energy, -${fishHygieneCost} Hygiene, +1 Fish.`;
                }
                break;
            case 'Hike':
                const hikeEnergyCost = 25; const hikeHungerCost = 15;
                if (player.location !== 'Mountain') { alertMessage = `You can only hike in the Mountains!`; activityCostMet = false; }
                else if (player.energy < hikeEnergyCost) { alertMessage = `You don't have enough energy (${hikeEnergyCost}) to hike!`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, happiness: Math.min(100, prevPlayer.happiness + 30), energy: Math.max(0, prevPlayer.energy - hikeEnergyCost), hunger: Math.max(0, prevPlayer.hunger - hikeHungerCost), });
                    alertMessage = `You hiked in the Mountains. +30 Happiness, -${hikeEnergyCost} Energy, -${hikeHungerCost} Hunger.`;
                }
                break;
            case 'Sleep':
                const sleepEnergyGain = 50;
                if (player.location !== 'Home') { alertMessage = "You can only sleep at home!"; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => {
                        setGameTime(prevTime => {
                            let newHour = prevTime.hour + 6;
                            let newDay = prevTime.day;
                            if (newHour >= 24) { newDay += Math.floor(newHour / 24); newHour %= 24; }
                            return { ...prevTime, hour: newHour, minute: 0, day: newDay };
                        });
                        return { ...prevPlayer, energy: Math.min(100, prevPlayer.energy + sleepEnergyGain) };
                    };
                    alertMessage = "You slept. +50 Energy, 6 hours passed.";
                }
                break;
            case 'Take a Bath':
                const bathHygieneGain = 40; const bathEnergyCost = 5;
                if (player.location !== 'Home') { alertMessage = "You can only take a bath at home!"; activityCostMet = false; }
                else if (player.energy < bathEnergyCost) { alertMessage = `You don't have enough energy (${bathEnergyCost}) to take a bath!`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, hygiene: Math.min(100, prevPlayer.hygiene + bathHygieneGain), energy: Math.max(0, prevPlayer.energy - bathEnergyCost), });
                    alertMessage = "You took a bath. +40 Hygiene, -5 Energy.";
                }
                break;
            case 'Buy Souvenir':
                const souvenirCost = 200000;
                if (player.location === 'Home') { alertMessage = "There are no souvenirs to buy at home!"; activityCostMet = false; }
                else if (player.money < souvenirCost) { alertMessage = `You don't have enough money (IDR ${souvenirCost.toLocaleString()} required) to buy a souvenir!`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, money: prevPlayer.money - souvenirCost, happiness: Math.min(100, prevPlayer.happiness + 20), inventory: { ...prevPlayer.inventory, 'Souvenir': { type: 'collectible', stock: (prevPlayer.inventory['Souvenir']?.stock || 0) + 1 } } });
                    alertMessage = `You bought a souvenir in ${player.location}. -IDR 200,000, +20 Happiness, +1 Souvenir.`;
                }
                break;
            case 'Explore':
            case 'Explore Area':
                const exploreEnergyCost = 20; const exploreHygieneCost = 10;
                if (player.location === 'Home') { alertMessage = "There's nothing new to explore at home!"; activityCostMet = false; }
                else if (player.location === 'Mountain') { alertMessage = "You should 'Hike' in the mountains instead of 'Explore'!"; activityCostMet = false; }
                else if (player.energy < exploreEnergyCost) { alertMessage = `You don't have enough energy (${exploreEnergyCost}) to explore!`; activityCostMet = false; }
                else {
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, happiness: Math.min(100, prevPlayer.happiness + 25), energy: Math.max(0, prevPlayer.energy - exploreEnergyCost), hygiene: Math.max(0, prevPlayer.hygiene - exploreHygieneCost), });
                    alertMessage = `You explored ${player.location}. +25 Happiness, -${exploreEnergyCost} Energy, -${exploreHygieneCost} Hygiene.`;
                }
                break;
            case 'Pray':
                const prayEnergyCost = 10;
                if (player.location !== 'Temple') { alertMessage = "You can only pray at the Temple!"; activityCostMet = false; }
                else if (player.energy < prayEnergyCost) { alertMessage = `You don't have enough energy (${prayEnergyCost}) to pray!`; activityCostMet = false; }
                else {
                    let happinessBonus = 0; let energyBonus = 0;
                    if (player.inventory['Meditation Guide'] && player.inventory['Meditation Guide'].stock > 0) {
                        if (NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide']?.activityBonus?.['Pray']) {
                            happinessBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].happiness || 0;
                            energyBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].energy || 0;
                        }
                    }
                    effectToApply = (prevPlayer) => ({ ...prevPlayer, happiness: Math.min(100, prevPlayer.happiness + 30 + happinessBonus), energy: Math.min(100, prevPlayer.energy - prayEnergyCost + energyBonus), });
                    alertMessage = `You prayed at the Temple. +${30 + happinessBonus} Happiness, -${prayEnergyCost - energyBonus} Energy.${happinessBonus > 0 || energyBonus > 0 ? ' (Meditation Guide blessing!)' : ''}`;
                }
                break;
            case 'Go to Home':
            case 'Go to Mountain':
            case 'Go to Lake':
            case 'Go to Beach':
            case 'Go to Temple':
                const targetLocation = activityName.replace('Go to ', '');
                isLocationChangeActivity = true; // Set flag
                // Handle travel from MainMap to sub-location
                if (player.location === 'MainMap' && MAP_AREAS.MainMap[targetLocation]) {
                    const travelEnergyCost = 15;
                    const travelMoneyCost = 500000;
                    if (player.money < travelMoneyCost) { alertMessage = `Insufficient money to travel to ${targetLocation} (Rp ${travelMoneyCost.toLocaleString()} required).`; activityCostMet = false; }
                    else if (player.energy < travelEnergyCost) { alertMessage = `You don't have enough energy (${travelEnergyCost}) to travel to ${targetLocation}!`; activityCostMet = false; }
                    else {
                        effectToApply = (prevPlayer) => ({
                            ...prevPlayer, location: targetLocation, energy: Math.max(0, prevPlayer.energy - travelEnergyCost),
                            money: Math.max(0, prevPlayer.money - travelMoneyCost), happiness: Math.min(100, prevPlayer.happiness + 5),
                        });
                        alertMessage = `You traveled to ${targetLocation}. -${travelEnergyCost} Energy, -Rp${travelMoneyCost.toLocaleString()} Money, +5 Happiness.`;
                    }
                } else {
                    alertMessage = `Invalid travel to ${targetLocation} from ${player.location}.`; activityCostMet = false;
                }
                break;
            default:
                alertMessage = `Unknown activity: ${activityName}`; activityCostMet = false;
                break;
        }

        // --- Jika biaya/kondisi tidak terpenuhi, tampilkan alert dan KELUAR ---
        if (!activityCostMet) {
            if (alertMessage) alert(alertMessage);
            return;
        }

        // --- Jika semua cek terpenuhi, baru jalankan animasi dan efek ---
        const gif = ACTIVITY_GIFS[activityName];
        if (gif) {
            setCurrentActivityGif(gif);
            setIsActivityAnimating(true);
            pendingActivity.current = { activityName, effectToApply, alertMessage, isLocationChange: isLocationChangeActivity }; // Simpan flag

            activityTimeoutRef.current = setTimeout(() => {
                if (pendingActivity.current) {
                    const { activityName: completedActivityName, effectToApply: completedEffect, alertMessage: finalAlertMessage, isLocationChange: isCompletedLocationChange } = pendingActivity.current;

                    if (completedEffect) {
                        setPlayer(prevPlayer => {
                            const updatedPlayer = completedEffect(prevPlayer);
                            // Logika untuk perubahan lokasi setelah efek diterapkan
                            if (isCompletedLocationChange && updatedPlayer.location !== prevPlayer.location) {
                                setAvatarPosition({ x: 50, y: 50 });
                                setCurrentEvent(null);
                                setShowEventPopup(false);
                                triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                            }
                            return updatedPlayer;
                        });
                    }
                    if (finalAlertMessage) alert(finalAlertMessage);

                    // Pengecekan event hanya jika BUKAN perubahan lokasi
                    // Atau jika event itu adalah event yang dipicu di lokasi saat ini
                    if (currentEvent &&
                        (currentEvent.triggerLocation === player.location || !isCompletedLocationChange) && // Cek triggerLocation atau bukan perpindahan lokasi
                        currentEvent.requiredActivity === completedActivityName &&
                        !triggeredEventsRef.current[currentEvent.id]
                    ) {
                        applyEventRewards();
                    } else if (currentEvent && currentEvent.triggerLocation !== player.location) { // Jika event tidak relevan dengan lokasi sekarang
                        setCurrentEvent(null);
                        setShowEventPopup(false);
                    }

                    pendingActivity.current = null;
                }
                setIsActivityAnimating(false);
                setCurrentActivityGif(null);
            }, duration);
        } else { // No GIF, immediate effect
            if (effectToApply) {
                setPlayer(prevPlayer => {
                    const updatedPlayer = effectToApply(prevPlayer);
                    if (isLocationChangeActivity && updatedPlayer.location !== prevPlayer.location) {
                        setAvatarPosition({ x: 50, y: 50 });
                        setCurrentEvent(null);
                        setShowEventPopup(false);
                        triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                    }
                    return updatedPlayer;
                });
            }
            if (alertMessage) alert(alertMessage);

            if (currentEvent &&
                (currentEvent.triggerLocation === player.location || !isLocationChangeActivity) && // Cek triggerLocation atau bukan perpindahan lokasi
                currentEvent.requiredActivity === activityName &&
                !triggeredEventsRef.current[currentEvent.id]
            ) {
                applyEventRewards();
            } else if (currentEvent && currentEvent.triggerLocation !== player.location) { // Jika event tidak relevan dengan lokasi sekarang
                setCurrentEvent(null);
                setShowEventPopup(false);
            }
        }
    }, [player, currentEvent, applyEventRewards, triggerLocationEvent, isActivityAnimating]);


    const handleFastForward = useCallback(() => {
        if (isActivityAnimating) {
            if (activityTimeoutRef.current) {
                clearTimeout(activityTimeoutRef.current);
            }
            setIsActivityAnimating(false);
            setCurrentActivityGif(null);

            if (pendingActivity.current) {
                const { activityName: completedActivityName, effectToApply: completedEffect, alertMessage: finalAlertMessage, isLocationChange: isCompletedLocationChange } = pendingActivity.current;

                if (completedEffect) {
                    setPlayer(prevPlayer => {
                        const updatedPlayer = completedEffect(prevPlayer); // Panggil efek yang disimpan

                        // Logika perubahan lokasi untuk fast-forward
                        if (isCompletedLocationChange && updatedPlayer.location !== prevPlayer.location) {
                            setAvatarPosition({ x: 50, y: 50 });
                            setCurrentEvent(null);
                            setShowEventPopup(false);
                            triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                        }
                        return updatedPlayer;
                    });
                }

                if (finalAlertMessage) {
                    alert(finalAlertMessage);
                }

                // Pengecekan event hanya jika BUKAN perubahan lokasi
                if (!isCompletedLocationChange && currentEvent &&
                    currentEvent.triggerLocation === player.location && // <--- Gunakan triggerLocation di sini juga
                    currentEvent.requiredActivity === completedActivityName &&
                    !triggeredEventsRef.current[currentEvent.id]
                ) {
                    applyEventRewards();
                } else if (currentEvent && currentEvent.triggerLocation !== player.location) { // Jika event tidak relevan dengan lokasi sekarang
                    setCurrentEvent(null);
                    setShowEventPopup(false);
                }


                if (completedActivityName === 'Go to MainMap') {
                    isReturningToMainMapRef.current = false;
                }

                pendingActivity.current = null;
            }
        }
    }, [isActivityAnimating, currentEvent, applyEventRewards, triggerLocationEvent, player]); // `player` masih perlu di sini untuk `currentEvent.location === player.location` check

    // --- useEffect untuk Game Time ---
    useEffect(() => {
        if (isAvatarSelected && !gameOver) {
            timeIntervalRef.current = setInterval(() => {
                setGameTime(prevTime => {
                    let newMinute = prevTime.minute + 10;
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
                    }

                    return { hour: newHour, minute: newMinute, day: newDay };
                });
            }, 1000); // Setiap 1 detik = 10 menit waktu game
        } else {
            clearInterval(timeIntervalRef.current);
        }

        return () => clearInterval(timeIntervalRef.current);
    }, [isAvatarSelected, gameOver, decreasePlayerStatus]);

    // --- useEffect untuk Game Over ---
    useEffect(() => {
        if (
            player.hunger <= 0 ||
            player.hygiene <= 0 ||
            player.energy <= 0 ||
            player.happiness <= 0
        ) {
            if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
            setGameOver(true);
            setIsAvatarSelected(false);
            alert(`Game Over! ${player.name}'s journey ended due to low stats.`);
        }
    }, [player]);

    // --- useEffect untuk Keyboard Event Listener ---
    useEffect(() => {
        let keysPressed = {};

        const handleKeyDown = (event) => {
            if (!isAvatarSelected || gameOver || showEventPopup || isActivityAnimating) {
                if (walkTimeout.current) clearTimeout(walkTimeout.current);
                setIsWalking(false);
                return;
            }

            const key = event.key.toLowerCase();
            keysPressed[key] = true;

            let direction = null;
            switch (key) {
                case 'arrowup': case 'w': direction = 'up'; break;
                case 'down': case 's': direction = 'down'; break;
                case 'left': case 'a': direction = 'left'; break;
                case 'right': case 'd': direction = 'right'; break;
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
    }, [isAvatarSelected, gameOver, showEventPopup, handleMove, isWalking, isActivityAnimating]);


    // --- Render ---
    // ... di dalam App.jsx

    if (gameOver) {
        return (
            <GameOverScreen
                player={player} // <-- TAMBAHKAN BARIS INI
                onRestartGame={() => {
                    setIsAvatarSelected(false);
                    setGameOver(false);
                    setPlayer({
                        name: '',
                        money: 750000,
                        happiness: 50,
                        hunger: 50,
                        hygiene: 50,
                        energy: 50,
                        location: 'MainMap',
                        inventory: {
                            'Meat': { type: 'food', stock: 2 },
                            'Meditation Guide': { type: 'tool', stock: 1 }
                        },
                        avatar: null,
                    });
                    setGameTime({ hour: 8, minute: 0, day: 1 });
                    setAvatarPosition({ x: 50, y: 50 });
                    setIsWalking(false);
                    setShowEventPopup(false);
                    setCurrentEvent(null);
                    triggeredEventsRef.current = {};
                    setIsActivityAnimating(false);
                    setCurrentActivityGif(null);
                    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
                    pendingActivity.current = null;
                    isReturningToMainMapRef.current = false;
                }}
            />
        );
    }
    if (!isAvatarSelected) {
        return (
            <AvatarSelection
                onAvatarSelect={handleSetAvatar}
                onStartGame={handleGameStart}
            />
        );
    }

    return (
        <div className="app">
            <GameScreen
                player={player}
                gameTime={gameTime}
                avatarPosition={avatarPosition}
                onMove={handleMove}
                onBackToMainMap={handleBackToMainMap}
                onActivity={handleActivity}
                isWalking={isWalking}
                isActivityAnimating={isActivityAnimating}
                currentActivityGif={currentActivityGif}
                onFastForward={handleFastForward}
            />
            {showEventPopup && currentEvent && currentEvent.triggerLocation === player.location && ( // <--- PERUBAHAN UTAMA DI SINI
                <EventPopup
                    event={currentEvent} // event object itu sendiri memiliki properti 'location' asli (misal 'Temple')
                    onClose={() => {
                        if (currentEvent) {
                            triggeredEventsRef.current = { ...triggeredEventsRef.current, [currentEvent.id]: true };
                        }
                        setShowEventPopup(false);
                        setCurrentEvent(null);
                    }}
                />
            )}
        </div>
    );
};

export default App;