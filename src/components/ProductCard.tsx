import { Bell, ExternalLink, ShieldCheck } from 'lucide-react';
import { PriceChart } from './PriceChart';

// Mock price history for visualization
const MOCK_PRICE_HISTORY = [
  { date: '1', price: 100 },
  { date: '2', price: 95 },
  { date: '3', price: 105 },
  { date: '4', price: 89 },
  { date: '5', price: 92 },
  { date: '6', price: 85 },
];

export default function ProductCard({ product }: { product: any }) {
  // Logic to simulate deal context
  const currentPrice = product.currentPrice || 0;
  const originalPrice = product.originalPrice || 0;
  const discount = originalPrice > 0 ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;
  const hasBigDiscount = discount >= 20;
  const lastChecked = "2 mins ago";

  const history = typeof product.priceHistory === 'string'
    ? JSON.parse(product.priceHistory)
    : (Array.isArray(product.priceHistory) ? product.priceHistory : MOCK_PRICE_HISTORY);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 group flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300">
      {/* Discount Badge - Top Right */}
      {hasBigDiscount && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-emerald-600 text-white font-display font-extrabold px-3 py-1 rounded-full text-sm shadow-lg shadow-emerald-100">
            {discount}% OFF
          </div>
        </div>
      )}

      {/* Product Discovery Area */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
          <ShieldCheck size={14} />
          Verified Deal
        </div>
        <h3 className="text-xl font-display font-black leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Price Scannability Module */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-black text-slate-900">${currentPrice || '---'}</span>
        {originalPrice > 0 && originalPrice > currentPrice && (
          <span className="text-sm text-slate-400 line-through font-medium">${originalPrice}</span>
        )}
      </div>

      {/* Price History Visualization (Keepa style) */}
      <div className="h-20 w-full mt-2 group-hover:brightness-95 transition-all">
        <PriceChart data={history} className="h-full w-full" />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
          <span>{history.length} Data points</span>
          <span className="text-emerald-600">Lowest: ${Math.min(...history.map((h: any) => h.price))}</span>
        </div>
      </div>

      {/* Action Module */}
      <div className="mt-auto pt-4 space-y-4">
        <div className="flex gap-2">
          {/* Main CTA */}
          <a
            href={product.affiliateLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-premium bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            View Deal
            <ExternalLink size={16} />
          </a>

          {/* One-Tap Tracking (Slickdeals style) */}
          <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <Bell size={20} />
          </button>
        </div>

        {/* Confidence Cues & Disclosure */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
            <span>Amazon Prime</span>
            <span>Free Shipping</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-indigo-600/60 font-bold">Last checked: {lastChecked}</span>
            <div className="group/disclosure relative">
              <span className="text-[10px] text-slate-300 underline cursor-help font-bold">*Commission may be earned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
