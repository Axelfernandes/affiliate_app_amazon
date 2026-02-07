import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export default function ProductList() {
  const [products, setProducts] = useState<Schema['Product'][]>([]);

  useEffect(() => {
    const sub = client.models.Product.observeQuery().subscribe(({ items }) => {
      setProducts(items);
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Your Products</h3>
      {products.length === 0 ? (
        <p className="text-gray-500">No products yet. Add one to get started!</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
