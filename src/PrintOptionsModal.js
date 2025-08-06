import React from 'react';

const PrintOptionsModal = ({
  showPrintOptionsModal,
  printOption,
  setPrintOption,
  employees,
  selectedEmployeesForPrint,
  handleSelectEmployeesForPrint,
  handleClosePrintOptions,
  executePrint,
  payslip // Pass payslip to check if current payslip exists
}) => {
  if (!showPrintOptionsModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Print Options</h2>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-indigo-600"
              name="printOption"
              value="current"
              checked={printOption === 'current'}
              onChange={(e) => setPrintOption(e.target.value)}
            />
            <span className="ml-2 text-gray-700">Print Current Payslip (2 copies)</span>
          </label>
          {!payslip && printOption === 'current' && (
            <p className="text-red-500 text-sm ml-6 mt-1">No payslip generated to print.</p>
          )}
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-indigo-600"
              name="printOption"
              value="selected"
              checked={printOption === 'selected'}
              onChange={(e) => setPrintOption(e.target.value)}
            />
            <span className="ml-2 text-gray-700">Print Selected Employees (2 copies each)</span>
          </label>
          {printOption === 'selected' && (
            <select
              multiple
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-32"
              onChange={handleSelectEmployeesForPrint}
              value={selectedEmployeesForPrint}
            >
              {employees.length === 0 ? (
                <option value="" disabled>No employees available</option>
              ) : (
                employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: {emp.employeeId || 'N/A'})
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-indigo-600"
              name="printOption"
              value="all"
              checked={printOption === 'all'}
              onChange={(e) => setPrintOption(e.target.value)}
            />
            <span className="ml-2 text-gray-700">Print All Employees (2 copies each)</span>
          </label>
          {employees.length === 0 && printOption === 'all' && (
            <p className="text-red-500 text-sm ml-6 mt-1">No employees found to print.</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleClosePrintOptions}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={executePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
            disabled={
              (printOption === 'current' && !payslip) ||
              (printOption === 'selected' && selectedEmployeesForPrint.length === 0) ||
              (printOption === 'all' && employees.length === 0)
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
