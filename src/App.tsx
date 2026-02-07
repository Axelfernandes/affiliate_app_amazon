import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState } from 'react';

import ProductList from './components/ProductList';
import AddProductForm from './components/AddProductForm';
import TrendScout from './components/TrendScout';

export default function App() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome, <span className="text-blue-600">{user?.signInDetails?.loginId}</span>
            </h1>
            <button 
              onClick={signOut} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Sign out
            </button>
          </header>

          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Auto-Niche Admin Dashboard</h2>
            
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button 
                  onClick={() => setActiveTab('products')} 
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Manage Products
                </button>
                <button 
                  onClick={() => setActiveTab('add')} 
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'add' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Add New Product
                </button>
                <button 
                  onClick={() => setActiveTab('trends')} 
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'trends' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Trend Scout
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'products' && <ProductList />}
              {activeTab === 'add' && <AddProductForm />}
              {activeTab === 'trends' && <TrendScout />}
            </div>
          </div>
        </main>
      )}
    </Authenticator>
  );
}
