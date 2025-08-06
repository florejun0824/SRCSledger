import React, { useEffect } from 'react';
// Corrected import path for utils
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';

const EmployeeForm = ({
  employee,
  employees,
  payslipDetails,
  handleChange,
  handlePayslipDetailsChange,
  handleDeductionChange,
  handleAddDeductionField,
  handleRemoveDeductionField,
  handleSelectEmployee,
  handleSaveEmployee,
  handleDeleteEmployee,
  resetForm,
  setEmployee
}) => {

  // Effect to automatically calculate contributions when basicSalary changes
  useEffect(() => {
    const basic = parseFloat(employee.basicSalary) || 0;
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      sssContribution: getSssContribution(basic),
      philhealthContribution: getPhilhealthContribution(basic),
      pagibigContribution: getPagibigContribution(basic),
      ceapContribution: getCeapContribution(basic),
    }));
  }, [employee.basicSalary, setEmployee, getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution]); // Added all dependencies for useCallback functions

  return (
    <div className="mb-8 p-6 bg-blue-50 rounded-xl shadow-inner">
      <h2 className="text-2xl font-semibold text-blue-800 mb-6">Manage Employees</h2>
      <div className="mb-4">
        <label htmlFor="selectEmployee" className="block text-sm font-medium text-gray-700 mb-1">Select Existing Employee:</label>
        <select
          id="selectEmployee"
          onChange={handleSelectEmployee}
          value={employee.id || ""}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
        >
          <option value="">-- Select an Employee --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} (ID: {emp.employeeId || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Employee Details for Payslip</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={employee.name}
            onChange={handleChange}
            placeholder="Juan Dela Cruz"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* Employee ID Input (Optional) */}
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID (Optional)</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={employee.employeeId}
            onChange={handleChange}
            placeholder="EMP-PH-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* Basic Salary Input */}
        <div>
          <label htmlFor="basicSalary" className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (PHP)</label>
          <input
            type="number"
            id="basicSalary"
            name="basicSalary"
            value={employee.basicSalary}
            onChange={handleChange}
            placeholder="25000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* Cost of Living Allowance Input */}
        <div>
          <label htmlFor="costOfLivingAllowance" className="block text-sm font-medium text-gray-700 mb-1">Cost of Living Allowance (PHP)</label>
          <input
            type="number"
            id="costOfLivingAllowance"
            name="costOfLivingAllowance"
            value={employee.costOfLivingAllowance}
            onChange={handleChange}
            placeholder="3000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* SSS Contribution Display */}
        <div>
          <label htmlFor="sssContribution" className="block text-sm font-medium text-gray-700 mb-1">SSS Contribution (PHP)</label>
          <input
            type="text"
            id="sssContribution"
            name="sssContribution"
            value={employee.sssContribution.toFixed(2)}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* PhilHealth Contribution Display */}
        <div>
          <label htmlFor="philhealthContribution" className="block text-sm font-medium text-gray-700 mb-1">PhilHealth Contribution (PHP)</label>
          <input
            type="text"
            id="philhealthContribution"
            name="philhealthContribution"
            value={employee.philhealthContribution.toFixed(2)}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* Pag-IBIG Contribution Display */}
        <div>
          <label htmlFor="pagibigContribution" className="block text-sm font-medium text-gray-700 mb-1">Pag-IBIG Contribution (PHP)</label>
          <input
            type="text"
            id="pagibigContribution"
            name="pagibigContribution"
            value={employee.pagibigContribution.toFixed(2)}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        {/* CEAP Contribution Display */}
        <div>
          <label htmlFor="ceapContribution" className="block text-sm font-medium text-gray-700 mb-1">CEAP Contribution (PHP)</label>
          <input
            type="text"
            id="ceapContribution"
            name="ceapContribution"
            value={employee.ceapContribution.toFixed(2)}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* Dynamic Other Deductions Section */}
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-700 mb-2">Other Deductions:</h4>
        {employee.otherDeductions.map((deduction, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Deduction Name"
              value={deduction.name}
              onChange={(e) => handleDeductionChange(index, 'name', e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Amount (PHP)"
              value={deduction.amount}
              onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
              className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleRemoveDeductionField(index)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={handleAddDeductionField}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition duration-150 ease-in-out"
        >
          Add Other Deduction
        </button>
      </div>

      {/* Payslip Date Range Input */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Payslip Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={payslipDetails.startDate}
            onChange={handlePayslipDetailsChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Payslip End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={payslipDetails.endDate}
            onChange={handlePayslipDetailsChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* Signatories Input */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="bookkeeperName" className="block text-sm font-medium text-gray-700 mb-1">Bookkeeper's Name</label>
          <input
            type="text"
            id="bookkeeperName"
            name="bookkeeperName"
            value={payslipDetails.bookkeeperName}
            onChange={handlePayslipDetailsChange}
            placeholder="Maria Santos"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label htmlFor="employeeSignatoryName" className="block text-sm font-medium text-gray-700 mb-1">Employee's Name (for Signatory)</label>
          <input
            type="text"
            id="employeeSignatoryName"
            name="employeeSignatoryName"
            value={payslipDetails.employeeSignatoryName}
            onChange={handlePayslipDetailsChange}
            placeholder="Juan Dela Cruz"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* Action Buttons for Employee Management */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleSaveEmployee}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {employee.id ? 'Update Employee' : 'Add New Employee'}
        </button>
        {employee.id && (
          <button
            onClick={handleDeleteEmployee}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Employee
          </button>
        )}
        <button
          onClick={resetForm}
          className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Clear Form
        </button>
      </div>
    </div>
  );
};

export default EmployeeForm;
