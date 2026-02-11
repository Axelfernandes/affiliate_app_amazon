import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState, useEffect } from 'react';

import AdminDashboard from './components/AdminDashboard';
import PublicProductGrid from './components/PublicProductGrid';
import PublicHeader from './components/PublicHeader';
import { FilterSidebar } from './components/FilterSidebar';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', checkHash);
    checkHash(); // Check on initial load
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (isAdmin) {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <AdminDashboard signOut={signOut} user={user} />
        )}
      </Authenticator>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <PublicHeader onAdminClick={() => window.location.hash = '#admin'} />

      <main className="max-w-[1440px] mx-auto flex gap-4 pt-4">
        <FilterSidebar />

        <div className="flex-1">
          {/* Hero / Page Info */}
          <div className="px-6 mb-8 mt-6">
            <h1 className="text-4xl md:text-5xl font-display font-black mb-2 text-slate-900">
              Today's <span className="text-indigo-600">Best-in-Class</span> Deals
            </h1>
            <p className="text-slate-500 max-w-xl text-sm leading-relaxed font-medium">
              Real-time monitoring from Amazon, Best Buy, and Walmart.
              Verified prices backed by historical data and AI analysis.
            </p>
          </div>

          <PublicProductGrid />
        </div>
      </main>

      {/* Footer / FTC Disclosure Global */}
      <footer className="py-12 border-t border-slate-200 text-center mt-20">
        <div className="inline-flex bg-white border border-slate-200 px-4 py-2 rounded-full items-center gap-2 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
            Affiliate Disclosure: Earns commissions on qualified purchases
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
