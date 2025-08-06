// src/EmployeeForm.js
import React from 'react';

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
}) => {
  const isEditing = !!employee.id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleDeductionChange = (index, e) => {
    const { name, value } = e.target;
    const newDeductions = [...employee.otherDeductions];
    newDeductions[index][name] = value;
    setEmployee(prev => ({ ...prev, otherDeductions: newDeductions }));
  };

  const handleAddDeduction = () => {
    setEmployee(prev => ({
      ...prev,
      otherDeductions: [...prev.otherDeductions, { name: '', amount: '' }],
    }));
  };

  const handleRemoveDeduction = (index) => {
    const newDeductions = employee.otherDeductions.filter((_, i) => i !== index);
    setEmployee(prev => ({ ...prev, otherDeductions: newDeductions }));
  };

  const handlePayslipDetailsChange = (e) => {
    const { name, value } = e.target;
    setPayslipDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-inner border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>

      <div className="space-y-4">
        <label htmlFor="selectEmployee" className="block text-sm font-medium text-gray-700">Select Employee</label>
        <select
          id="selectEmployee"
          value={employee.id || ''}
          onChange={handleSelectEmployee}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">-- Select an Employee --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={employee.name}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />

        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
        <input
          type="text"
          id="employeeId"
          name="employeeId"
          value={employee.employeeId}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        
        <label htmlFor="basicSalary" className="block text-sm font-medium text-gray-700">Basic Salary</label>
        <input
          type="number"
          id="basicSalary"
          name="basicSalary"
          value={employee.basicSalary}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />

        <label htmlFor="costOfLivingAllowance" className="block text-sm font-medium text-gray-700">Cost of Living Allowance</label>
        <input
          type="number"
          id="costOfLivingAllowance"
          name="costOfLivingAllowance"
          value={employee.costOfLivingAllowance}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        
        {/* New fields for manual contribution input */}
        <label htmlFor="sssContribution" className="block text-sm font-medium text-gray-700">SSS Contribution</label>
        <input
          type="number"
          id="sssContribution"
          name="sssContribution"
          value={employee.sssContribution}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        
        <label htmlFor="philhealthContribution" className="block text-sm font-medium text-gray-700">PhilHealth Contribution</label>
        <input
          type="number"
          id="philhealthContribution"
          name="philhealthContribution"
          value={employee.philhealthContribution}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        
        <label htmlFor="pagibigContribution" className="block text-sm font-medium text-gray-700">Pag-IBIG Contribution</label>
        <input
          type="number"
          id="pagibigContribution"
          name="pagibigContribution"
          value={employee.pagibigContribution}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        
        <label htmlFor="ceapContribution" className="block text-sm font-medium text-gray-700">CEAP Contribution</label>
        <input
          type="number"
          id="ceapContribution"
          name="ceapContribution"
          value={employee.ceapContribution}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Other Deductions</h4>
          {employee.otherDeductions.map((deduction, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                name="name"
                value={deduction.name}
                onChange={(e) => handleDeductionChange(index, e)}
                placeholder="Deduction Name"
                className="w-2/3 border-gray-300 rounded-lg shadow-sm text-sm"
              />
              <input
                type="number"
                name="amount"
                value={deduction.amount}
                onChange={(e) => handleDeductionChange(index, e)}
                placeholder="Amount"
                className="w-1/3 border-gray-300 rounded-lg shadow-sm text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemoveDeduction(index)}
                className="p-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddDeduction}
            className="w-full px-4 py-2 mt-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Add Deduction
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Payslip Period From</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={payslipDetails.startDate}
              onChange={handlePayslipDetailsChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Payslip Period To</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={payslipDetails.endDate}
              onChange={handlePayslipDetailsChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={handleSaveEmployee}
          className="px-3 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          {isEditing ? 'Save Changes' : 'Add Employee'}
        </button>
        {isEditing && (
          <button
            onClick={() => handleDeleteEmployee(employee.id)}
            className="px-3 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Delete Employee
          </button>
        )}
        <button
          onClick={resetForm}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
        >
          {isEditing ? 'Cancel' : 'Clear Form'}
        </button>
        {isEditing && (
          <button
            onClick={() => handleGeneratePayslip()}
            className="px-3 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Generate Payslip
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;