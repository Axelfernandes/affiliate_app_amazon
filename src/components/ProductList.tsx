import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Trash2, ExternalLink } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState<Schema['Product'][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const client = generateClient<Schema>();
      const { data } = await client.models.Product.list();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const client = generateClient<Schema>();
      await client.models.Product.delete({ id });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (isLoading) return <div className="text-gray-500 italic p-6 text-center">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-xl font-bold text-gray-900">All Published Products</h4>
        <button onClick={fetchProducts} className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Refresh</button>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500">No products found. Start by adding one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-gray-900 text-lg">{product.name}</h5>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <ExternalLink size={12} />
                    View Affiliate Link
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Product"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
