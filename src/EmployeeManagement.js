// src/EmployeeManagement.js
import React, { useContext, useEffect, useState, useRef } from 'react';
import { FaTrashAlt, FaSave, FaUserPlus, FaTimes, FaFileInvoiceDollar, FaUndo, FaPlus, FaChevronDown, FaSearch } from 'react-icons/fa';
import { EmployeeContext } from './EmployeeContext';

const EmployeeManagement = ({
  employees,
  currentEmployee,
  setCurrentEmployee,
  payslipDeductions,
  setPayslipDeductions,
  handleSaveEmployee,
  handleDeleteEmployee,
  handleGeneratePayslip,
  resetForm,
  handleSelectEmployee,
  getSssContribution,
  getPhilhealthContribution,
  getPagibigContribution,
  getCeapContribution,
}) => {
  // --- NO CHANGES TO LOGIC, STATE, OR PROPS ---
  const { setSelectedPayslipData, setShowPayslipModal } = useContext(EmployeeContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

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
    if (name === 'name') {
      setCurrentEmployee((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (currentEmployee.basicSalary && !isNaN(currentEmployee.basicSalary)) {
      const basic = parseFloat(currentEmployee.basicSalary);
      setCurrentEmployee(prev => ({
        ...prev,
        sssContribution: getSssContribution(basic).toFixed(2),
        philhealthContribution: getPhilhealthContribution(basic).toFixed(2),
        pagibigContribution: getPagibigContribution(basic).toFixed(2),
        ceapContribution: getCeapContribution(basic).toFixed(2),
      }));
    }
  }, [currentEmployee.basicSalary, setCurrentEmployee, getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution]);
  
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
      otherDeductions: [...(prev.otherDeductions || []), { name: '', amount: '' }],
    }));
  };

  const handleRemoveOtherDeduction = (index) => {
    const updatedDeductions = payslipDeductions.otherDeductions.filter((_, i) => i !== index);
    setPayslipDeductions((prev) => ({ ...prev, otherDeductions: updatedDeductions }));
  };

  const handleGeneratePayslipClick = async () => {
    if (!currentEmployee.id) {
      alert("Please select or save an employee first.");
      return;
    }
    await handleGeneratePayslip();
  };
  
  const handleSelectAndClose = (id) => {
    handleSelectEmployee(id);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };
  
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEditing = !!currentEmployee.id;

  const inputClass = "form-input-ios";
  const labelClass = "block text-sm font-semibold text-slate-600 mb-2";
  const sectionCardClass = "card-style";
  const sectionTitleClass = "text-lg font-semibold text-slate-800 mb-4";

  return (
    <div className="space-y-8">
      {/* Employee Selector & Actions */}
      <div className={sectionCardClass}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full" ref={dropdownRef}>
            <label htmlFor="employeeSelect" className={labelClass}>Select Employee</label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputClass} w-full flex items-center justify-between text-left font-semibold`}
            >
              <span className={currentEmployee.id ? 'text-slate-800' : 'text-slate-400'}>
                {currentEmployee.name || 'Select from list or create new'}
              </span>
              <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute mt-2 w-full origin-top-right bg-white rounded-xl shadow-lg z-20 border border-slate-200/75 focus:outline-none transition-all duration-200 ease-out ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
              <div className="p-2">
                <div className="relative">
                  <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-ios w-full pl-10"
                  />
                </div>
              </div>
              <ul className="max-h-60 overflow-y-auto p-2">
                <li
                  onClick={() => handleSelectAndClose('')}
                  className="px-3 py-2.5 text-sm cursor-pointer rounded-lg hover:bg-indigo-50 text-indigo-600 font-semibold"
                >
                  -- New Employee --
                </li>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <li
                      key={emp.id}
                      onClick={() => handleSelectAndClose(emp.id)}
                      className="flex items-center justify-between text-sm p-3 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors duration-150"
                    >
                      <span className="font-medium text-slate-800">{emp.name}</span>
                      {emp.employeeId && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{emp.employeeId}</span>}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2.5 text-sm text-center text-slate-500">No employees found.</li>
                )}
              </ul>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-full md:w-auto mt-4 md:mt-8 flex-shrink-0 px-5 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaUserPlus />
            <span>New Profile</span>
          </button>
        </div>
      </div>

      {/* Employee Details Form */}
      <div className={sectionCardClass}>
        <h3 className={sectionTitleClass}>Employee Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>Employee Full Name</label>
            <input type="text" id="name" name="name" value={currentEmployee.name} onChange={handleInputChange} placeholder="e.g., DELA CRUZ, JUAN C." className={inputClass} />
          </div>
          <div>
            <label htmlFor="employeeId" className={labelClass}>Employee ID (Optional)</label>
            <input type="text" id="employeeId" name="employeeId" value={currentEmployee.employeeId} onChange={handleInputChange} placeholder="E.g., EMP-12345" className={inputClass} />
          </div>
          <div>
            <label htmlFor="basicSalary" className={labelClass}>Basic Salary</label>
            <input type="number" id="basicSalary" name="basicSalary" value={currentEmployee.basicSalary} onChange={handleInputChange} placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label htmlFor="costOfLivingAllowance" className={labelClass}>Cost of Living Allowance</label>
            <input type="number" id="costOfLivingAllowance" name="costOfLivingAllowance" value={currentEmployee.costOfLivingAllowance} onChange={handleInputChange} placeholder="0.00" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Statutory Contributions Section */}
      <div className={sectionCardClass}>
        <h3 className={sectionTitleClass}>Statutory Contributions</h3>
        <p className="text-xs text-slate-500 -mt-2 mb-4">Auto-computed from Basic Salary. Can be manually overridden.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
              <label htmlFor="sssContribution" className={labelClass}>SSS</label>
              <input type="number" id="sssContribution" name="sssContribution" value={currentEmployee.sssContribution || ''} onChange={handleInputChange} className={inputClass} placeholder="0.00" />
          </div>
          <div>
              <label htmlFor="philhealthContribution" className={labelClass}>PhilHealth</label>
              <input type="number" id="philhealthContribution" name="philhealthContribution" value={currentEmployee.philhealthContribution || ''} onChange={handleInputChange} className={inputClass} placeholder="0.00" />
          </div>
          <div>
              <label htmlFor="pagibigContribution" className={labelClass}>Pag-IBIG</label>
              <input type="number" id="pagibigContribution" name="pagibigContribution" value={currentEmployee.pagibigContribution || ''} onChange={handleInputChange} className={inputClass} placeholder="0.00" />
          </div>
          <div>
              <label htmlFor="ceapContribution" className={labelClass}>CEAP</label>
              <input type="number" id="ceapContribution" name="ceapContribution" value={currentEmployee.ceapContribution || ''} onChange={handleInputChange} className={inputClass} placeholder="0.00" />
          </div>
        </div>
      </div>

      {/* Payslip Deductions Section */}
      <div className={sectionCardClass}>
         <h3 className={sectionTitleClass}>Payslip Deductions</h3>
         <p className="text-xs text-slate-500 -mt-2 mb-4">These fields are for the current payslip only and will not be saved to the employee's profile.</p>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {['sssLoan', 'pagibigLoanSTL', 'pagibigLoanCL', 'personalLoan', 'cashAdvance', 'canteen', 'tithings'].map(field => {
                const label = field.replace(/([A-Z])/g, ' $1').replace('STL', '-STL').replace('CL', '-CL').replace(/^./, (str) => str.toUpperCase());
                return (
                    <div key={field}>
                        <label htmlFor={field} className={labelClass}>{label}</label>
                        <input type="number" id={field} name={field} value={payslipDeductions[field] ?? ''} onChange={handleDeductionChange} placeholder="0.00" className={inputClass} />
                    </div>
                );
            })}
         </div>
      </div>

      {/* Other Deductions */}
      <div className={sectionCardClass}>
          <h3 className={sectionTitleClass}>Other Deductions (Custom)</h3>
          <div className="space-y-4">
              {(payslipDeductions.otherDeductions || []).map((deduction, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 items-center">
                      <input type="text" name="name" value={deduction.name} onChange={(e) => handleOtherDeductionChange(index, e)} placeholder="Deduction Name" className={`${inputClass} flex-1`} />
                      <input type="number" name="amount" value={deduction.amount} onChange={(e) => handleOtherDeductionChange(index, e)} placeholder="Amount" className={`${inputClass} w-full sm:w-40`} />
                      <button onClick={() => handleRemoveOtherDeduction(index)} className="p-3 text-red-500 hover:text-red-700 transition duration-300 rounded-full hover:bg-red-100/50 self-center sm:self-auto" title="Remove deduction">
                          <FaTimes className="h-5 w-5" />
                      </button>
                  </div>
              ))}
          </div>
          <button onClick={handleAddOtherDeduction} className="mt-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors rounded-lg p-2 hover:bg-indigo-50">
              <FaPlus />
              <span>Add another deduction</span>
          </button>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* MODIFIED: Smaller padding and font size for all buttons in this section */}
          <button
            onClick={handleGeneratePayslipClick}
            disabled={!isEditing}
            className="btn-primary w-full md:w-auto text-sm font-semibold px-5 py-2.5 flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
              <FaFileInvoiceDollar className="h-4 w-4" />
              <span>Generate Payslip</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                  onClick={() => handleSaveEmployee()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                  <FaSave className="h-4 w-4" />
                  <span>{isEditing ? 'Update Profile' : 'Save'}</span>
              </button>
              {isEditing && (
                  <button
                      onClick={() => handleDeleteEmployee(currentEmployee.id)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                      <FaTrashAlt className="h-4 w-4" />
                      <span>Delete</span>
                  </button>
              )}
               <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <FaUndo className="h-4 w-4" />
                  <span>Clear</span>
                </button>
          </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;