// src/EmployeeContext.js
import React, { createContext, useState } from 'react';

// Create a new context for employee-related state
export const EmployeeContext = createContext();

// Create a provider component that will wrap the application
export const EmployeeProvider = ({ children }) => {
  const [generatedPayslip, setGeneratedPayslip] = useState(null);

  const value = {
    generatedPayslip,
    setGeneratedPayslip,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};