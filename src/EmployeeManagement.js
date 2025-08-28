// src/EmployeeManagement.js
import React, { useContext, useEffect } from 'react';
import { FaTrashAlt, FaSave, FaUserPlus, FaTimes, FaFileInvoiceDollar, FaUndo, FaPlus } from 'react-icons/fa';
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
  const { setSelectedPayslipData, setShowPayslipModal } = useContext(EmployeeContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for the employee name to always be in uppercase
    if (name === 'name') {
      setCurrentEmployee((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Effect to automatically compute statutory contributions when basicSalary changes
  useEffect(() => {
    // Only auto-compute if basicSalary is a valid number
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

  const isEditing = !!currentEmployee.id;

  // Common styling classes for form elements
  const inputClass = "block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-300";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const sectionCardClass = "bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80 shadow-sm";
  const sectionTitleClass = "text-xl font-bold text-slate-800 mb-6";

  return (
    <div className="space-y-10">
      {/* Employee Selector & Actions */}
      <div className={`${sectionCardClass} -m-1`}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <label htmlFor="employeeSelect" className={labelClass}>Select Employee</label>
            <select
              id="employeeSelect"
              onChange={(e) => handleSelectEmployee(e.target.value)}
              value={currentEmployee.id || ''}
              className={`${inputClass} font-semibold`}
            >
              <option value="">-- New Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={resetForm}
            className="w-full md:w-auto mt-4 md:mt-7 flex-shrink-0 px-5 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
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
            <input type="text" id="name" name="name" value={currentEmployee.name} onChange={handleInputChange} placeholder="JUAN DELA CRUZ" className={inputClass} />
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

      {/* Statutory Contributions Section -- NOW EDITABLE */}
      <div className={sectionCardClass}>
        <h3 className={sectionTitleClass}>Statutory Contributions</h3>
        <p className="text-xs text-slate-500 -mt-4 mb-6">Auto-computed from Basic Salary. Can be manually overridden.</p>
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
         <p className="text-xs text-slate-500 -mt-4 mb-6">These fields are for the current payslip only and will not be saved to the employee's profile.</p>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {['sssLoan', 'pagibigLoanSTL', 'pagibigLoanCL', 'personalLoan', 'cashAdvance', 'canteen', 'tithings'].map(field => {
                const label = field.replace(/([A-Z])/g, ' $1').replace('STL', '-STL').replace('CL', '-CL').trim();
                const name = field.charAt(0).toLowerCase() + field.slice(1);
                return (
                    <div key={name}>
                        <label htmlFor={name} className={labelClass}>{label}</label>
                        <input type="number" id={name} name={name} value={payslipDeductions[name] ?? ''} onChange={handleDeductionChange} placeholder="0.00" className={inputClass} />
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
                      <button onClick={() => handleRemoveOtherDeduction(index)} className="p-3 text-red-500 hover:text-red-700 transition duration-300 rounded-full hover:bg-red-100 self-center sm:self-auto" title="Remove deduction">
                          <FaTimes className="h-5 w-5" />
                      </button>
                  </div>
              ))}
          </div>
          <button onClick={handleAddOtherDeduction} className="mt-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors rounded-lg p-2 hover:bg-blue-50">
              <FaPlus />
              <span>Add another deduction</span>
          </button>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            onClick={handleGeneratePayslipClick}
            disabled={!isEditing}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
          >
              <FaFileInvoiceDollar />
              <span>Generate Payslip</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                  onClick={() => handleSaveEmployee()}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                  <FaSave />
                  <span>{isEditing ? 'Update Profile' : 'Save Employee'}</span>
              </button>
              {isEditing && (
                  <button
                      onClick={() => handleDeleteEmployee(currentEmployee.id)}
                      className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                      <FaTrashAlt />
                      <span>Delete</span>
                  </button>
              )}
               <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaUndo />
                  <span>Clear</span>
                </button>
          </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;