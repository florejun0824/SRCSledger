// src/PayslipManagement.js
import React from 'react';
import EmployeeForm from './EmployeeForm';
import PayslipDisplay from './PayslipDisplay';
import PayslipHistory from './PayslipHistory'; // Assuming you have this for a future feature
import PrintManager from './PrintManager';

const PayslipManagement = ({
  employees,
  payslipHistory,
  currentEmployee,
  setCurrentEmployee,
  payslip,
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
  handleSignOut,
  startDate,
  endDate,
  payslipDeductions,
  setPayslipDeductions,
  getSssContribution,
  getPhilhealthContribution,
  getPagibigContribution,
  getCeapContribution,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Payslip Manager</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form and Preview Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Details & Payslip Generation</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <EmployeeForm
                employee={currentEmployee}
                setEmployee={setCurrentEmployee}
                employees={employees}
                payslipDetails={payslipDetails}
                setPayslipDetails={setPayslipDetails}
                handleSaveEmployee={handleSaveEmployee}
                handleDeleteEmployee={handleDeleteEmployee}
                resetForm={resetForm}
                handleSelectEmployee={handleSelectEmployee}
                handleGeneratePayslip={handleGeneratePayslip}
                payslipDeductions={payslipDeductions}
                setPayslipDeductions={setPayslipDeductions}
                getSssContribution={getSssContribution}
                getPhilhealthContribution={getPhilhealthContribution}
                getPagibigContribution={getPagibigContribution}
                getCeapContribution={getCeapContribution}
              />
              {/* 🔽 ADDED PREVIEW LOGIC HERE 🔽 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payslip Preview</h3>
                {payslip ? (
                  <PayslipDisplay payslipData={payslip} />
                ) : (
                  <div className="text-center text-gray-500 mt-10">
                    <p>Select an employee and generate a payslip to see a preview.</p>
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <PrintManager
                    payslip={payslip}
                    employees={employees}
                    payslipDetails={payslipDetails}
                    setPayslipDetails={setPayslipDetails}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payslip History Section (assuming this is where it would go) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payslip History</h2>
          <PayslipHistory payslipHistory={payslipHistory} handleDeletePayslip={handleDeletePayslip} />
        </div>
      </main>
    </div>
  );
};

export default PayslipManagement;