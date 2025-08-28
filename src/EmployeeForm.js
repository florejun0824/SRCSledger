// src/EmployeeForm.js
import React, { useState, useEffect, useRef } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { FaTrashAlt, FaSave, FaPlus, FaTimes, FaUserPlus, FaFileInvoiceDollar, FaCheckCircle, FaUndo, FaChevronDown, FaSearch } from 'react-icons/fa';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const isEditing = !!employee.id;

  // Effect to handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // Only auto-compute if basicSalary is a valid number
    if (employee.basicSalary && !isNaN(employee.basicSalary)) {
      const basic = parseFloat(employee.basicSalary);
      setEmployee(prev => ({
        ...prev,
        sssContribution: getSssContribution(basic).toFixed(2),
        philhealthContribution: getPhilhealthContribution(basic).toFixed(2),
        pagibigContribution: getPagibigContribution(basic).toFixed(2),
        ceapContribution: getCeapContribution(basic).toFixed(2),
      }));
    }
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

  const handleSelectAndClose = (id) => {
    handleSelectEmployee(id);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };
  
  const filteredEmployees = (employees || []).filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full p-4 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-neumorphic-light border border-gray-200 w-full">
      {/* Header and Employee Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-0">
          {isEditing ? `Editing: ${employee.name || 'Employee'}` : 'New Employee Profile'}
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <label htmlFor="employeeSelect" className="block text-base font-semibold text-gray-700 self-center whitespace-nowrap">Select Employee:</label>
          {/* --- HIGHLY ENHANCED DROPDOWN --- */}
          <div className="relative flex-grow sm:flex-grow-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="block w-full min-w-[250px] pl-5 pr-4 py-3 text-lg border-none rounded-2xl shadow-neumorphic-inset-light focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 bg-gray-50 text-gray-800 flex items-center justify-between text-left"
            >
              <span className={isEditing ? 'text-gray-800 font-semibold' : 'text-gray-500'}>
                {employee.name || '-- Select an Employee --'}
              </span>
              <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute mt-2 w-full origin-top-right bg-white rounded-xl shadow-2xl z-20 ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <ul className="max-h-60 overflow-y-auto p-2">
                  <li
                    onClick={() => handleSelectAndClose('')}
                    className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-indigo-50 text-gray-700 font-semibold"
                  >
                    -- Select an Employee --
                  </li>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <li
                        key={emp.id}
                        onClick={() => handleSelectAndClose(emp.id)}
                        className="flex items-center justify-between p-3 cursor-pointer rounded-lg hover:bg-indigo-50 transition-colors duration-150"
                      >
                        <span className="font-medium text-gray-800">{emp.name}</span>
                        {emp.employeeId && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{emp.employeeId}</span>}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2.5 text-center text-gray-500 italic">No matches found.</li>
                  )}
                </ul>
              </div>
          </div>
          {/* --- END ENHANCED DROPDOWN --- */}
          <button
            onClick={resetForm}
            className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-neumorphic-light hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            title="Create a new employee profile"
          >
            <FaUserPlus className="h-5 w-5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Employee Details Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelClass}>Employee Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={employee.name}
              onChange={handleInputChange}
              placeholder="e.g., DELA CRUZ, JUAN C."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="employeeId" className={labelClass}>Employee ID (Optional)</label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={employee.employeeId}
              onChange={handleInputChange}
              placeholder="E.g., EMP-12345"
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="basicSalary" className={labelClass}>Basic Salary</label>
            <input
              type="number"
              id="basicSalary"
              name="basicSalary"
              value={employee.basicSalary}
              onChange={handleInputChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="costOfLivingAllowance" className={labelClass}>Cost of Living Allowance</label>
            <input
              type="number"
              id="costOfLivingAllowance"
              name="costOfLivingAllowance"
              value={employee.costOfLivingAllowance}
              onChange={handleInputChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Statutory Contributions Section -- NOW EDITABLE */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-2xl font-bold text-gray-800 mb-4">Statutory Contributions</h4>
        <p className="text-sm text-gray-500 mb-6">Auto-computed from Basic Salary. Can be manually overridden.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label htmlFor="sssContribution" className={labelClass}>SSS Contribution</label>
            <input
              type="number"
              id="sssContribution"
              name="sssContribution"
              value={employee.sssContribution}
              onChange={handleInputChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="philhealthContribution" className={labelClass}>Philhealth</label>
            <input
              type="number"
              id="philhealthContribution"
              name="philhealthContribution"
              value={employee.philhealthContribution}
              onChange={handleInputChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pagibigContribution" className={labelClass}>Pag-IBIG</label>
            <input
              type="number"
              id="pagibigContribution"
              name="pagibigContribution"
              value={employee.pagibigContribution}
              onChange={handleInputChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ceapContribution" className={labelClass}>CEAP</label>
            <input
              type="number"
              id="ceapContribution"
              name="ceapContribution"
              value={employee.ceapContribution}
              onChange={handleInputChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Payslip Deductions Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-2xl font-bold text-gray-800 mb-4">Payslip Deductions</h4>
        <p className="text-sm text-gray-500 mb-6">These fields are for the current payslip only and will not be saved to the employee's profile.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="sssLoan" className={labelClass}>SSS Loan</label>
            <input
              type="number"
              id="sssLoan"
              name="sssLoan"
              value={payslipDeductions?.sssLoan ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pagibigLoanSTL" className={labelClass}>Pag-IBIG Loan-STL</label>
            <input
              type="number"
              id="pagibigLoanSTL"
              name="pagibigLoanSTL"
              value={payslipDeductions?.pagibigLoanSTL ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pagibigLoanCL" className={labelClass}>Pag-IBIG Loan-CL</label>
            <input
              type="number"
              id="pagibigLoanCL"
              name="pagibigLoanCL"
              value={payslipDeductions?.pagibigLoanCL ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="personalLoan" className={labelClass}>Personal Loan</label>
            <input
              type="number"
              id="personalLoan"
              name="personalLoan"
              value={payslipDeductions?.personalLoan ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cashAdvance" className={labelClass}>Cash Advance</label>
            <input
              type="number"
              id="cashAdvance"
              name="cashAdvance"
              value={payslipDeductions?.cashAdvance ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="canteen" className={labelClass}>Canteen</label>
            <input
              type="number"
              id="canteen"
              name="canteen"
              value={payslipDeductions?.canteen ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label htmlFor="tithings" className={labelClass}>Tithings</label>
            <input
              type="number"
              id="tithings"
              name="tithings"
              value={payslipDeductions?.tithings ?? ''}
              onChange={handlePayslipDeductionChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>
        
        {/* Other Deductions Section */}
        <div className="mt-8">
          <h4 className="text-2xl font-bold text-gray-800 mb-6">Other Deductions (Custom)</h4>
          <div className="space-y-4">
            {payslipDeductions?.otherDeductions?.map((deduction, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="text"
                  name="name"
                  value={deduction.name}
                  onChange={(e) => handleOtherDeductionChange(index, e)}
                  placeholder="Deduction Name"
                  className="flex-1 w-full border-none rounded-2xl shadow-neumorphic-inset-light py-3 px-5 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 bg-gray-50 text-gray-800"
                />
                <input
                  type="number"
                  name="amount"
                  value={deduction.amount}
                  onChange={(e) => handleOtherDeductionChange(index, e)}
                  placeholder="Amount"
                  className="w-full sm:w-40 border-none rounded-2xl shadow-neumorphic-inset-light py-3 px-5 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 bg-gray-50 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOtherDeduction(index)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors self-center p-3 rounded-full hover:bg-red-50"
                  title="Remove this deduction"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOtherDeduction}
            className="mt-6 flex items-center gap-3 text-indigo-600 hover:text-indigo-800 text-base font-semibold transition-colors rounded-xl p-3 hover:bg-indigo-50"
          >
            <FaPlus className="h-5 w-5" />
            <span>Add another deduction</span>
          </button>
        </div>
      </div>
      
      {/* Action Buttons Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <button
          onClick={handleGeneratePayslip}
          className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-neumorphic-indigo hover:shadow-neumorphic-hover-indigo transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
        >
          <FaFileInvoiceDollar className="h-5 w-5" />
          <span>Generate Payslip</span>
        </button>
        <div className="flex flex-wrap justify-center gap-4">
          {isEditing && (
            <button
              onClick={() => handleDeleteClick(employee.id)}
              className="px-6 py-3 bg-red-500 text-white rounded-full shadow-neumorphic-red hover:shadow-neumorphic-hover-red transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <FaTrashAlt className="h-5 w-5" />
              <span>Delete</span>
            </button>
          )}
          <button
            onClick={handleSaveEmployee}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow-neumorphic-green hover:shadow-neumorphic-hover-green transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <FaSave className="h-5 w-5" />
            <span>{isEditing ? 'Update' : 'Save'}</span>
          </button>
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full shadow-neumorphic-light hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <FaUndo className="h-5 w-5" />
            <span>Clear</span>
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