import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faHistory } from '@fortawesome/free-solid-svg-icons';
import EmployeeManagement from './EmployeeManagement';
import PayslipHistory from './PayslipHistory';
import PayslipDisplay from './PayslipDisplay';
import PayslipModal from './PayslipModal';
import { EmployeeContext } from './EmployeeContext';

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
    { id: 'employeeManagement', label: 'Employee Management', icon: faUsers },
    { id: 'payslipHistory', label: 'Payslip History', icon: faHistory },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowPayslipModal(false); // Close the modal when changing tabs
  };

  const handleCloseModal = () => {
    setShowPayslipModal(false);
  };

  const layoutClass =
    activeTab === 'employeeManagement'
      ? 'min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 flex flex-col lg:flex-row'
      : 'min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900';

  return (
    <div className={layoutClass}>
      <div className="flex-grow w-full p-4 md:p-6 overflow-y-auto lg:flex-[2]">
        <nav className="p-1.5 inline-flex items-center space-x-2 bg-white rounded-full shadow-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center justify-center py-3 px-8 rounded-full text-base font-medium transition-all duration-300 focus:outline-none ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-3 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg relative mb-6 shadow-md"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8 min-h-[80vh] overflow-auto">
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
              {...{
                payslipHistory,
                employees,
                handleDeletePayslip,
                startDate,
                endDate,
              }}
            />
          )}
        </div>
      </div>

      {activeTab === 'employeeManagement' && (
        <div className="w-full lg:w-1/3 p-4 md:p-6 flex flex-col items-center overflow-y-auto bg-gray-50 border-l border-gray-200 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl m-4 lg:m-0 lg:my-4 shadow-xl">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 self-start tracking-tight">
            Payslip Preview
          </h2>
          <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg relative border border-gray-200">
            {currentPayslip ? (
              <PayslipDisplay payslipData={currentPayslip} />
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-semibold mb-2">No payslip preview available.</p>
                <p className="text-sm">
                  Generate a payslip to see a preview here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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