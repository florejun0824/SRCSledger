// src/TabbedInterface.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faHistory } from '@fortawesome/free-solid-svg-icons';
import EmployeeManagement from './EmployeeManagement';
import PayslipHistory from './PayslipHistory';
import PayslipDisplay from './PayslipDisplay';
import PrintManager from './PrintManager';

const TabbedInterface = ({
  employees,
  payslipHistory,
  currentEmployee,
  setCurrentEmployee,
  payslip,
  setPayslip,
  setGeneratedPayslip,
  error,
  setError,
  payslipDetails,
  setPayslipDetails,
  handleSaveEmployee,
  handleDeleteEmployee,
  handleDeletePayslip,
  handleGeneratePayslip,
  resetForm,
  handleSelectEmployee,
  payslipDeductions,
  setPayslipDeductions,
  getSssContribution,
  getPhilhealthContribution,
  getPagibigContribution,
  getCeapContribution,
  startDate,
  endDate,
}) => {
  const [activeTab, setActiveTab] = useState('employeeManagement');

  const tabs = [
    { id: 'employeeManagement', label: 'Employee Management', icon: faUsers },
    { id: 'payslipHistory', label: 'Payslip History', icon: faHistory },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setPayslip(null);
    if (setGeneratedPayslip) {
      setGeneratedPayslip(null);
    }
  };
  
  const layoutClass = activeTab === 'employeeManagement'
    ? "min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row"
    : "min-h-screen bg-gray-50 text-gray-900"; 

  return (
    <div className={layoutClass}>
      <div className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
        <nav className="p-1.5 inline-flex items-center space-x-2 bg-indigo-100 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center justify-center py-2.5 px-6 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow'
                  : 'text-indigo-900 hover:bg-white hover:bg-opacity-50'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-3 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 min-h-[80vh] overflow-auto">
          {activeTab === 'employeeManagement' && (
            <EmployeeManagement {...{ employees, currentEmployee, setCurrentEmployee, payslip, setPayslip, payslipDetails, setPayslipDetails, handleSaveEmployee, handleDeleteEmployee, handleGeneratePayslip, resetForm, handleSelectEmployee, payslipDeductions, setPayslipDeductions, getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution }}/>
          )}
          {activeTab === 'payslipHistory' && (
            <PayslipHistory {...{ payslipHistory, employees, handleDeletePayslip, setPayslip, startDate, endDate }} />
          )}
        </div>
      </div>

      {activeTab === 'employeeManagement' && (
        <div className="flex-1 w-full md:w-1/2 p-4 md:p-6 flex flex-col items-center overflow-y-auto bg-gray-100 border-l border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 self-start">Payslip Preview</h2>
          <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md relative">
            {payslip ? (
              <PayslipDisplay payslipData={payslip} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No payslip preview available.</p>
                <p className="text-sm">Generate a payslip or select an employee to see a preview here.</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <PrintManager {...{ payslip, employees, payslipDetails, setPayslipDetails, startDate, endDate }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedInterface;