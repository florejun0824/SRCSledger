import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// A modern, full-screen login/registration component.
const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // The onAuthStateChanged listener in App.js will handle successful login
      // onLoginSuccess(); // This might not be needed if App.js handles it all
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white">
        <img 
          src="https://i.ibb.co/XfJ8scGX/1.png" 
          alt="School Logo" 
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-white p-2"
        />
        <h2 className="text-3xl font-bold text-center mb-2">SRCS Bookkeeper</h2>
        <p className="text-center text-indigo-200 mb-8">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        
        {error && <p className="bg-red-500/50 text-white text-center p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleAuthAction}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-indigo-100">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white/20 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-indigo-200"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-indigo-100">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/20 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-indigo-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-100 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="text-center mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-bold text-indigo-200 hover:text-white transition">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;