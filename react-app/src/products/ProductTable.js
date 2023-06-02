// components/ProductsTable.js
import React from 'react';
import ProductCard from './ProductCard';
import { useStore } from '../services/store'; 

const ProductTable = () => {
  const { selectors } = useStore();
  const { products } = selectors;

  return (
    <div className="products-table">
      {products.map(product => (
        <ProductCard key={product.name} product={product} />
      ))}
    </div>
  );
};

export default ProductTable;
