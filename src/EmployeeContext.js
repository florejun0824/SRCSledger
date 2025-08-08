import React, { createContext, useState, useEffect } from 'react';

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  // Use a function to initialize state from localStorage
  const [generatedPayslips, setGeneratedPayslipsState] = useState(() => {
    try {
      const storedPayslips = localStorage.getItem('generatedPayslips');
      return storedPayslips ? JSON.parse(storedPayslips) : {};
    } catch (error) {
      console.error("Failed to load payslips from localStorage:", error);
      return {};
    }
  });

  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipData, setSelectedPayslipData] = useState(null);

  // useEffect to save payslips to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('generatedPayslips', JSON.stringify(generatedPayslips));
    } catch (error) {
      console.error("Failed to save payslips to localStorage:", error);
    }
  }, [generatedPayslips]);

  const setGeneratedPayslips = (employeeId, payslipData) => {
    setGeneratedPayslipsState(prevPayslips => ({
      ...prevPayslips,
      [employeeId]: payslipData
    }));
  };

  const value = {
    generatedPayslips,
    setGeneratedPayslips,
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