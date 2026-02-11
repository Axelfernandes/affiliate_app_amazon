import { TrendingUp, User, ShoppingBag } from 'lucide-react';

export default function PublicHeader({ onAdminClick }: { onAdminClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-center">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 max-w-7xl w-full px-6 py-3 rounded-2xl flex justify-between items-center shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100">
            <TrendingUp className="text-white" size={20} />
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-slate-900">
            AutoNiche
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Hot Deals</a>
          <a href="#" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Price Drops</a>
          <a href="#" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Categories</a>
          <a href="#" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">About</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">
            <ShoppingBag size={18} className="text-indigo-600" />
            Saved Deals
          </button>
          <button
            onClick={onAdminClick}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
