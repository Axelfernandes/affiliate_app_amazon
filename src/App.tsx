import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState, useEffect } from 'react';

import AdminDashboard from './components/AdminDashboard'; // We'll move the admin UI here
import PublicProductGrid from './components/PublicProductGrid';
import PublicHeader from './components/PublicHeader';

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
    <div className="bg-black min-h-screen">
      <PublicHeader />
      <PublicProductGrid />
    </div>
  );
}

export default App;
