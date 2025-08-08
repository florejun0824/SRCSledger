import React, { createContext, useState, useEffect } from 'react';

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  // generatedPayslips state and its persistence logic are removed from here.
  // Payslips will be managed directly in Firestore within App.js.
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipData, setSelectedPayslipData] = useState(null);

  const value = {
    // generatedPayslips and setGeneratedPayslips are no longer part of this context
    currentEmployee,
    setCurrentEmployee,
    showPayslipModal,
    setShowPayslipModal,
    selectedPayslipData,
    setSelectedPayslipData
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};