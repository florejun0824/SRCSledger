// src/PrintOptionsModal.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PrintOptionsModal = ({
  showPrintOptionsModal,
  handleClosePrintOptions,
  printOption,
  setPrintOption,
  employees,
  selectedEmployeesForPrint,
  handleSelectEmployeesForPrint,
  executePrint,
  payslip,
  payslipDetails,
  setPayslipDetails,
  startDate,
  endDate,
}) => {
  const [printStartDate, setPrintStartDate] = useState(startDate);
  const [printEndDate, setPrintEndDate] = useState(endDate);

  useEffect(() => {
    if (showPrintOptionsModal) {
      setPrintStartDate(startDate);
      setPrintEndDate(endDate);
    }
  }, [startDate, endDate, showPrintOptionsModal]);

  if (!showPrintOptionsModal) {
    return null;
  }

  const handleBookkeeperNameChange = (e) => {
    setPayslipDetails(prev => ({ ...prev, bookkeeperName: e.target.value }));
  };

  const handlePrintClick = () => {
    if (printOption === 'current') {
      executePrint();
    } else {
      executePrint({ printStartDate, printEndDate });
    }
  };

  const employeesToDisplay = employees || [];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform scale-100 transition-transform">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Print Payslips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Config */}
          <div className="flex flex-col gap-6">
            <div>
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

            <div>
              <h3 className="block text-sm font-medium text-gray-700 mb-1">Pay Period for Printing</h3>
              <div className="space-y-2 p-3 rounded-xl border border-gray-300">
                  <div className="flex flex-col">
                      <label htmlFor="printStartDate" className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                      <DatePicker
                          selected={printStartDate}
                          onChange={(date) => setPrintStartDate(date)}
                          dateFormat="MMMM d, yyyy"
                          className="w-full bg-transparent border-0 text-gray-800 text-sm focus:outline-none focus:ring-0 p-0"
                          id="printStartDate"
                      />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="flex flex-col">
                      <label htmlFor="printEndDate" className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                      <DatePicker
                          selected={printEndDate}
                          onChange={(date) => setPrintEndDate(date)}
                          dateFormat="MMMM d, yyyy"
                          className="w-full bg-transparent border-0 text-gray-800 text-sm focus:outline-none focus:ring-0 p-0"
                          id="printEndDate"
                      />
                  </div>
              </div>
            </div>
          </div>

          {/* Right Column: Options */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start p-3 border rounded-lg">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600 mt-1 flex-shrink-0"
                name="printOption"
                id="printCurrent"
                value="current"
                checked={printOption === 'current'}
                onChange={(e) => setPrintOption(e.target.value)}
              />
              <label htmlFor="printCurrent" className="ml-3 text-gray-700">
                <span className="font-semibold block">Print Current Payslip</span>
                <span className="text-sm text-gray-500 block">(Prints the currently viewed payslip)</span>
                {!payslip && printOption === 'current' && (
                  <p className="text-red-500 text-xs mt-1">No payslip generated to print.</p>
                )}
              </label>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-start">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-indigo-600 mt-1 flex-shrink-0"
                  name="printOption"
                  id="printSelected"
                  value="selected"
                  checked={printOption === 'selected'}
                  onChange={(e) => setPrintOption(e.target.value)}
                />
                <label htmlFor="printSelected" className="ml-3 text-gray-700">
                  <span className="font-semibold block">Print Selected Employees</span>
                  <span className="text-sm text-gray-500 block">(Generates new payslips for selection)</span>
                </label>
              </div>
              {printOption === 'selected' && (
                <select
                  multiple
                  className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-32 text-gray-800"
                  onChange={handleSelectEmployeesForPrint}
                  value={selectedEmployeesForPrint}
                >
                  {employeesToDisplay.length === 0 ? (
                    <option value="" disabled>No employees available</option>
                  ) : (
                    employeesToDisplay.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="flex items-start p-3 border rounded-lg">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600 mt-1 flex-shrink-0"
                name="printOption"
                id="printAll"
                value="all"
                checked={printOption === 'all'}
                onChange={(e) => setPrintOption(e.target.value)}
              />
              <label htmlFor="printAll" className="ml-3 text-gray-700">
                <span className="font-semibold block">Print All Employees</span>
                <span className="text-sm text-gray-500 block">(Generates new payslips for all)</span>
                {employeesToDisplay.length === 0 && printOption === 'all' && (
                  <p className="text-red-500 text-xs mt-1">No employees found to print.</p>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 border-t pt-6">
          <button
            onClick={handleClosePrintOptions}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-300 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handlePrintClick}
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