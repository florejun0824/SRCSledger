import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import LoginScreen from './LoginScreen';

const Auth = ({ onAuthChange, children }) => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        onAuthChange(user.uid, true);
      } else {
        setUserId(null);
        setIsAuthReady(false);
        onAuthChange(null, false);
      }
    });

    return () => unsubscribe();
  }, [auth, onAuthChange]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  if (!isAuthReady || !userId) {
    return (
      <LoginScreen
        auth={auth}
        onLoginSuccess={() => {}}
      />
    );
  }

  return (
    <div>
      <div className="bg-indigo-600 p-6 text-white text-center rounded-t-2xl relative">
        {/* Logo Added Here */}
        <img 
          src="/1.png" 
          alt="Logo" 
          className="h-20 w-20 mx-auto mb-3 rounded-full border-4 border-indigo-400 shadow-lg"
        />
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">SRCS Bookkeeper's System</h1>
        <p className="text-indigo-200 text-lg">Manage employees and generate detailed payslips</p>
        <p className="text-sm text-indigo-200 mt-2">
          Your User ID: <span className="font-mono bg-indigo-700 px-2 py-1 rounded-md">{userId}</span>
        </p>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
};

export default Auth;