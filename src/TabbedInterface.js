// src/TabbedInterface.js

import React, { useState, useContext } from 'react';
// Updated imports to use the correct Hugeicons
import {
  UserGroupIcon,
  Clock01Icon,
  ChartColumnIcon,
  AlertCircleIcon, // Corrected from WarningIcon
  InvoiceIcon
} from 'hugeicons-react';

import EmployeeManagement from './EmployeeManagement';
import PayslipHistory from './PayslipHistory';
import PayslipDisplay from './PayslipDisplay';
import PayslipModal from './PayslipModal';
import { EmployeeContext } from './EmployeeContext';
import MonthlyReport from './MonthlyReport'; // Import the new report component

const TabbedInterface = ({
  employees,
  payslipHistory,
  currentEmployee,
  setCurrentEmployee,
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
  const { showPayslipModal, setShowPayslipModal, selectedPayslipData } = useContext(EmployeeContext);

  // Find the most recent payslip for the current employee from the payslipHistory prop
  const currentPayslip = payslipHistory.find(
    (payslip) => payslip.employeeDocId === currentEmployee?.id
  );

  const tabs = [
    { id: 'employeeManagement', label: 'Employee Management', icon: UserGroupIcon, color: '#3182CE' },
    { id: 'payslipHistory', label: 'Payslip History', icon: Clock01Icon, color: '#48BB78' },
    { id: 'monthlyReport', label: 'Monthly Payroll', icon: ChartColumnIcon, color: '#805AD5' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowPayslipModal(false); // Close the modal when changing tabs
  };

  const handleCloseModal = () => {
    setShowPayslipModal(false);
  };

  // Your smart layout logic is preserved. The sidebar will only show for the employeeManagement tab.
  const layoutHasSidebar = activeTab === 'employeeManagement';

  return (
    <div className="px-5 py-8">
      <div className={`grid ${layoutHasSidebar ? 'lg:grid-cols-5' : 'grid-cols-1'} gap-8`}>
        {/* Main Content Area */}
        <div className={layoutHasSidebar ? 'lg:col-span-3' : 'col-span-1'}>
          <div className="bg-white rounded-2xl shadow-xl p-2 md:p-4">
            {/* Tab Navigation */}
            <nav className="p-1.5 inline-flex flex-wrap items-center space-x-2 bg-slate-100 rounded-full shadow-inner mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center justify-center py-3 px-6 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" color={activeTab === tab.id ? 'white' : tab.color} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Error Display */}
            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg relative mb-6 shadow-md flex items-center"
                role="alert"
              >
                <AlertCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div>
              {activeTab === 'employeeManagement' && (
                <EmployeeManagement
                  {...{
                    employees,
                    currentEmployee,
                    setCurrentEmployee,
                    payslipDetails,
                    setPayslipDetails,
                    handleSaveEmployee,
                    handleDeleteEmployee,
                    handleGeneratePayslip,
                    resetForm,
                    handleSelectEmployee,
                    payslipDeductions,
                    setPayslipDeductions,
                    getSssContribution,
                    getPhilhealthContribution,
                    getPagibigContribution,
                    getCeapContribution,
                  }}
                />
              )}
              {activeTab === 'payslipHistory' && (
                <PayslipHistory
                  payslipHistory={payslipHistory}
                  handleDeletePayslip={handleDeletePayslip}
                  employees={employees}
                />
              )}
              {activeTab === 'monthlyReport' && (
                 <MonthlyReport
                  payslipHistory={payslipHistory}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar for Payslip Preview */}
        {layoutHasSidebar && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-2 md:p-4 sticky top-32">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200 flex items-center">
                <InvoiceIcon className="mr-3 text-blue-500" />
                Payslip Preview
              </h2>
              <div className="w-full bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-200 min-h-[900px] flex items-center justify-center">
                {currentPayslip ? (
                  <PayslipDisplay payslipData={currentPayslip} />
                ) : (
                  <div className="text-center py-16 text-slate-400">
                     <InvoiceIcon className="text-6xl text-slate-300 mb-4" />
                    <p className="text-lg font-semibold mb-2">No payslip preview available.</p>
                    <p className="text-sm">
                      Select an employee and generate a payslip to see a preview here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      {showPayslipModal && (
        <PayslipModal
          payslipData={selectedPayslipData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TabbedInterface;