// src/components/Inventory.jsx
import React from 'react';
import '../styles/Inventory.css';

const Inventory = ({ playerInventory, playerMoney }) => {
  return (
    <div className="inventory-container">
      <h4 className="inventory-title">Inventory</h4>
      
      {/* PENTING: Div ini harus ada untuk konten yang bisa di-scroll */}
      <div className="inventory-items-list">
        {Object.entries(playerInventory).length === 0 ? (
          <p className="inventory-empty-message">Inventory is empty.</p>
        ) : (
          Object.entries(playerInventory).map(([item, details]) => (
            <div key={item} className="inventory-item">
              <span className="item-name">{item}</span>
              <span className="item-stock">{details.stock}</span>
            </div>
          ))
        )}
      </div>
      
      {/* Ini harus di luar inventory-items-list, agar tidak ikut di-scroll */}
      <p className="inventory-money">Money: Rp{playerMoney.toLocaleString()}</p>
    </div>
  );
};

export default Inventory;