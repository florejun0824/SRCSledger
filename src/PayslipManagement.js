// src/PayslipManagement.js
import React from 'react';
import EmployeeForm from './EmployeeForm';
import PayslipDisplay from './PayslipDisplay';
import PayslipHistory from './PayslipHistory';
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
        {/* Employee Form & Payslip Preview Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Details & Payslip Generation</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Employee Form */}
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
              />
              
              {/* Payslip Display */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Payslip Preview</h3>
                {payslip ? (
                  <>
                    <PayslipDisplay payslipData={payslip} />
                    <div className="mt-6 flex justify-center">
                      <PrintManager
                        payslip={payslip}
                        employees={employees}
                        payslipDetails={payslipDetails}
                        setPayslipDetails={setPayslipDetails}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-10">Generate a payslip to see a preview here.</div>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
        </div>

        {/* Payslip History Section */}
        <div className="lg:col-span-1">
          <PayslipHistory
            payslipHistory={payslipHistory}
            employees={employees}
            payslipDetails={payslipDetails}
            setPayslipDetails={setPayslipDetails}
            handleDeletePayslip={handleDeletePayslip}
          />
        </div>
      </main>
    </div>
  );
};

export default PayslipManagement;