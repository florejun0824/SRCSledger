// src/EmployeeManagement.js
import React from 'react';
import { initialPayslipDeductionsState, initialPayslipDetails } from './App';
// Removed PayslipDisplay and PrintManager imports as they are no longer needed here.

const EmployeeManagement = ({
  employees,
  currentEmployee,
  setCurrentEmployee,
  payslip,
  setPayslip,
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
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setPayslipDeductions((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtherDeductionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDeductions = [...payslipDeductions.otherDeductions];
    updatedDeductions[index] = { ...updatedDeductions[index], [name]: value };
    setPayslipDeductions((prev) => ({ ...prev, otherDeductions: updatedDeductions }));
  };

  const handleAddOtherDeduction = () => {
    setPayslipDeductions((prev) => ({
      ...prev,
      otherDeductions: [...prev.otherDeductions, { name: '', amount: '' }],
    }));
  };

  const handleRemoveOtherDeduction = (index) => {
    const updatedDeductions = payslipDeductions.otherDeductions.filter((_, i) => i !== index);
    setPayslipDeductions((prev) => ({ ...prev, otherDeductions: updatedDeductions }));
  };

  const calculateStatutoryContributions = () => {
    const basic = parseFloat(currentEmployee.basicSalary) || 0;
    return {
      sss: getSssContribution(basic).toFixed(2),
      philhealth: getPhilhealthContribution(basic).toFixed(2),
      pagibig: getPagibigContribution(basic).toFixed(2),
      ceap: getCeapContribution(basic).toFixed(2),
    };
  };

  const statutoryContributions = calculateStatutoryContributions();

  return (
    <div className="flex flex-col gap-8">
      {/* Employee Management Form */}
      <div className="w-full bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Employee Management</h2>

        {/* Select Employee section moved here */}
        <div className="mb-4">
          <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700">
            Select Employee:
          </label>
          <div className="flex gap-2">
            <select
              id="employeeSelect"
              onChange={(e) => handleSelectEmployee(e.target.value)}
              value={currentEmployee.id || ''}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">-- New Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <button
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              New
            </button>
          </div>
        </div>

        {/* Employee Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Employee Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={currentEmployee.name}
            onChange={handleInputChange}
            placeholder="Enter employee name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Employee ID */}
        <div className="mb-4">
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee ID (Optional)
          </label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={currentEmployee.employeeId}
            onChange={handleInputChange}
            placeholder="Enter employee ID"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Salary and Allowance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="basicSalary" className="block text-sm font-medium text-gray-700">
              Basic Salary
            </label>
            <input
              type="number"
              id="basicSalary"
              name="basicSalary"
              value={currentEmployee.basicSalary}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="costOfLivingAllowance" className="block text-sm font-medium text-gray-700">
              Cost of Living Allowance
            </label>
            <input
              type="number"
              id="costOfLivingAllowance"
              name="costOfLivingAllowance"
              value={currentEmployee.costOfLivingAllowance}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Statutory Contributions */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Statutory Contributions (Auto-Computed)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <label htmlFor="sssContribution" className="text-xs text-gray-500 mb-1">
                SSS Contribution
              </label>
              <input
                type="text"
                id="sssContribution"
                name="sssContribution"
                value={statutoryContributions.sss}
                readOnly
                className="w-full text-center px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 sm:text-sm"
              />
            </div>
            <div className="flex flex-col items-center">
              <label htmlFor="philhealthContribution" className="text-xs text-gray-500 mb-1">
                Philhealth Contribution
              </label>
              <input
                type="text"
                id="philhealthContribution"
                name="philhealthContribution"
                value={statutoryContributions.philhealth}
                readOnly
                className="w-full text-center px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 sm:text-sm"
              />
            </div>
            <div className="flex flex-col items-center">
              <label htmlFor="pagibigContribution" className="text-xs text-gray-500 mb-1">
                Pag-IBIG Contribution
              </label>
              <input
                type="text"
                id="pagibigContribution"
                name="pagibigContribution"
                value={statutoryContributions.pagibig}
                readOnly
                className="w-full text-center px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 sm:text-sm"
              />
            </div>
            <div className="flex flex-col items-center">
              <label htmlFor="ceapContribution" className="text-xs text-gray-500 mb-1">
                CEAP Contribution
              </label>
              <input
                type="text"
                id="ceapContribution"
                name="ceapContribution"
                value={statutoryContributions.ceap}
                readOnly
                className="w-full text-center px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Deduction Inputs */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Deductions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pagibigLoanSTL" className="block text-sm font-medium text-gray-700">
                Pag-IBIG Loan-STL
              </label>
              <input
                type="number"
                id="pagibigLoanSTL"
                name="pagibigLoanSTL"
                value={payslipDeductions.pagibigLoanSTL}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="pagibigLoanCL" className="block text-sm font-medium text-gray-700">
                Pag-IBIG Loan-CL
              </label>
              <input
                type="number"
                id="pagibigLoanCL"
                name="pagibigLoanCL"
                value={payslipDeductions.pagibigLoanCL}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="sssLoan" className="block text-sm font-medium text-gray-700">
                SSS Loan
              </label>
              <input
                type="number"
                id="sssLoan"
                name="sssLoan"
                value={payslipDeductions.sssLoan}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="personalLoan" className="block text-sm font-medium text-gray-700">
                Personal Loan
              </label>
              <input
                type="number"
                id="personalLoan"
                name="personalLoan"
                value={payslipDeductions.personalLoan}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="cashAdvance" className="block text-sm font-medium text-gray-700">
                Cash Advance
              </label>
              <input
                type="number"
                id="cashAdvance"
                name="cashAdvance"
                value={payslipDeductions.cashAdvance}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="canteen" className="block text-sm font-medium text-gray-700">
                Canteen
              </label>
              <input
                type="number"
                id="canteen"
                name="canteen"
                value={payslipDeductions.canteen}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="tithings" className="block text-sm font-medium text-gray-700">
                Tithings
              </label>
              <input
                type="number"
                id="tithings"
                name="tithings"
                value={payslipDeductions.tithings}
                onChange={handleDeductionChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Other Deductions */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Other Deductions</h3>
          {payslipDeductions.otherDeductions.map((deduction, index) => (
            <div key={index} className="flex gap-4 mb-2 items-center">
              <input
                type="text"
                name="name"
                value={deduction.name}
                onChange={(e) => handleOtherDeductionChange(index, e)}
                placeholder="Deduction Name"
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              <input
                type="number"
                name="amount"
                value={deduction.amount}
                onChange={(e) => handleOtherDeductionChange(index, e)}
                placeholder="Amount"
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              <button
                onClick={() => handleRemoveOtherDeduction(index)}
                className="p-2 text-red-500 hover:text-red-700 transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={handleAddOtherDeduction}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
          >
            Add Other Deduction
          </button>
        </div>

        {/* Signatory Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="employeeSignatoryName" className="block text-sm font-medium text-gray-700">
              Employee Signatory Name
            </label>
            <input
              type="text"
              id="employeeSignatoryName"
              name="employeeSignatoryName"
              value={payslipDetails.employeeSignatoryName}
              onChange={(e) => setPayslipDetails({ ...payslipDetails, employeeSignatoryName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="adminSignatoryName" className="block text-sm font-medium text-gray-700">
              Admin Signatory Name
            </label>
            <input
              type="text"
              id="adminSignatoryName"
              name="adminSignatoryName"
              value={payslipDetails.adminSignatoryName}
              onChange={(e) => setPayslipDetails({ ...payslipDetails, adminSignatoryName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleGeneratePayslip}
            className="flex-1 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Generate Payslip
          </button>
          <button
            onClick={() => handleSaveEmployee()}
            className="flex-1 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Employee
          </button>
          <button
            onClick={() => handleDeleteEmployee(currentEmployee.id)}
            className="flex-1 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;