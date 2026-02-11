import { useState } from 'react';
import ProductList from './ProductList';
import AddProductForm from './AddProductForm';
import TrendScout from './TrendScout';
import SuggestionList from './SuggestionList';
import BulkUpload from './BulkUpload';
import { LayoutDashboard, PlusCircle, TrendingUp, Inbox, LogOut, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  signOut?: () => void;
  user?: any;
}

export default function AdminDashboard({ signOut, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'trends' | 'suggestions' | 'bulk'>('products');
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const handleApproveSuggestion = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setActiveTab('add');
  };

  const navItems = [
    { id: 'products', label: 'All Products', icon: LayoutDashboard },
    { id: 'add', label: 'Add Product', icon: PlusCircle },
    { id: 'trends', label: 'Trend Scout', icon: TrendingUp },
    { id: 'suggestions', label: 'Suggestions', icon: Inbox },
    { id: 'bulk', label: 'Bulk Upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 flex flex-col bg-white sticky top-0 h-screen shadow-sm">
        <div className="p-8 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-display font-black text-indigo-900">Admin</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Auth: {user?.signInDetails?.loginId || user?.userId}
          </p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id !== 'add') setSelectedSuggestion(null);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={signOut}
            className="w-full btn-premium border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-auto relative bg-slate-50/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <header className="animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-4xl font-display font-black capitalize tracking-tight text-slate-900">
              {activeTab.replace('-', ' ')}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Control center for your high-performance affiliate engine.</p>
          </header>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {activeTab === 'products' && <ProductList />}
            {activeTab === 'add' && (
              <AddProductForm
                initialData={selectedSuggestion}
                onSuccess={() => {
                  setActiveTab('products');
                  setSelectedSuggestion(null);
                }}
              />
            )}
            {activeTab === 'trends' && <TrendScout />}
            {activeTab === 'suggestions' && (
              <SuggestionList onApprove={handleApproveSuggestion} />
            )}
            {activeTab === 'bulk' && <BulkUpload />}
          </div>
        </div>
      </main>
    </div>
  );
}
