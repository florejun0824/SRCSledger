import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ auth, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        // Register new user
        await createUserWithEmailAndPassword(auth, email, password);
        // Using a custom message box instead of alert()
        const messageBox = document.createElement('div');
        messageBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
        messageBox.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl text-center">
            <p class="text-lg font-semibold mb-4">Registration successful! You are now logged in.</p>
            <button id="closeMessageBox" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">OK</button>
          </div>
        `;
        document.body.appendChild(messageBox);
        document.getElementById('closeMessageBox').onclick = () => document.body.removeChild(messageBox);
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess(); // Notify parent component of successful login
    } catch (err) {
      console.error("Authentication error:", err);
      // Provide user-friendly error messages
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already registered. Try logging in.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegistering ? 'Register Account' : 'Login to SRCS Bookkeeper'}
        </h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleAuthAction}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
        </button>
        <p className="text-center text-gray-600 mt-4">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegistering(false)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
