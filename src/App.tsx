import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Hello {user?.signInDetails?.loginId}</h1>
          <button onClick={signOut} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Sign out</button>
          <div className="mt-8 p-6 bg-white rounded shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Auto-Niche Admin</h2>
            <p className="text-gray-600">This is your protected content area. You can start managing products and suggestions here.</p>
            {/* Future product and suggestion management components will go here */}
          </div>
        </main>
      )}
    </Authenticator>
  );
}
