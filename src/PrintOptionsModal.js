// src/PrintOptionsModal.js
import React from 'react';

const PrintOptionsModal = ({
  showPrintOptionsModal,
  handleClosePrintOptions,
  printOption,
  setPrintOption,
  executePrint,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isPayslipPreview,
}) => {
  if (!showPrintOptionsModal) return null;

  const handlePrint = () => {
    executePrint();
  };

  const isPrintButtonDisabled = printOption === 'all' && (!startDate || !endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">Print Options</h2>
          <button onClick={handleClosePrintOptions} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Print Type Selection */}
        <div className="mb-6">
          <p className="text-md font-semibold text-gray-700 mb-3">Select what to print:</p>
          <div className="space-y-3">
            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${printOption === 'current' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input
                type="radio"
                name="printOption"
                value="current"
                checked={printOption === 'current'}
                onChange={() => setPrintOption('current')}
                className="form-radio h-5 w-5 text-indigo-600 transition-colors cursor-pointer"
                disabled={isPayslipPreview}
              />
              <span className="ml-3 text-gray-700 font-medium">Print Current Payslip</span>
            </label>
            {!isPayslipPreview && (
              <label className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${printOption === 'all' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="printOption"
                    value="all"
                    checked={printOption === 'all'}
                    onChange={() => setPrintOption('all')}
                    className="form-radio h-5 w-5 text-indigo-600 transition-colors cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Print All Payslips in Date Range</span>
                </div>
                
                {/* Date Range Picker - only visible when "Print All" is selected */}
                {printOption === 'all' && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleClosePrintOptions}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrintButtonDisabled}
            className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${
              isPrintButtonDisabled ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintOptionsModal;