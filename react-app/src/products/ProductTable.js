// components/ProductsTable.js
import React from 'react';
import ProductCard from './ProductCard';
import { useStore } from '../store'; 

const ProductTable = () => {
  const { userProducts } = useStore();

  return (
    <div className="products-table">
      {userProducts.map(product => (
        <ProductCard key={product.name} product={product} />
      ))}
    </div>
  );
};

export default ProductTable;
