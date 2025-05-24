// src/components/Inventory.jsx
import React from 'react';
import '../styles/Inventory.css'; // Akan kita buat file CSS ini

const Inventory = ({ playerInventory, playerMoney }) => {
  // Fungsi untuk memformat uang ke Rupiah
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div id="inventory-container">
      <h3>Inventaris</h3>
      <div className="inventory-section">
        <h4>Uang:</h4>
        <p className="inventory-item">
          <span className="item-label">{formatMoney(playerMoney)}</span>
        </p>
      </div>

      <div className="inventory-section">
        <h4>Barang:</h4>
        <ul className="item-list">
          {Object.entries(playerInventory).map(([itemName, itemDetails]) => (
            <li key={itemName} className="inventory-item">
              <span className="item-label">{itemName}:</span> {itemDetails.stock}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Inventory;