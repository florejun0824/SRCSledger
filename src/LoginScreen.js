import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ onLoginSuccess }) => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fullEmail = `${emailPrefix}@srcs.edu`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, fullEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, fullEmail, password);
      }
      // The onAuthStateChanged listener in App.js will handle successful login
      // onLoginSuccess();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-10 transform transition-all duration-300 hover:scale-105 border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://i.ibb.co/XfJ8scGX/1.png" 
            alt="SRCS Logo" 
            className="w-28 h-28 rounded-full mb-4 shadow-md ring-4 ring-blue-500/20"
          />
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">SRCS Bookkeeper</h2>
          <p className="text-lg text-gray-500 mt-2">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg relative mb-6 shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuthAction}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="flex rounded-lg shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
              <input
                type="text"
                id="email"
                value={emailPrefix}
                onChange={(e) => setEmailPrefix(e.target.value)}
                placeholder="username"
                className="flex-1 block w-full px-4 py-3 bg-white rounded-l-lg focus:outline-none placeholder-gray-400 text-gray-900"
                required
              />
              <span className="inline-flex items-center px-4 py-3 rounded-r-lg border-l border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                @srcs.edu
              </span>
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;