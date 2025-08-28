// src/Header.js

import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = ({ userId, handleSignOut }) => {
  return (
    <header className="bg-slate-800 text-white shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-6">
            <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="SRCS Logo" className="h-16 w-16"/>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SRCS Bookkeeper's System</h1>
              <p className="text-sm text-slate-300">Manage employees and generate detailed payslips</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <p className="text-sm text-slate-300 hidden md:block">
               Your User ID: <span className="font-mono bg-slate-700 px-2 py-1 rounded">{userId}</span>
             </p>
             <button
              onClick={handleSignOut}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
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