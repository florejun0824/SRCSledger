import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// A modern, refined light-mode login component with a constant domain.
const LoginScreen = ({ onLoginSuccess }) => {
  // 1. Changed 'email' state to 'username' state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  
  // Constant Domain
  const CONSTANT_DOMAIN = '@srcs.edu';

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 2. Construct the full email address using the constant domain
    const fullEmail = `${username}${CONSTANT_DOMAIN}`;
    
    try {
      if (isLogin) {
        // Use the fullEmail for authentication
        await signInWithEmailAndPassword(auth, fullEmail, password);
      } else {
        // Use the fullEmail for registration
        await createUserWithEmailAndPassword(auth, fullEmail, password);
      }
      // Success handling...
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace('(auth/', '').replace(').', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... UI elements from the Refined Light Mode (Two-column layout, Teal color) ...
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* === LEFT SIDE: Branding/Marketing Visual (Unchanged) === */}
        <div className="hidden lg:flex w-1/2 p-12 items-center justify-center bg-teal-600">
          <div className="text-white text-center">
            <h1 className="text-5xl font-extrabold mb-4 leading-snug">
              Smart <br /> Bookkeeping <br /> Starts Here
            </h1>
            <p className="text-teal-200 text-lg mt-6">
              Simplify financial management with SRCS Bookkeeper.
            </p>
            <svg className="w-24 h-24 mx-auto mt-10 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h6m-3 0v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zM9 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </div>
        </div>

        {/* === RIGHT SIDE: Form Container === */}
        <div className="w-full lg:w-1/2 p-10 md:p-12">
          
          <div className="text-center mb-10">
            <img 
              src="/1.png" 
              alt="School Logo" 
              className="w-14 h-14 mx-auto mb-4 rounded-full ring-2 ring-teal-500 p-0.5"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-sm text-gray-500">Sign in to SRCS Bookkeeper</p>
          </div>
          
          {error && <p className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-6">{error}</p>}

          <form onSubmit={handleAuthAction}>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">SRCS Username</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition duration-150">
                <input
                  type="text" // Changed from 'email' to 'text' since we are only taking the username
                  id="email"
                  value={username}
                  // 3. Bind to setUsername
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.name"
                  // 4. Removed padding from right side of input to abut the domain display
                  className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-transparent" 
                  required
                />
                {/* 5. Display the constant domain as a suffix */}
                <span className="flex-shrink-0 px-4 py-3 bg-gray-100 text-gray-500 font-medium">
                  {CONSTANT_DOMAIN}
                </span>
              </div>
            </div>
            <div className="mb-8">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600">
            {isLogin ? "Need access? " : "Already registered? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="font-semibold text-teal-600 hover:text-teal-700 transition"
            >
              {isLogin ? 'Request an account' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;