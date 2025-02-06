// components/ProductCard.js
import React from 'react';

const ProductCard = ({ product }) => (
  <div className="card">
    <div className="card-content">
      <div className="content">
        <div className="name">{product.name}</div>
        <div className="type">{product.type}</div>
        <div className="brand">{product.brand}</div>
        <div className="description">{product.description}</div>
      </div>
    </div>
  </div>
);

export default ProductCard;
