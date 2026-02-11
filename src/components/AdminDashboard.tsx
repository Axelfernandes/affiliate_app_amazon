import { useState } from 'react';
import ProductList from './ProductList';
import AddProductForm from './AddProductForm';
import TrendScout from './TrendScout';
import SuggestionList from './SuggestionList';
import { LayoutDashboard, PlusCircle, TrendingUp, Inbox, LogOut } from 'lucide-react';

interface User {
  username: string;
  signInDetails?: {
    loginId?: string;
  };
}

interface AdminDashboardProps {
  signOut?: () => void;
  user?: any;
}

export default function AdminDashboard({ signOut, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'trends' | 'suggestions'>('products');
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Auto-Niche Admin</h1>
          <p className="text-xs text-gray-500 mt-1 truncate">Logged in as {user?.signInDetails?.loginId || user?.userId}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (item.id !== 'add') setSelectedSuggestion(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-gray-600 mt-1">Manage your affiliate content and find new opportunities.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          </div>
        </div>
      </main>
    </div>
  );
}
