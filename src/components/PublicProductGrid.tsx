import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

import ProductCard from './ProductCard';

export default function PublicProductGrid() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const client = generateClient<Schema>();
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {/* Placeholder cards for a full layout feel if empty */}
        {products.length === 0 && Array.from({ length: 4 }).map((_, i) => (
          <div key={`placeholder-${i}`} className="bg-white border border-slate-100 rounded-3xl animate-pulse h-96 flex flex-col gap-4 p-6 shadow-sm">
            <div className="h-8 w-3/4 bg-slate-50 rounded-lg" />
            <div className="h-12 w-1/2 bg-slate-50 rounded-lg" />
            <div className="mt-auto h-12 w-full bg-slate-50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
