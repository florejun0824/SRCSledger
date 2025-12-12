// src/Header.js

import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = ({ userId, handleSignOut }) => {
  return (
    // UPDATED: Replaced dark background with the new 'glass-effect' class for a semi-transparent, blurry header.
    <header className="glass-effect sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-6">
            <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="SRCS Logo" className="h-16 w-16"/>
            <div>
              {/* UPDATED: Text color changed from white to dark slate for readability on a light background. */}
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">SRCS Bookkeeper's System</h1>
              {/* UPDATED: Subtitle text color adjusted to a lighter gray. */}
              <p className="text-sm text-slate-500">Manage employees and generate detailed payslips</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             {/* UPDATED: User ID text and badge styled for the light theme. */}
             <p className="text-sm text-slate-500 hidden md:block">
               Your User ID: <span className="font-mono bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{userId}</span>
             </p>
             {/* UPDATED: Button styled to be a secondary action, fitting the clean iOS aesthetic. */}
             <button
              onClick={handleSignOut}
              className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors duration-200"
              title="Logout"
            >
              <FaSignOutAlt className="mr-2"/>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;