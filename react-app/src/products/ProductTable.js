// components/ProductsTable.js
import React from 'react';
import ProductCard from './ProductCard';
import { useManage } from '../store'; 

const ProductTable = () => {
  const { userProducts } = useManage();

  return (
    <div className="products-table">
      {userProducts.map(product => (
        <ProductCard key={product.name} product={product} />
      ))}
    </div>
  );
};

export default ProductTable;
