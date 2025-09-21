// src/TabbedInterface.js

// FIXED: Correctly import React, useState, and useContext.
import React, { useState, useContext } from 'react';
import {
  UserGroupIcon,
  Clock01Icon,
  ChartColumnIcon,
  AlertCircleIcon,
  InvoiceIcon
} from 'hugeicons-react';

import EmployeeManagement from './EmployeeManagement';
import PayslipHistory from './PayslipHistory';
import PayslipDisplay from './PayslipDisplay';
import PayslipModal from './PayslipModal';
import { EmployeeContext } from './EmployeeContext';
import MonthlyReport from './MonthlyReport';

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
  // CORRECTED: 'activeTab' is managed by local state, not context.
  const [activeTab, setActiveTab] = useState('employeeManagement');
  // CORRECTED: Destructure only the relevant values from EmployeeContext.
  const { showPayslipModal, setShowPayslipModal, selectedPayslipData } = useContext(EmployeeContext);

  const currentPayslip = payslipHistory.find(
    (payslip) => payslip.employeeDocId === currentEmployee?.id
  );

  const tabs = [
    { id: 'employeeManagement', label: 'Employee Management', icon: UserGroupIcon, color: '#4F46E5' },
    { id: 'payslipHistory', label: 'Payslip History', icon: Clock01Icon, color: '#10B981' },
    { id: 'monthlyReport', label: 'Monthly Payroll', icon: ChartColumnIcon, color: '#8B5CF6' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowPayslipModal(false);
  };

  const handleCloseModal = () => {
    setShowPayslipModal(false);
  };

  const layoutHasSidebar = activeTab === 'employeeManagement';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`grid ${layoutHasSidebar ? 'lg:grid-cols-5' : 'grid-cols-1'} gap-8`}>
        <div className={layoutHasSidebar ? 'lg:col-span-3' : 'col-span-1'}>
          <div className="card-style">
            <nav className="p-1.5 inline-flex flex-nowrap items-center space-x-1 md:space-x-2 bg-slate-100 rounded-full mb-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center justify-center py-2.5 px-4 md:px-5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <tab.icon className="mr-2 h-4 w-4 flex-shrink-0" color={activeTab === tab.id ? '#4F46E5' : '#64748B'} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {error && (
              <div
                className="bg-red-500/10 text-red-900 p-4 rounded-xl relative mb-6 flex items-center"
                role="alert"
              >
                <AlertCircleIcon className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              </div>
            )}

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

        {layoutHasSidebar && (
          <div className="lg:col-span-2">
            <div className="card-style sticky top-[152px]">
              <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200/80 flex items-center">
                <InvoiceIcon className="mr-3 text-indigo-500" />
                Payslip Preview
              </h2>
              <div className="w-full bg-slate-50/75 p-4 rounded-xl border border-slate-200/50 min-h-[900px] flex items-center justify-center">
                {currentPayslip ? (
                  <PayslipDisplay payslipData={currentPayslip} />
                ) : (
                  <div className="text-center py-16 text-slate-400">
                     <InvoiceIcon className="mx-auto text-6xl text-slate-300 mb-4" />
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