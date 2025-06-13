import React, { useState, useEffect, useCallback, useRef } from 'react';
import AvatarSelection from './components/AvatarSelection';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EventPopup from './components/activities/EventPopup';
import './index.css'; // Pastikan file CSS ini ada

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
    'Go to MainMap': '/assets/gifs/travel.gif',
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
            location: 'Temple', // Lokasi di mana aktivitas harus dilakukan untuk event ini
            rewards: { money: 500000, inventory: { 'Rare Stone': { type: 'collectible', stock: 1 } } },
        },
        {
            id: 'mainmap_community_help',
            message: 'The local community needs help gathering fruits. If you help them at Home, they might reward you!',
            requiredActivity: 'Work',
            location: 'Home', // Lokasi di mana aktivitas harus dilakukan untuk event ini
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
            location: 'Home' // Lokasi pemicu event
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
            location: 'Temple' // Lokasi pemicu event
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
            location: 'Beach' // Lokasi pemicu event
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
            location: 'Lake' // Lokasi pemicu event
        }
    ],
    'Mountain': [
        {
            id: 'mountain_adventure',
            message: "The mountain view promises adventure. A discovery awaits.",
            rewards: {
                happiness: 30,
                energy: -10, // Example of negative effect
                hygiene: -5, // Example of negative effect
                inventory: { 'Mountain Herb': { type: 'plant', stock: 1 } }
            },
            requiredActivity: 'Hike',
            location: 'Mountain' // Lokasi pemicu event
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
            // 'Meditation Guide': { type: 'tool', stock: 1 } // DIHAPUS DARI SINI
        },
        avatar: null,
    });

    const [gameTime, setGameTime] = useState({ hour: 8, minute: 0, day: 1 });
    const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
    const [isWalking, setIsWalking] = useState(false);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    // --- STATE UNTUK ANIMASI AKTIVITAS ---
    const [isActivityAnimating, setIsActivityAnimating] = useState(false);
    const [currentActivityGif, setCurrentActivityGif] = useState(null);

    // --- REFS ---
    const timeIntervalRef = useRef(null);
    const activityTimeoutRef = useRef(null);
    const pendingActivity = useRef(null);
    const walkTimeout = useRef(null);
    // Menyimpan ID event yang sudah pernah dipicu reward-nya. Reset saat game restart.
    const triggeredEventsRef = useRef({});
    const isReturningToMainMapRef = useRef(false); // Flag untuk mencegah multiple travel actions

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
        // Panggil trigger event untuk lokasi awal (MainMap)
        // Pastikan initial player state sudah lengkap saat ini
        triggerLocationEvent('MainMap', { ...player, name: playerNameInput.trim() || 'Player' });
    }, [player]); // player sebagai dependency untuk mendapatkan initial player state yang lengkap

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
            // Setiap collectible meningkatkan kebahagiaan setiap jam
            if (collectibles.length > 0) {
                newPlayer.happiness = Math.min(100, newPlayer.happiness + (collectibles.length * 1));
            }

            return newPlayer;
        });
    }, []);

    const triggerLocationEvent = useCallback((location, currentPlayerState) => {
        console.log(`%c[triggerLocationEvent] Checking events for location: ${location}`, 'color: purple;');

        // Jika ada event yang sedang aktif dan bukan event yang sama dengan lokasi saat ini, reset.
        // Ini mencegah event dari lokasi lama tetap aktif setelah pindah.
        if (currentEvent && currentEvent.triggerLocation !== location) {
            console.log(`%c[triggerLocationEvent] Clearing old event (ID: ${currentEvent.id}) because location changed from ${currentEvent.triggerLocation} to ${location}.`, 'color: orange;');
            setShowEventPopup(false);
            setCurrentEvent(null); // Penting untuk mengosongkan currentEvent
        }

        const potentialEvents = LOCATION_EVENTS[location];
        if (potentialEvents && potentialEvents.length > 0) {
            const availableEvents = potentialEvents.filter(event =>
                !triggeredEventsRef.current[event.id] && (!event.condition || event.condition(currentPlayerState))
            );

            if (availableEvents.length > 0) {
                const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
                console.log(`%c[triggerLocationEvent] Found new event for ${location}: ${randomEvent.id}`, 'color: green;');
                // Simpan event yang terpilih, dan tambahkan properti triggerLocation
                setCurrentEvent({ ...randomEvent, triggerLocation: location });
                setShowEventPopup(true);
            } else {
                console.log(`%c[triggerLocationEvent] No new available events for ${location}.`, 'color: gray;');
                setCurrentEvent(null); // Penting: reset currentEvent jika tidak ada event baru
                setShowEventPopup(false);
            }
        } else {
            console.log(`%c[triggerLocationEvent] No potential events defined for ${location}.`, 'color: gray;');
            setCurrentEvent(null); // Penting: reset currentEvent jika tidak ada event potensial
            setShowEventPopup(false);
        }
    }, [currentEvent]); // currentEvent perlu ada di dependency list karena dipakai di awal fungsi

    const applyEventRewards = useCallback(() => {
        console.log("%c--- ENTERING applyEventRewards ---", 'background: #222; color: #bada55');
        if (currentEvent && currentEvent.rewards) {
            console.log(`%cApplying rewards for event ID: ${currentEvent.id}`, 'color: blue;');
            console.log("Event details:", currentEvent);
            console.log("Rewards to apply:", currentEvent.rewards);

            setPlayer(prevPlayer => {
                console.log("Player state BEFORE rewards application:", { ...prevPlayer });

                let newPlayer = { ...prevPlayer };
                const rewards = currentEvent.rewards;

                if (rewards.happiness !== undefined) {
                    newPlayer.happiness = Math.min(100, Math.max(0, prevPlayer.happiness + rewards.happiness));
                    console.log(`  - Applied Happiness: ${rewards.happiness} (new: ${newPlayer.happiness})`);
                }
                if (rewards.energy !== undefined) {
                    newPlayer.energy = Math.min(100, Math.max(0, prevPlayer.energy + rewards.energy));
                    console.log(`  - Applied Energy: ${rewards.energy} (new: ${newPlayer.energy})`);
                }
                if (rewards.hunger !== undefined) {
                    // Jika rewards.hunger bernilai positif, berarti itu menambahkan hunger (mengurangi rasa lapar)
                    // Jika rewards.hunger bernilai negatif, berarti mengurangi hunger (menambah rasa lapar)
                    newPlayer.hunger = Math.min(100, Math.max(0, prevPlayer.hunger + rewards.hunger));
                    console.log(`  - Applied Hunger: ${rewards.hunger} (new: ${newPlayer.hunger})`);
                }
                if (rewards.hygiene !== undefined) {
                    newPlayer.hygiene = Math.min(100, Math.max(0, prevPlayer.hygiene + rewards.hygiene));
                    console.log(`  - Applied Hygiene: ${rewards.hygiene} (new: ${newPlayer.hygiene})`);
                }
                if (rewards.money !== undefined) {
                    newPlayer.money = prevPlayer.money + rewards.money;
                    console.log(`  - Applied Money: ${rewards.money.toLocaleString()} (new: ${newPlayer.money.toLocaleString()})`);
                }

                if (rewards.inventory) {
                    newPlayer.inventory = { ...prevPlayer.inventory };
                    console.log("  - Applying Inventory Rewards:");
                    Object.entries(rewards.inventory).forEach(([item, data]) => {
                        const currentStock = newPlayer.inventory[item]?.stock || 0;
                        const newStock = currentStock + data.stock;
                        newPlayer.inventory[item] = {
                            ...newPlayer.inventory[item],
                            type: data.type || 'unknown',
                            stock: newStock
                        };
                        console.log(`    - Item: ${item}, Old Stock: ${currentStock}, New Stock: ${newStock}`);
                    });
                }

                console.log("Player state AFTER rewards calculation:", { ...newPlayer });
                return newPlayer;
            });

            // Tandai event ini sudah dipicu reward-nya SETELAH reward diterapkan
            triggeredEventsRef.current = { ...triggeredEventsRef.current, [currentEvent.id]: true };
            console.log(`%cEvent marked as triggered in triggeredEventsRef: ${currentEvent.id}`, 'color: brown;');

            setShowEventPopup(false);
            setCurrentEvent(null); // Clear current event after rewards applied
            console.log("%cEvent popup closed and currentEvent state cleared.", 'color: blue;');

        } else {
            console.warn("%capplyEventRewards called but currentEvent or currentEvent.rewards is missing or null.", 'color: red;', { currentEvent });
        }
        console.log("%c--- EXITTING applyEventRewards ---", 'background: #222; color: #bada55');
    }, [currentEvent]); // currentEvent adalah dependency karena kita membaca propertinya

    const handleMove = useCallback((direction) => {
        if (isActivityAnimating) return; // Tidak bisa bergerak saat animasi aktivitas berjalan
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
            energy: Math.max(0, prevPlayer.energy - 1) // Mengurangi energy setiap kali bergerak
        }));

        setIsWalking(true);
        if (walkTimeout.current) clearTimeout(walkTimeout.current);
        walkTimeout.current = setTimeout(() => setIsWalking(false), 300);

    }, [player.energy, avatarPosition, isActivityAnimating]);

    const handleBackToMainMap = useCallback(() => {
        if (isActivityAnimating) return;
        if (isReturningToMainMapRef.current) return; // Mencegah pemanggilan ganda

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

        isReturningToMainMapRef.current = true; // Set flag

        // Clear event popup saat bepergian ke MainMap
        setShowEventPopup(false);
        setCurrentEvent(null); // Clear current event saat melakukan perjalanan

        const performBackToMainMapEffect = (prevPlayer) => {
            if (prevPlayer.location === 'MainMap') { // Jika sudah di MainMap, tidak perlu efek travel
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
        console.log(`%c[handleBackToMainMap] Starting travel to MainMap. Pending activity: ${pendingActivity.current.activityName}`, 'color: lightblue;');

        activityTimeoutRef.current = setTimeout(() => {
            setIsActivityAnimating(false);
            setCurrentActivityGif(null);
            if (pendingActivity.current) {
                const { activityName: completedActivityName, effectToApply: completedEffect, alertMessage: finalAlertMessage, isLocationChange: isCompletedLocationChange } = pendingActivity.current;

                let finalPlayerStateAfterEffect = null; // Variable to hold the player state after applying effects

                if (completedEffect) {
                    setPlayer(prevPlayer => {
                        const updatedPlayer = completedEffect(prevPlayer);
                        finalPlayerStateAfterEffect = updatedPlayer; // Capture the updated state
                        if (isCompletedLocationChange && updatedPlayer.location !== prevPlayer.location) {
                            setAvatarPosition({ x: 50, y: 50 });
                            // Trigger event for the new location (MainMap)
                            triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                        }
                        return updatedPlayer;
                    });
                }
                if (finalAlertMessage) alert(finalAlertMessage);

                // Setelah efek diterapkan dan state player diperbarui, baru lakukan pengecekan event
                // Pastikan menggunakan state player yang paling baru atau yang sudah di-update
                const locationForEventCheck = finalPlayerStateAfterEffect ? finalPlayerStateAfterEffect.location : player.location;
                console.log(`%c[handleBackToMainMap] Activity completed: ${completedActivityName}. Location for event check: ${locationForEventCheck}`, 'color: lightblue;');


                // Event check logic remains the same, but now uses the correct `locationForEventCheck`
                // Logika ini untuk memastikan event reward DITERAPKAN jika kondisi terpenuhi
                if (currentEvent && // Pastikan ada event yang aktif
                    currentEvent.requiredActivity === completedActivityName && // Aktivitas yang selesai cocok
                    !triggeredEventsRef.current[currentEvent.id] && // Event belum pernah dipicu rewardnya
                    currentEvent.location === locationForEventCheck // Lokasi event cocok dengan lokasi pemain saat ini
                ) {
                    console.log("%c[handleBackToMainMap] Conditions met for applyEventRewards after returning to MainMap.", 'color: green;');
                    applyEventRewards();
                } else if (currentEvent) {
                    console.log("%c[handleBackToMainMap] Event conditions NOT met or event already triggered after returning to MainMap. Details:", 'color: orange;');
                    console.log("  - currentEvent ID:", currentEvent.id);
                    console.log("  - currentEvent.requiredActivity:", currentEvent.requiredActivity, "vs completedActivityName:", completedActivityName);
                    console.log("  - !triggeredEventsRef.current[currentEvent.id]:", !triggeredEventsRef.current[currentEvent.id]);
                    console.log("  - currentEvent.location:", currentEvent.location, "vs locationForEventCheck:", locationForEventCheck);

                    // Jika event yang sedang aktif tidak relevan dengan lokasi saat ini (misal event Home tapi player di MainMap)
                    // atau event yang aktif bukan event yang memerlukan aktivitas yang baru saja diselesaikan.
                    if (currentEvent.location !== locationForEventCheck) {
                        console.log("%c[handleBackToMainMap] Clearing current event because player's location doesn't match event's trigger location.", 'color: orange;');
                        setCurrentEvent(null);
                        setShowEventPopup(false);
                    }
                }

                isReturningToMainMapRef.current = false; // Reset flag
                pendingActivity.current = null;
            }
        }, 7000); // Durasi travel
    }, [player, setPlayer, triggerLocationEvent, isActivityAnimating, currentEvent, applyEventRewards]);


    const handleActivity = useCallback((activityName, duration = 7000) => {
        if (isActivityAnimating) return; // Mencegah aktivitas ganda

        // --- TAMBAH LOG INI DI SINI ---
        console.log(`%c[handleActivity] Starting activity: ${activityName}`, 'color: lightblue;');
        console.log(`%c[handleActivity] Current event state before activity:`, 'color: lightblue;', currentEvent);
        console.log(`%c[handleActivity] Player location before activity: ${player.location}`, 'color: lightblue;');
        // --- END TAMBAH LOG ---

        let alertMessage = "";
        let activityCostMet = true;
        let effectToApply = null;
        let isLocationChangeActivity = false;

        // Simpan lokasi saat aktivitas dimulai untuk referensi event
        const initialPlayerLocation = player.location; // Ini digunakan untuk event-check jika tidak ada perubahan lokasi

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
                    if (availableConsumableItems.length > 0) { itemToUse = availableConsumableItems[0]; } // Gunakan item pertama jika ada
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
            // ... di dalam fungsi handleActivity ...

case 'Swim':
    const swimEnergyCost = 20;
    const swimHygieneCost = 10;
    if (player.location !== 'Beach') {
        alertMessage = `You can only swim at the Beach!`;
        activityCostMet = false;
    } else if (player.energy < swimEnergyCost) {
        alertMessage = `You don't have enough energy (${swimEnergyCost}) to swim!`;
        activityCostMet = false;
    } else {
        effectToApply = (prevPlayer) => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 25),
            energy: Math.max(0, prevPlayer.energy - swimEnergyCost),
            hygiene: Math.max(0, prevPlayer.hygiene - swimHygieneCost),
        });

        // Event: Ocean Treasure (memberikan Seashell, Money, Happiness)
        if (currentEvent && currentEvent.id === 'beach_treasure' && !triggeredEventsRef.current['beach_treasure']) {
            alertMessage = "The waves kissed your feet. Suddenly, your eyes caught a glimmer at the bottom of the sea! You gained +20 Happiness, +Rp300,000 Money, and found a Seashell!";
        } else {
            // Pesan default jika tidak ada event yang terpicu atau event sudah selesai
            alertMessage = `You swam at ${player.location}. +25 Happiness, -${swimEnergyCost} Energy, -${swimHygieneCost} Hygiene.`;
        }
    }
    break;

case 'Fishing':
    const fishEnergyCost = 20;
    const fishHygieneCost = 10;
    if (player.location !== 'Lake') {
        alertMessage = `You can only fish at the Lake!`;
        activityCostMet = false;
    } else if (player.energy < fishEnergyCost) {
        alertMessage = `You don't have enough energy (${fishEnergyCost}) to fish!`;
        activityCostMet = false;
    } else {
        effectToApply = (prevPlayer) => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 25),
            energy: Math.max(0, prevPlayer.energy - fishEnergyCost),
            hygiene: Math.max(0, prevPlayer.hygiene - fishHygieneCost),
            inventory: { ...prevPlayer.inventory, 'Fish': { type: 'food', stock: (prevPlayer.inventory['Fish']?.stock || 0) + 1 } }
        });

        // Event: Legendary Catch (memberikan Freshwater Fish, Happiness, Hunger)
        if (currentEvent && currentEvent.id === 'legendary_catch' && !triggeredEventsRef.current['legendary_catch']) {
            alertMessage = `You spent time fishing at the lake. The sun set, and you successfully caught a fish! You gained +18 Happiness, +15 Hunger, and gained a Freshwater Fish!`;
        } else {
            // Pesan default jika tidak ada event yang terpicu atau event sudah selesai
            alertMessage = `You fished at ${player.location}. +25 Happiness, -${fishEnergyCost} Energy, -${fishHygieneCost} Hygiene, +1 Fish.`;
        }
    }
    break;

case 'Hike':
    const hikeEnergyCost = 25;
    const hikeHungerCost = 15;
    if (player.location !== 'Mountain') {
        alertMessage = `You can only hike in the Mountains!`;
        activityCostMet = false;
    } else if (player.energy < hikeEnergyCost) {
        alertMessage = `You don't have enough energy (${hikeEnergyCost}) to hike!`;
        activityCostMet = false;
    } else {
        effectToApply = (prevPlayer) => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30),
            energy: Math.max(0, prevPlayer.energy - hikeEnergyCost),
            hunger: Math.max(0, prevPlayer.hunger - hikeHungerCost),
        });

        // Event: Mountain Herb Discovery (memberikan Mountain Herb)
        if (currentEvent && currentEvent.id === 'mountain_herb_discovery' && !triggeredEventsRef.current['mountain_herb_discovery']) {
            alertMessage = "Your mountain journey brought a blessing! Besides enjoying the view (+30 Happiness, -10 Energy, -5 Hygiene), you stumbled upon a Mountain Herb never seen before!";
        } else {
            // Pesan default jika tidak ada event yang terpicu atau event sudah selesai
            alertMessage = `You hiked in the Mountains. +30 Happiness, -${hikeEnergyCost} Energy, -${hikeHungerCost} Hunger.`;
        }
    }
    break;

case 'Sleep':
    const sleepEnergyGain = 50;
    if (player.location !== 'Home') {
        alertMessage = "You can only sleep at home!";
        activityCostMet = false;
    } else {
        effectToApply = (prevPlayer) => {
            setGameTime(prevTime => {
                let newHour = prevTime.hour + 6;
                let newDay = prevTime.day;
                if (newHour >= 24) { newDay += Math.floor(newHour / 24); newHour %= 24; }
                return { ...prevTime, hour: newHour, minute: 0, day: newDay };
            });
            return { ...prevPlayer, energy: Math.min(100, prevPlayer.energy + sleepEnergyGain) };
        };

        // Event: Sweet Dreams (memberikan Happiness, Energy, Passport)
        if (currentEvent && currentEvent.id === 'sweet_dreams' && !triggeredEventsRef.current['sweet_dreams']) {
            alertMessage = "Sweet dreams found you! A deep sleep restored +15 Happiness, +10 Energy and you found a Passport!";
        } else {
            // Pesan default jika tidak ada event yang terpicu atau event sudah selesai
            alertMessage = "You slept. +50 Energy, 6 hours passed.";
        }
    }
    break;

case 'Pray':
    const prayEnergyCost = 10;
    if (player.location !== 'Temple') {
        alertMessage = "You can only pray at the Temple!";
        activityCostMet = false;
    } else if (player.energy < prayEnergyCost) {
        alertMessage = `You don't have enough energy (${prayEnergyCost}) to pray!`;
        activityCostMet = false;
    } else {
        let happinessBonus = 0;
        let energyBonus = 0;
        if (player.inventory['Meditation Guide'] && player.inventory['Meditation Guide'].stock > 0) {
            if (NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide']?.activityBonus?.['Pray']) {
                happinessBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].happiness || 0;
                energyBonus = NON_CONSUMABLE_ITEM_EFFECTS['Meditation Guide'].activityBonus['Pray'].energy || 0;
            }
        }
        effectToApply = (prevPlayer) => ({
            ...prevPlayer,
            happiness: Math.min(100, prevPlayer.happiness + 30 + happinessBonus),
            energy: Math.min(100, prevPlayer.energy - prayEnergyCost + energyBonus),
        });

        // Event: Temple Reflection (memberikan Happiness, Energy, Meditation Guide)
        if (currentEvent && currentEvent.id === 'temple_reflection' && !triggeredEventsRef.current['temple_reflection']) {
            alertMessage = `Your prayers are answered! Your spirit feels enlightened. You gained +25 Happiness, +15 Energy, and found a Meditation Guide! You feel deeply refreshed!`;
        } else {
            // Pesan default jika tidak ada event yang terpicu atau event sudah selesai
            alertMessage = `You prayed at the Temple. +${30 + happinessBonus} Happiness, -${prayEnergyCost - energyBonus} Energy.${happinessBonus > 0 || energyBonus > 0 ? ' (Meditation Guide blessing!)' : ''}`;
        }
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
                    const travelMoneyCost = 250000;
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
            // Simpan lokasi awal pemain di pendingActivity
            pendingActivity.current = { activityName, effectToApply, alertMessage, isLocationChange: isLocationChangeActivity, initialPlayerLocation: player.location };
            console.log(`%c[handleActivity] Starting animation for: ${activityName} from ${player.location}.`, 'color: lightblue;');


            activityTimeoutRef.current = setTimeout(() => {
                if (pendingActivity.current) {
                    const { activityName: completedActivityName, effectToApply: completedEffect, alertMessage: finalAlertMessage, isLocationChange: isCompletedLocationChange, initialPlayerLocation } = pendingActivity.current;

                    let finalPlayerStateAfterEffect = null; // Variabel untuk menyimpan state player setelah effectToApply

                    if (completedEffect) {
                        setPlayer(prevPlayer => {
                            const updatedPlayer = completedEffect(prevPlayer);
                            finalPlayerStateAfterEffect = updatedPlayer; // Tangkap state yang sudah diupdate
                            // Logika untuk perubahan lokasi setelah efek diterapkan
                            if (isCompletedLocationChange && updatedPlayer.location !== prevPlayer.location) {
                                setAvatarPosition({ x: 50, y: 50 });
                                // **Penting:** Clear event sebelumnya HANYA JIKA lokasi berubah.
                                // Jika lokasi tidak berubah, kita ingin `currentEvent` tetap ada untuk pengecekan reward.
                                // Jika lokasi berubah, kita harus memicu event baru di lokasi baru.
                                setCurrentEvent(null);
                                setShowEventPopup(false);
                                // Trigger event for the NEW location (updatedPlayer.location)
                                triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                            }
                            return updatedPlayer;
                        });
                    }
                    if (finalAlertMessage) alert(finalAlertMessage);

                    console.log(`%c[handleActivity] Activity completed: ${completedActivityName}`, 'color: blue;');
                    console.log(`%c[handleActivity] currentEvent state after activity completion (before final check):`, 'color: blue;', currentEvent);


                    // Tentukan lokasi yang akan digunakan untuk pengecekan event.
                    // Jika aktivitas adalah perubahan lokasi, gunakan lokasi BARU (dari finalPlayerStateAfterEffect).
                    // Jika bukan perubahan lokasi, gunakan lokasi pemain SAAT INI (yang sudah diupdate oleh setPlayer),
                    // atau gunakan initialPlayerLocation jika tidak ada perubahan lokasi.
                    const locationForEventCheck = finalPlayerStateAfterEffect ? finalPlayerStateAfterEffect.location : initialPlayerLocation;
                    console.log(`%c[handleActivity] Location for event check: ${locationForEventCheck}. Initial activity location: ${initialPlayerLocation}`, 'color: blue;');


                    // Pengecekan event reward:
                    // currentEvent harus ada, aktivitas yang selesai cocok, event belum dipicu rewardnya,
                    // DAN lokasi event (tempat event itu muncul) cocok dengan lokasi pemain saat ini.
                    if (currentEvent &&
                        currentEvent.requiredActivity === completedActivityName &&
                        !triggeredEventsRef.current[currentEvent.id] &&
                        currentEvent.location === locationForEventCheck // Pastikan lokasi event match dengan lokasi pemain saat ini
                    ) {
                        console.log("%c[handleActivity] Event conditions met. Calling applyEventRewards.", 'background: #00FF00; color: black;');
                        applyEventRewards();
                    } else if (currentEvent) {
                        console.log("%c[handleActivity] Event conditions NOT met or event already triggered. Details:", 'color: orange;');
                        console.log("  - currentEvent ID:", currentEvent.id);
                        console.log("  - currentEvent.requiredActivity:", currentEvent.requiredActivity, "vs completedActivityName:", completedActivityName);
                        console.log("  - !triggeredEventsRef.current[currentEvent.id]:", !triggeredEventsRef.current[currentEvent.id]);
                        console.log("  - currentEvent.location:", currentEvent.location, "vs locationForEventCheck:", locationForEventCheck);

                        // Jika event yang sedang aktif tidak relevan dengan lokasi saat ini (misal event Home tapi player di Temple)
                        // atau event yang aktif bukan event yang memerlukan aktivitas yang baru saja diselesaikan.
                        if (currentEvent.location !== locationForEventCheck) {
                            console.log("%c[handleActivity] Clearing current event because player's location doesn't match event's trigger location.", 'color: orange;');
                            setCurrentEvent(null);
                            setShowEventPopup(false);
                        }
                    }

                    pendingActivity.current = null;
                }
                setIsActivityAnimating(false);
                setCurrentActivityGif(null);
            }, duration);
        } else { // No GIF, immediate effect
            let finalPlayerStateAfterEffect = null;
            if (effectToApply) {
                setPlayer(prevPlayer => {
                    const updatedPlayer = effectToApply(prevPlayer);
                    finalPlayerStateAfterEffect = updatedPlayer;
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

            const locationForEventCheck = finalPlayerStateAfterEffect ? finalPlayerStateAfterEffect.location : initialPlayerLocation;
            console.log(`%c[handleActivity - No GIF] Activity completed: ${activityName}. Location for event check: ${locationForEventCheck}`, 'color: blue;');

            if (currentEvent &&
                currentEvent.requiredActivity === activityName &&
                !triggeredEventsRef.current[currentEvent.id] &&
                currentEvent.location === locationForEventCheck
            ) {
                console.log("%c[handleActivity - No GIF] Event conditions met. Calling applyEventRewards.", 'background: #00FF00; color: black;');
                applyEventRewards();
            } else if (currentEvent) {
                console.log("%c[handleActivity - No GIF] Event conditions NOT met or event already triggered. Details:", 'color: orange;');
                console.log("  - currentEvent ID:", currentEvent.id);
                console.log("  - currentEvent.requiredActivity:", currentEvent.requiredActivity, "vs activityName:", activityName);
                console.log("  - !triggeredEventsRef.current[currentEvent.id]:", !triggeredEventsRef.current[currentEvent.id]);
                console.log("  - currentEvent.location:", currentEvent.location, "vs locationForEventCheck:", locationForEventCheck);

                if (currentEvent.location !== locationForEventCheck) {
                    console.log("%c[handleActivity - No GIF] Clearing current event because player's location doesn't match event's trigger location.", 'color: orange;');
                    setCurrentEvent(null);
                    setShowEventPopup(false);
                }
            }
        }
    }, [player, currentEvent, applyEventRewards, triggerLocationEvent, isActivityAnimating]);


    const handleFastForward = useCallback(() => {
        console.log("%c[handleFastForward] Initiated Fast Forward.", 'color: #8A2BE2;');
        if (isActivityAnimating) {
            if (activityTimeoutRef.current) {
                clearTimeout(activityTimeoutRef.current);
                console.log("%c[handleFastForward] Cleared activity timeout.", 'color: #8A2BE2;');
            }
            setIsActivityAnimating(false);
            setCurrentActivityGif(null);
            console.log("%c[handleFastForward] Animation stopped, GIF cleared.", 'color: #8A2BE2;');


            if (pendingActivity.current) {
                const { activityName: completedActivityName, effectToApply: completedEffect, alertMessage: finalAlertMessage, isLocationChange: isCompletedLocationChange, initialPlayerLocation } = pendingActivity.current;
                console.log(`%c[handleFastForward] Processing pending activity: ${completedActivityName}`, 'color: #8A2BE2;');
                console.log(`%c[handleFastForward] Current event state before processing pending activity:`, 'color: #8A2BE2;', currentEvent);

                let finalPlayerStateAfterEffect = null;

                if (completedEffect) {
                    setPlayer(prevPlayer => {
                        const updatedPlayer = completedEffect(prevPlayer);
                        finalPlayerStateAfterEffect = updatedPlayer;
                        if (isCompletedLocationChange && updatedPlayer.location !== prevPlayer.location) {
                            setAvatarPosition({ x: 50, y: 50 });
                            setCurrentEvent(null); // Clear event on travel
                            setShowEventPopup(false);
                            triggerLocationEvent(updatedPlayer.location, updatedPlayer);
                        }
                        return updatedPlayer;
                    });
                    console.log("%c[handleFastForward] Applied pending activity effects.", 'color: #8A2BE2;');
                }

                if (finalAlertMessage) {
                    alert(finalAlertMessage);
                    console.log("%c[handleFastForward] Displayed final alert message.", 'color: #8A2BE2;');
                }

                const locationForEventCheck = finalPlayerStateAfterEffect ? finalPlayerStateAfterEffect.location : initialPlayerLocation;
                console.log(`%c[handleFastForward] Location for event check: ${locationForEventCheck}. Initial: ${initialPlayerLocation}`, 'color: #8A2BE2;');


                // Pengecekan event untuk fast-forward
                if (currentEvent &&
                    currentEvent.requiredActivity === completedActivityName &&
                    !triggeredEventsRef.current[currentEvent.id] &&
                    currentEvent.location === locationForEventCheck
                ) {
                    console.log("%c[handleFastForward] Event conditions met for Fast Forward. Calling applyEventRewards.", 'background: #00FF00; color: black;');
                    applyEventRewards();
                } else if (currentEvent) {
                    console.log("%c[handleFastForward] Event conditions NOT met for Fast Forward. Details:", 'color: orange;');
                    console.log("  - currentEvent ID:", currentEvent.id);
                    console.log("  - currentEvent.requiredActivity:", currentEvent.requiredActivity, "vs completedActivityName:", completedActivityName);
                    console.log("  - !triggeredEventsRef.current[currentEvent.id]:", !triggeredEventsRef.current[currentEvent.id]);
                    console.log("  - currentEvent.location:", currentEvent.location, "vs locationForEventCheck:", locationForEventCheck);

                    if (currentEvent.location !== locationForEventCheck) {
                        console.log("%c[handleFastForward] Clearing current event because player's location doesn't match event's trigger location.", 'color: orange;');
                        setCurrentEvent(null);
                        setShowEventPopup(false);
                    }
                }

                if (completedActivityName === 'Go to MainMap') {
                    isReturningToMainMapRef.current = false;
                    console.log("%c[handleFastForward] Resetting isReturningToMainMapRef.", 'color: #8A2BE2;');
                }

                pendingActivity.current = null;
                console.log("%c[handleFastForward] Cleared pending activity.", 'color: #8A2BE2;');
            }
        }
    }, [isActivityAnimating, currentEvent, applyEventRewards, triggerLocationEvent, player]);

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

                    // Panggil decreasePlayerStatus setiap 6 jam game-time
                    if (hourChanged && (newHour % 6 === 0 || (prevTime.hour === 23 && newHour === 5))) { // Misal jam 0, 6, 12, 18
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
    }, [player]); // Player sebagai dependency agar useEffect ini re-run saat player state berubah

    // --- useEffect untuk Keyboard Event Listener ---
    useEffect(() => {
        let keysPressed = {}; // Untuk melacak tombol yang sedang ditekan

        const handleKeyDown = (event) => {
            // Abaikan input keyboard jika game over, belum pilih avatar, popup event muncul, atau sedang animasi aktivitas
            if (!isAvatarSelected || gameOver || showEventPopup || isActivityAnimating) {
                if (walkTimeout.current) clearTimeout(walkTimeout.current);
                setIsWalking(false);
                return;
            }

            const key = event.key.toLowerCase();
            keysPressed[key] = true; // Tandai tombol ini sedang ditekan

            let direction = null;
            switch (key) {
                case 'arrowup': case 'w': direction = 'up'; break;
                case 'arrowdown': case 's': direction = 'down'; break;
                case 'arrowleft': case 'a': direction = 'left'; break;
                case 'arrowright': case 'd': direction = 'right'; break;
                default: break;
            }

            if (direction) {
                event.preventDefault(); // Mencegah scrolling browser
                handleMove(direction);

                if (!isWalking) {
                    setIsWalking(true); // Mulai animasi jalan
                }
                // Reset timeout untuk menghentikan animasi jalan jika tombol ditahan
                if (walkTimeout.current) {
                    clearTimeout(walkTimeout.current);
                }
                walkTimeout.current = setTimeout(() => {
                    const anyMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => keysPressed[k]);
                    if (!anyMovementKey) { // Jika tidak ada tombol gerakan lain yang ditekan
                        setIsWalking(false); // Hentikan animasi jalan
                    }
                }, 150); // Jeda singkat untuk menentukan apakah tombol masih ditekan
            }
        };

        const handleKeyUp = (event) => {
            const key = event.key.toLowerCase();
            keysPressed[key] = false; // Tandai tombol ini sudah dilepas

            const anyMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
                .some(k => keysPressed[k]);

            if (!anyMovementKey) { // Jika tidak ada tombol gerakan yang sedang ditekan
                if (walkTimeout.current) clearTimeout(walkTimeout.current);
                setIsWalking(false); // Hentikan animasi jalan
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup function
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (walkTimeout.current) clearTimeout(walkTimeout.current);
        };
    }, [isAvatarSelected, gameOver, showEventPopup, handleMove, isWalking, isActivityAnimating]); // Dependencies

    // --- Render ---
    if (gameOver) {
        return (
            <GameOverScreen
                player={player}
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
                            // 'Meditation Guide': { type: 'tool', stock: 1 } // Pastikan ini juga dihapus saat restart game
                        },
                        avatar: null,
                    });
                    setGameTime({ hour: 8, minute: 0, day: 1 });
                    setAvatarPosition({ x: 50, y: 50 });
                    setIsWalking(false);
                    setShowEventPopup(false);
                    setCurrentEvent(null);
                    triggeredEventsRef.current = {}; // Reset triggered events
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
            {/* EventPopup hanya ditampilkan jika showEventPopup true, ada currentEvent, DAN player berada di lokasi pemicu event */}
            {showEventPopup && currentEvent && currentEvent.location === player.location && (
                <EventPopup
                    event={currentEvent}
                    onClose={() => {
                        console.log(`%c[EventPopup.onClose] Closing popup for event ID: ${currentEvent?.id}`, 'color: orange;');
                        // Tidak perlu menandai event sebagai triggered di sini.
                        // Penandaan dilakukan di applyEventRewards SETELAH aktivitas selesai.
                        setShowEventPopup(false);
                        // Kritis: currentEvent TIDAK di-null-kan di sini.
                        // currentEvent tetap ada di state agar handleActivity bisa merujuknya
                        // untuk penerapan reward nanti. Ia akan di-null-kan di applyEventRewards.
                        console.log(`%c[EventPopup.onClose] currentEvent state after closing popup:`, 'color: orange;', currentEvent);
                    }}
                />
            )}
        </div>
    );
};

export default App;