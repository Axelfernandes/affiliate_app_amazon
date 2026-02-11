import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

import ProductCard from './ProductCard'; // Import the new component

const client = generateClient<Schema>();

export default function PublicProductGrid() {
  const [products, setProducts] = useState<Schema['Product'][]>([]);

  useEffect(() => {
    // Fetch only PUBLISHED products
    const sub = client.models.Product.observeQuery({
      filter: {
        status: { eq: 'PUBLISHED' }
      }
    }).subscribe(({ items }) => {
      setProducts(items);
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-900 p-px">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {/* Add empty placeholder cards to fill the grid */}
      {Array.from({ length: Math.max(0, 8 - products.length) }).map((_, i) => (
        <div key={`placeholder-${i}`} className="bg-black aspect-square" />
      ))}
    </div>
  );
}
