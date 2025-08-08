// src/EmployeeContext.js

import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const EmployeeContext = createContext();

// Create the provider component
export const EmployeeProvider = ({ children }) => {
  // Initialize state by reading from sessionStorage, or default to null
  const [generatedPayslip, setGeneratedPayslip] = useState(() => {
    try {
      const item = window.sessionStorage.getItem('generatedPayslip');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
      return null;
    }
  });

  // Use an effect to save the state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      if (generatedPayslip) {
        window.sessionStorage.setItem('generatedPayslip', JSON.stringify(generatedPayslip));
      } else {
        // Clear storage if the payslip is cleared
        window.sessionStorage.removeItem('generatedPayslip');
      }
    } catch (error) {
      console.error("Error writing to sessionStorage:", error);
    }
  }, [generatedPayslip]);
  
  // The value provided to any child components
  const contextValue = {
    generatedPayslip,
    setGeneratedPayslip
  };

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
};