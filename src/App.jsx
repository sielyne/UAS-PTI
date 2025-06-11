import React, { useState, useEffect } from 'react';

// Components
const AvatarSelection = ({ onAvatarSelect, onStartGame }) => {
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [playerName, setPlayerName] = useState('');

  const avatars = [
    { name: 'Ayam', src: '/assets/ayam ygy.png' },
    { name: 'Bebek', src: '/assets/bebek ygy.png' },
    { name: 'Capybara', src: '/assets/capi ygy.png' }
  ];

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.src);
    onAvatarSelect(avatar.src);
  };

  const handleStartGame = () => {
    onStartGame(playerName);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#2c3e50',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        Ucup The Explorer
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
          Enter Your Name:
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{
            padding: '0.8rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            width: '300px',
            textAlign: 'center'
          }}
          placeholder="Your name here..."
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Choose Your Avatar:</h2>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          {avatars.map((avatar) => (
            <div
              key={avatar.name}
              onClick={() => handleAvatarSelect(avatar)}
              style={{
                cursor: 'pointer',
                padding: '1rem',
                border: selectedAvatar === avatar.src ? '3px solid #3498db' : '3px solid transparent',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                transform: selectedAvatar === avatar.src ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <img
                src={avatar.src}
                alt={avatar.name}
                style={{ width: '100px', height: '100px', display: 'block' }}
              />
              <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{avatar.name}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleStartGame}
        disabled={!selectedAvatar || !playerName.trim()}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: !selectedAvatar || !playerName.trim() ? '#7f8c8d' : '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: !selectedAvatar || !playerName.trim() ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease'
        }}
      >
        Start Game
      </button>
    </div>
  );
};

const Status = ({ player, gameTime }) => {
  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (value) => {
    if (value >= 70) return '#27ae60';
    if (value >= 40) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#34495e',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>
        <h3 style={{ margin: 0 }}>{player.name}</h3>
        <p style={{ margin: '0.2rem 0' }}>Location: {player.location}</p>
        <p style={{ margin: '0.2rem 0' }}>Money: Rp{player.money.toLocaleString()}</p>
      </div>
      
      <div>
        <p style={{ margin: '0.2rem 0' }}>Day {gameTime.day}</p>
        <p style={{ margin: '0.2rem 0' }}>{formatTime(gameTime.hour, gameTime.minute)}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {[
          { label: 'Happiness', value: player.happiness },
          { label: 'Hunger', value: player.hunger },
          { label: 'Hygiene', value: player.hygiene },
          { label: 'Energy', value: player.energy }
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem' }}>{stat.label}</div>
            <div style={{
              width: '50px',
              height: '8px',
              backgroundColor: '#2c3e50',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stat.value}%`,
                height: '100%',
                backgroundColor: getStatusColor(stat.value),
                transition: 'all 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.8rem' }}>{stat.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Joystick = ({ onMove }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '2rem',
      zIndex: 1000
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '0.5rem',
        width: '120px',
        height: '120px'
      }}>
        <div></div>
        <button
          onClick={() => onMove('up')}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          ↑
        </button>
        <div></div>
        
        <button
          onClick={() => onMove('left')}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          ←
        </button>
        <div></div>
        <button
          onClick={() => onMove('right')}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          →
        </button>
        
        <div></div>
        <button
          onClick={() => onMove('down')}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );
};

const GameInterface = ({ player, avatarPosition }) => {
  const getLocationImage = (location) => {
    switch (location) {
      case 'Home': return '/assets/HomeMap.png';
      case 'Mountain': return '/assets/MountainMap.png';
      case 'Lake': return '/assets/LakeMap.png';
      case 'Beach': return '/assets/BeachMap.png';
      case 'Temple': return '/assets/TempleMap.png';
      case 'MainMap':
      default: return '/assets/MainMap.jpg';
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '70vh',
      overflow: 'hidden',
      backgroundColor: '#2c3e50'
    }}>
      <img
        src={getLocationImage(player.location)}
        alt={`Map of ${player.location}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      <div style={{
        position: 'absolute',
        left: `${avatarPosition.x}%`,
        top: `${avatarPosition.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s ease',
        zIndex: 10
      }}>
        <img
          src={player.avatar}
          alt="Player Avatar"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid #f39c12',
            backgroundColor: 'rgba(255,255,255,0.8)'
          }}
        />
      </div>
    </div>
  );
};

const ActivityDetails = ({ location, onActivity }) => {
  const getActivitiesForLocation = (location) => {
    const commonActivities = ['Work'];
    
    switch (location) {
      case 'Home':
        return [...commonActivities, 'Eat', 'Sleep', 'Take a Bath'];
      case 'Beach':
        return [...commonActivities, 'Eat', 'Play', 'Buy Souvenir', 'Explore'];
      case 'Lake':
        return [...commonActivities, 'Eat', 'Play', 'Buy Souvenir', 'Explore'];
      case 'Mountain':
        return [...commonActivities, 'Eat', 'Play', 'Buy Souvenir', 'Explore'];
      case 'Temple':
        return [...commonActivities, 'Eat', 'Pray', 'Buy Souvenir', 'Explore'];
      default:
        return commonActivities;
    }
  };

  const activities = getActivitiesForLocation(location);

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '2rem',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(52, 73, 94, 0.95)',
      color: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      minWidth: '200px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
        Activities at {location}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {activities.map((activity) => (
          <button
            key={activity}
            onClick={() => onActivity(activity)}
            style={{
              padding: '0.8rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              fontSize: '0.9rem'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            {activity}
          </button>
        ))}
      </div>
    </div>
  );
};

const Inventory = ({ playerInventory, playerMoney }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      backgroundColor: 'rgba(52, 73, 94, 0.95)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      minWidth: '200px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h4 style={{ margin: '0 0 1rem 0' }}>Inventory</h4>
      <p style={{ margin: '0.5rem 0' }}>Money: Rp{playerMoney.toLocaleString()}</p>
      {Object.entries(playerInventory).map(([item, details]) => (
        <div key={item} style={{ margin: '0.5rem 0' }}>
          {item}: {details.stock}
        </div>
      ))}
    </div>
  );
};

const GameOverScreen = ({ player, onRestart }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      zIndex: 2000
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#e74c3c' }}>Game Over!</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        {player.name}, your journey has ended.
      </p>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Final Money: Rp{player.money.toLocaleString()}
      </p>
      <button
        onClick={onRestart}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Play Again
      </button>
    </div>
  );
};

// Main App Component
const App = () => {
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

  // Define area boundaries for each map
  const mapAreas = {
    MainMap: {
      Home: { x: [10, 30], y: [10, 30] },
      Mountain: { x: [40, 60], y: [10, 30] },
      Lake: { x: [70, 90], y: [10, 30] },
      Beach: { x: [70, 90], y: [70, 90] },
      Temple: { x: [40, 60], y: [70, 90] }
    }
  };

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
          newMinute %= 60;

          if (Math.floor(prevTime.hour / 6) !== Math.floor(newHour / 6)) {
            decreasePlayerStatus();
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
  };

  const checkAreaTransition = (newX, newY) => {
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
          return true;
        }
      }
    }
    return false;
  };

  const handleMove = (direction) => {
    if (player.energy < 5) {
      alert("You don't have enough energy to move!");
      return;
    }

    const moveDistance = 5;
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
    }

    // Check for area transitions
    if (!checkAreaTransition(newX, newY)) {
      setAvatarPosition({ x: newX, y: newY });
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        energy: Math.max(0, prevPlayer.energy - 1)
      }));
    }
  };

  const handleBackToMainMap = () => {
    setPlayer(prevPlayer => ({ ...prevPlayer, location: 'MainMap' }));
    setAvatarPosition({ x: 50, y: 50 });
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
          if (player.inventory['Daging']?.stock > 0) {
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
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#2c3e50' }}>
      {!gameStarted && (
        <AvatarSelection onAvatarSelect={selectAvatar} onStartGame={startGame} />
      )}

      {gameStarted && !gameOver && (
        <div>
          <Status player={player} gameTime={gameTime} />
          <GameInterface player={player} avatarPosition={avatarPosition} />
          <Joystick onMove={handleMove} />
          <ActivityDetails location={player.location} onActivity={handleActivity} />
          <Inventory playerInventory={player.inventory} playerMoney={player.money} />
          
          {player.location !== 'MainMap' && (
            <button
              onClick={handleBackToMainMap}
              style={{
                position: 'fixed',
                top: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '0.8rem 1.5rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                zIndex: 1000,
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              Back to Main Map
            </button>
          )}
        </div>
      )}

      {gameOver && <GameOverScreen player={player} onRestart={restartGame} />}
    </div>
  );
};

export default App;
