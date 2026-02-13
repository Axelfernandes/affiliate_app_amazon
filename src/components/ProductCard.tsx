import {
  Bell,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { PriceChart } from "./PriceChart";
import { cn } from "../lib/utils";

// Mock price history for visualization
const MOCK_PRICE_HISTORY = [
  { date: "1", price: 100 },
  { date: "2", price: 95 },
  { date: "3", price: 105 },
  { date: "4", price: 89 },
  { date: "5", price: 92 },
  { date: "6", price: 85 },
];

export default function ProductCard({ product }: { product: any }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Logic to simulate deal context
  const currentPrice = product.currentPrice || 0;
  const originalPrice = product.originalPrice || 0;
  const discount =
    originalPrice > 0
      ? Math.round((1 - currentPrice / originalPrice) * 100)
      : 0;
  const hasBigDiscount = discount >= 20;
  const lastChecked = "2 mins ago";

  const images =
    product.images && product.images.length > 0
      ? product.images.slice(0, 4)
      : [];

  const history =
    typeof product.priceHistory === "string"
      ? JSON.parse(product.priceHistory)
      : Array.isArray(product.priceHistory)
        ? product.priceHistory
        : MOCK_PRICE_HISTORY;

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 group flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300">
      {/* Product Image Stage (Slider) */}
      <div className="relative -mx-6 -mt-6 mb-2 h-64 overflow-hidden bg-slate-50 border-b border-slate-100 group/slider">
        {images.length > 0 ? (
          <>
            <div
              className="absolute inset-0 flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
            >
              {images.map((img: string, i: number) => (
                <div key={i} className="min-w-full h-full p-6">
                  <img
                    src={img}
                    alt={`${product.name} - View ${i + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* Selection Indicators (Dots) */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {images.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImgIndex(i);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      currentImgIndex === i
                        ? "w-6 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400",
                    )}
                  />
                ))}
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 opacity-0 group-hover/slider:opacity-100 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-slate-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 opacity-0 group-hover/slider:opacity-100 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-slate-100"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Sparkles size={48} className="opacity-20" />
          </div>
        )}

        {/* Discount Badge - Layered over slider */}
        {hasBigDiscount && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-emerald-600 text-white font-display font-extrabold px-3 py-1 rounded-full text-xs shadow-lg shadow-emerald-100 uppercase tracking-wider">
              {discount}% OFF
            </div>
          </div>
        )}
      </div>

      {/* Product Discovery Area */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
          <ShieldCheck size={14} />
          Verified Deal
        </div>
        <h3 className="text-xl font-display font-black leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
      </div>

      {/* Price Scannability Module */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-black text-slate-900">
          ${currentPrice || "---"}
        </span>
        {originalPrice > 0 && originalPrice > currentPrice && (
          <span className="text-sm text-slate-400 line-through font-medium">
            ${originalPrice}
          </span>
        )}
      </div>

      {/* Price History Visualization (Keepa style) */}
      <div className="h-20 w-full mt-2 group-hover:brightness-95 transition-all">
        <PriceChart data={history} className="h-full w-full" />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
          <span>{history.length} Data points</span>
          <span className="text-emerald-600">
            Lowest: ${Math.min(...history.map((h: any) => h.price))}
          </span>
        </div>
      </div>

      {/* Action Module */}
      <div className="mt-auto pt-4 space-y-4">
        <div className="flex gap-2">
          {/* Main CTA */}
          <a
            href={product.affiliateLink || "#"}
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
            <span className="text-[10px] text-indigo-600/60 font-bold">
              Last checked: {lastChecked}
            </span>
            <div className="group/disclosure relative">
              <span className="text-[10px] text-slate-300 underline cursor-help font-bold text-center w-full block">
                *Commission may be earned
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
