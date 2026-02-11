import type { Schema } from '../../amplify/data/resource';

export default function ProductCard({ product }: { product: Schema['Product'] }) {
  return (
    <a 
      href={product.affiliateLink || '#'} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group"
    >
      <div className="font-mono bg-black text-gray-300 border border-gray-800 p-6 aspect-square flex flex-col justify-between transition-all duration-300 group-hover:border-white group-hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-xl uppercase tracking-wider">{product.name}</h3>
          <span>→</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-3">{product.description}</p>
      </div>
    </a>
  );
}
