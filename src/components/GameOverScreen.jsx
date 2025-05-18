import React, { useEffect, useState } from 'react';
import gmvrCapy from '../gmvr_capy.gif';
import gmvrDuck from '../gmvr_duck.gif';
import gmvrChick from '../gmvr_chick.gif';

const GameOverScreen = ({ player, onRestart }) => {
  const [avatarKey, setAvatarKey] = useState('');

  useEffect(() => {
    if (player.avatar.includes('ayam')) setAvatarKey('chick');
    else if (player.avatar.includes('bebek')) setAvatarKey('duck');
    else if (player.avatar.includes('capi')) setAvatarKey('capy');
  }, [player.avatar]);

  return (
    <div id="game-over-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={gmvrCapy} alt="Game Over Capy" style={{ display: avatarKey === 'capy' ? 'block' : 'none' }} />
      <img src={gmvrDuck} alt="Game Over Duck" style={{ display: avatarKey === 'duck' ? 'block' : 'none' }} />
      <img src={gmvrChick} alt="Game Over Chick" style={{ display: avatarKey === 'chick' ? 'block' : 'none' }} />
      <h2>Game Over</h2>
      <button onClick={onRestart}>Restart Game</button>
    </div>
  );
};

export default GameOverScreen;