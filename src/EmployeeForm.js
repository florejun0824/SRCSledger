// src/EmployeeForm.js
import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

const EmployeeForm = ({
  employee,
  setEmployee,
  employees,
  payslipDetails,
  setPayslipDetails,
  handleSaveEmployee,
  handleDeleteEmployee,
  resetForm,
  handleSelectEmployee,
  handleGeneratePayslip,
  payslipDeductions,
  setPayslipDeductions,
  // Receive utility functions for contributions
  getSssContribution,
  getPhilhealthContribution,
  getPagibigContribution,
  getCeapContribution,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const isEditing = !!employee.id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for the employee name to always be in uppercase
    if (name === 'name') {
      setEmployee(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  // Effect to automatically compute statutory contributions when basicSalary changes
  useEffect(() => {
    const basic = parseFloat(employee.basicSalary) || 0;
    setEmployee(prev => ({
      ...prev,
      sssContribution: getSssContribution(basic).toFixed(2),
      philhealthContribution: getPhilhealthContribution(basic).toFixed(2),
      pagibigContribution: getPagibigContribution(basic).toFixed(2),
      ceapContribution: getCeapContribution(basic).toFixed(2),
    }));
  }, [employee.basicSalary, setEmployee, getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution]);


  const handlePayslipDeductionChange = (e) => {
    const { name, value } = e.target;
    setPayslipDeductions(prev => ({ ...prev, [name]: value }));
  };

  const handleOtherDeductionChange = (index, e) => {
    const { name, value } = e.target;
    // Ensure payslipDeductions.otherDeductions is an array before spreading
    const newDeductions = [...(payslipDeductions?.otherDeductions || [])];
    newDeductions[index][name] = value;
    setPayslipDeductions(prev => ({ ...prev, otherDeductions: newDeductions }));
  };

  const handleAddOtherDeduction = () => {
    setPayslipDeductions(prev => ({
      ...prev,
      otherDeductions: [...(prev?.otherDeductions || []), { name: '', amount: '' }],
    }));
  };

  const handleRemoveOtherDeduction = (index) => {
    const newDeductions = (payslipDeductions?.otherDeductions || []).filter((_, i) => i !== index);
    setPayslipDeductions(prev => ({ ...prev, otherDeductions: newDeductions }));
  };

  const handleDeleteClick = (id) => {
    setEmployeeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      handleDeleteEmployee(employeeToDelete); // This should now correctly call the prop
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };
  
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
      {/* Select Employee Dropdown and New Employee Button */}
      <div className="mb-6 flex items-center gap-3"> {/* Increased gap for better spacing */}
        <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700 whitespace-nowrap">Select Employee:</label>
        <div className="relative flex-grow">
          <select
            id="employeeSelect"
            onChange={(e) => handleSelectEmployee(e.target.value)}
            value={isEditing ? employee.id : ''}
            className="block w-full pl-4 pr-10 py-2 text-base border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
          >
            <option value="">-- Select an Employee --</option>
            {(employees || []).map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          {/* Custom arrow for select dropdown */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <button
          onClick={resetForm} // Call resetForm to clear fields for a new employee
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 whitespace-nowrap"
        >
          New
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        {isEditing ? `Editing: ${employee.name}` : 'Create New Employee'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Employee Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={employee.name}
            onChange={handleInputChange}
            placeholder="JUAN DELA CRUZ"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID (Optional)</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={employee.employeeId}
            onChange={handleInputChange}
            placeholder="EMP-12345 (Optional)"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="basicSalary" className="block text-sm font-medium text-gray-700">Basic Salary</label>
          <input
            type="number"
            id="basicSalary"
            name="basicSalary"
            value={employee.basicSalary}
            onChange={handleInputChange}
            placeholder="0.00"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="costOfLivingAllowance" className="block text-sm font-medium text-gray-700">Cost of Living Allowance</label>
          <input
            type="number"
            id="costOfLivingAllowance"
            name="costOfLivingAllowance"
            value={employee.costOfLivingAllowance}
            onChange={handleInputChange}
            placeholder="0.00"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <h4 className="text-md font-medium text-gray-700">Statutory Contributions (Auto-computed)</h4>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="sssContribution" className="block text-xs font-medium text-gray-500">SSS Contribution</label>
              <input
                type="number"
                id="sssContribution"
                name="sssContribution"
                value={employee.sssContribution}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="philhealthContribution" className="block text-xs font-medium text-gray-500">Philhealth Contribution</label>
              <input
                type="number"
                id="philhealthContribution"
                name="philhealthContribution"
                value={employee.philhealthContribution}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="pagibigContribution" className="block text-xs font-medium text-gray-500">Pag-IBIG Contribution</label>
              <input
                type="number"
                id="pagibigContribution"
                name="pagibigContribution"
                value={employee.pagibigContribution}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="ceapContribution" className="block text-xs font-medium text-gray-500">CEAP Contribution</label>
              <input
                type="number"
                id="ceapContribution"
                name="ceapContribution"
                value={employee.ceapContribution}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h4 className="text-md font-medium text-gray-700 mb-2">Payslip Generation Deductions</h4>
        <p className="text-sm text-gray-500 mb-4">These fields are for the current payslip only and will not be saved to the employee's profile.</p>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sssLoan" className="block text-xs font-medium text-gray-500">SSS Loan</label>
              <input
                type="number"
                id="sssLoan"
                name="sssLoan"
                value={payslipDeductions?.sssLoan ?? ''}
                onChange={handlePayslipDeductionChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="pagibigLoanSTL" className="block text-xs font-medium text-gray-500">Pag-IBIG Loan-STL</label>
              <input
                type="number"
                id="pagibigLoanSTL"
                name="pagibigLoanSTL"
                value={payslipDeductions?.pagibigLoanSTL ?? ''}
                onChange={handlePayslipDeductionChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="pagibigLoanCL" className="block text-xs font-medium text-gray-500">Pag-IBIG Loan-CL</label>
              <input
                type="number"
                id="pagibigLoanCL"
                name="pagibigLoanCL"
                value={payslipDeductions?.pagibigLoanCL ?? ''}
                onChange={handlePayslipDeductionChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="personalLoan" className="block text-xs font-medium text-gray-500">Personal Loan</label>
              <input
                type="number"
                id="personalLoan"
                name="personalLoan"
                value={payslipDeductions?.personalLoan ?? ''}
                onChange={handlePayslipDeductionChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="cashAdvance" className="block text-xs font-medium text-gray-500">Cash Advance</label>
              <input
                type="number"
                id="cashAdvance"
                name="cashAdvance"
                value={payslipDeductions?.cashAdvance ?? ''}
                onChange={handlePayslipDeductionChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="canteen" className="block text-xs font-medium text-gray-500">Canteen</label>
              <input
                type="number"
                id="canteen"
                name="canteen"
                value={payslipDeductions?.canteen ?? ''}
                onChange={handlePayslipDeductionChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
            <label htmlFor="tithings" className="block text-sm font-medium text-gray-700">Tithings</label>
            <input
              type="number"
              id="tithings"
              name="tithings"
              value={payslipDeductions?.tithings ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-700 mt-4">Other Deductions (Custom)</h4>
          {payslipDeductions?.otherDeductions?.map((deduction, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <input
                type="text"
                name="name"
                value={deduction.name}
                onChange={(e) => handleOtherDeductionChange(index, e)}
                placeholder="Deduction Name"
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="number"
                name="amount"
                value={deduction.amount}
                onChange={(e) => handleOtherDeductionChange(index, e)}
                placeholder="Amount"
                className="w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveOtherDeduction(index)}
                className="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOtherDeduction}
            className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            + Add another deduction
          </button>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <div>
          <button
            onClick={handleGeneratePayslip}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
          >
            Generate Payslip
          </button>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => handleDeleteClick(employee.id)} // This now correctly calls handleDeleteClick
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSaveEmployee}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            {isEditing ? 'Update' : 'Save'}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
          >
            Clear
          </button>
        </div>
      </div>

      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
      />
    </div>
  );
};

export default EmployeeForm;