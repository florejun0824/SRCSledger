// src/EmployeeManagement.js
import React from 'react';
import App from './App'; // App.js now handles the full authenticated dashboard

const EmployeeManagement = () => {
    // The App component now handles all routing and UI logic internally
    // after a user is authenticated.
    return <App />;
};

export default EmployeeManagement;