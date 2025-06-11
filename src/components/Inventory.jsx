import React from 'react';
import '../styles/Inventory.css'; // Import CSS file

const Inventory = ({ playerInventory, playerMoney }) => {
  return (
    <div className="inventory-container">
      <h4 className="inventory-title">Inventory</h4>
      <p className="inventory-money">Money: Rp{playerMoney.toLocaleString()}</p>
      {Object.entries(playerInventory).map(([item, details]) => (
        <div key={item} className="inventory-item">
          {item}: {details.stock}
        </div>
      ))}
    </div>
  );
};

export default Inventory;