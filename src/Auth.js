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

      {children}
    </div>
  );
};

export default Auth;