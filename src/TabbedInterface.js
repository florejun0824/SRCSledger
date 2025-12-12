// src/TabbedInterface.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersCog, faHistory, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import EmployeeForm from './EmployeeForm';
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
    { id: 'employeeManagement', label: 'Management', icon: faUsersCog },
    { id: 'payslipHistory', label: 'History', icon: faHistory },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Keep the preview if switching tabs doesn't imply a full reset
    // setGeneratedPayslip(null); 
  };
  
  return (
    <div className="min-h-screen text-white">
      <main className="max-w-8xl mx-auto w-full p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <nav className="p-1.5 inline-flex items-center space-x-1 bg-slate-900/80 rounded-xl mb-6 border border-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center justify-center py-2 px-6 rounded-lg text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              {activeTab === 'employeeManagement' && (
                <EmployeeForm {...{ employee: currentEmployee, setEmployee: setCurrentEmployee, employees, payslipDetails, setPayslipDetails, handleSaveEmployee, handleDeleteEmployee, handleGeneratePayslip, resetForm, handleSelectEmployee, payslipDeductions, setPayslipDeductions, getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution }}/>
              )}
              {activeTab === 'payslipHistory' && (
                <PayslipHistory {...{ payslipHistory, employees, handleDeletePayslip, setPayslip, startDate, endDate }} />
              )}
            </div>
          </div>

          {/* Right Column: Payslip Preview */}
          <div className="lg:col-span-2">
              <div className="sticky top-24">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-3 text-cyan-400"/>
                      Payslip Preview & Print
                  </h2>
                  <div className="w-full bg-slate-800/50 p-2 rounded-xl shadow-lg relative border border-slate-700 backdrop-blur-sm">
                      <div className="max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">
                          {payslip ? (
                          <PayslipDisplay payslipData={payslip} />
                          ) : (
                          <div className="text-center py-24 px-4 text-slate-500 bg-slate-800/70 rounded-lg">
                              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-6xl text-slate-600 mb-4"/>
                              <p className="font-semibold text-lg">No payslip to preview.</p>
                              <p className="text-sm">Generate a payslip or select one from history.</p>
                          </div>
                          )}
                      </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                      <PrintManager {...{ payslip, employees, payslipDetails, setPayslipDetails, startDate, endDate }} />
                  </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TabbedInterface;
