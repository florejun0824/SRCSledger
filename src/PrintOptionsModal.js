// src/PrintOptionsModal.js
import React from 'react';

const PrintOptionsModal = ({
  showPrintOptionsModal,
  handleClosePrintOptions, // ✅ FIXED: Use the correct prop name
  printOption,
  setPrintOption,
  employees,
  selectedEmployeesForPrint,
  handleSelectEmployeesForPrint,
  executePrint,
  payslip,
  payslipDetails,
  setPayslipDetails
}) => {
  if (!showPrintOptionsModal) {
    return null;
  }

  const handleBookkeeperNameChange = (e) => {
    setPayslipDetails(prev => ({ ...prev, bookkeeperName: e.target.value }));
  };

  const employeesToDisplay = employees || [];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg transform scale-100 transition-transform">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Print Payslips</h2>

        {/* Bookkeeper's Name Input */}
        <div className="mb-6">
          <label htmlFor="bookkeeperName" className="block text-sm font-medium text-gray-700 mb-1">Bookkeeper's Name</label>
          <input
            type="text"
            id="bookkeeperName"
            value={payslipDetails?.bookkeeperName || ''}
            onChange={handleBookkeeperNameChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
            placeholder="Enter Bookkeeper's Name"
          />
        </div>
        
        {/* Print Options */}
        <div className="space-y-4 mb-6">
          {/* Print Current Payslip */}
          <div className="flex items-start">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-indigo-600 mt-1"
              name="printOption"
              id="printCurrent"
              value="current"
              checked={printOption === 'current'}
              onChange={(e) => setPrintOption(e.target.value)}
            />
            <label htmlFor="printCurrent" className="ml-3 text-gray-700">
              <span className="font-semibold block">Print Current Payslip</span>
              <span className="text-sm text-gray-500 block">(2 copies on a single page)</span>
              {!payslip && printOption === 'current' && (
                <p className="text-red-500 text-sm mt-1">No payslip generated to print.</p>
              )}
            </label>
          </div>

          {/* Print Selected Employees */}
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="printOption"
                id="printSelected"
                value="selected"
                checked={printOption === 'selected'}
                onChange={(e) => setPrintOption(e.target.value)}
              />
              <label htmlFor="printSelected" className="ml-3 text-gray-700">
                <span className="font-semibold block">Print Selected Employees</span>
                <span className="text-sm text-gray-500 block">(2 payslips per page)</span>
              </label>
            </div>
            {printOption === 'selected' && (
              <select
                multiple
                className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-32"
                onChange={handleSelectEmployeesForPrint}
                value={selectedEmployeesForPrint}
              >
                {employeesToDisplay.length === 0 ? (
                  <option value="" disabled>No employees available</option>
                ) : (
                  employeesToDisplay.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (ID: {emp.employeeId || 'N/A'})
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Print All Employees */}
          <div className="flex items-start">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-indigo-600 mt-1"
              name="printOption"
              id="printAll"
              value="all"
              checked={printOption === 'all'}
              onChange={(e) => setPrintOption(e.target.value)}
            />
            <label htmlFor="printAll" className="ml-3 text-gray-700">
              <span className="font-semibold block">Print All Employees</span>
              <span className="text-sm text-gray-500 block">(2 payslips per page)</span>
              {employeesToDisplay.length === 0 && printOption === 'all' && (
                <p className="text-red-500 text-sm mt-1">No employees found to print.</p>
              )}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleClosePrintOptions}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-300 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={executePrint}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              (printOption === 'current' && !payslip) ||
              (printOption === 'selected' && selectedEmployeesForPrint.length === 0) ||
              (printOption === 'all' && employeesToDisplay.length === 0)
            }
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintOptionsModal;