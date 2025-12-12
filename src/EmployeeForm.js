// src/EmployeeForm.js
import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTrash, faBroom, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const EmployeeForm = ({
  employee,
  setEmployee,
  employees,
  handleSaveEmployee,
  handleDeleteEmployee,
  resetForm,
  handleSelectEmployee,
  handleGeneratePayslip,
  payslipDetails, // This prop replaces payslipDeductions
  setPayslipDetails, // This prop replaces setPayslipDeductions
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
    if (name === 'name') {
      setEmployee(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

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

  // This function now handles updating the employee state for one-time deductions
  const handleEmployeeDeductionChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // This function now handles updating the payslipDetails state for tithings
  const handlePayslipDetailsChange = (e) => {
    const { name, value } = e.target;
    setPayslipDetails(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleOtherDeductionChange = (index, e) => {
    const { name, value } = e.target;
    const newDeductions = [...(employee?.otherDeductions || [])];
    newDeductions[index][name] = value;
    setEmployee(prev => ({ ...prev, otherDeductions: newDeductions }));
  };

  const handleAddOtherDeduction = () => {
    setEmployee(prev => ({
      ...prev,
      otherDeductions: [...(prev?.otherDeductions || []), { name: '', amount: '' }],
    }));
  };

  const handleRemoveOtherDeduction = (index) => {
    const newDeductions = (employee?.otherDeductions || []).filter((_, i) => i !== index);
    setEmployee(prev => ({ ...prev, otherDeductions: newDeductions }));
  };

  const handleDeleteClick = (id) => {
    setEmployeeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      handleDeleteEmployee(employeeToDelete);
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };
  
  const inputStyle = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition";
  const labelStyle = "block text-sm font-medium text-slate-400 mb-1";

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <div className="mb-6">
        <label htmlFor="employeeSelect" className={labelStyle}>Select Employee</label>
        <div className="flex items-center gap-2">
          <select
            id="employeeSelect"
            onChange={(e) => handleSelectEmployee(e.target.value)}
            value={isEditing ? employee.id : ''}
            className={inputStyle}
          >
            <option value="">-- Select or Create New --</option>
            {(employees || []).map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-cyan-500 text-slate-900 font-bold rounded-lg shadow-md hover:bg-cyan-400 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faBroom} /> New
          </button>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
        {isEditing ? `Editing: ${employee.name}` : 'Create New Employee'}
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelStyle}>Employee Name</label>
            <input type="text" id="name" name="name" value={employee.name} onChange={handleInputChange} placeholder="JUAN DELA CRUZ" className={inputStyle} />
          </div>
          <div>
            <label htmlFor="employeeId" className={labelStyle}>Employee ID</label>
            <input type="text" id="employeeId" name="employeeId" value={employee.employeeId} onChange={handleInputChange} placeholder="EMP-12345" className={inputStyle} />
          </div>
          <div>
            <label htmlFor="basicSalary" className={labelStyle}>Basic Salary</label>
            <input type="number" id="basicSalary" name="basicSalary" value={employee.basicSalary} onChange={handleInputChange} placeholder="0.00" className={inputStyle} />
          </div>
          <div>
            <label htmlFor="costOfLivingAllowance" className={labelStyle}>COLA</label>
            <input type="number" id="costOfLivingAllowance" name="costOfLivingAllowance" value={employee.costOfLivingAllowance} onChange={handleInputChange} placeholder="0.00" className={inputStyle} />
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-slate-300">Statutory (Auto-computed)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div><label className="block text-xs font-medium text-slate-500">SSS</label><input type="text" value={employee.sssContribution} readOnly className={`${inputStyle} bg-slate-900 cursor-not-allowed`} /></div>
            <div><label className="block text-xs font-medium text-slate-500">Philhealth</label><input type="text" value={employee.philhealthContribution} readOnly className={`${inputStyle} bg-slate-900 cursor-not-allowed`} /></div>
            <div><label className="block text-xs font-medium text-slate-500">Pag-IBIG</label><input type="text" value={employee.pagibigContribution} readOnly className={`${inputStyle} bg-slate-900 cursor-not-allowed`} /></div>
            <div><label className="block text-xs font-medium text-slate-500">CEAP</label><input type="text" value={employee.ceapContribution} readOnly className={`${inputStyle} bg-slate-900 cursor-not-allowed`} /></div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-700 pt-4">
        <h4 className="text-lg font-semibold text-white mb-2">One-Time Deductions</h4>
        <p className="text-xs text-slate-500 mb-4">These fields apply only to the next generated payslip and do not save to the employee profile.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div><label htmlFor="pagibigLoanSTL" className="block text-xs font-medium text-slate-500">Pag-IBIG Loan-STL</label><input type="number" id="pagibigLoanSTL" name="pagibigLoanSTL" value={employee.pagibigLoanSTL ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div><label htmlFor="pagibigLoanCL" className="block text-xs font-medium text-slate-500">Pag-IBIG Loan-CL</label><input type="number" id="pagibigLoanCL" name="pagibigLoanCL" value={employee.pagibigLoanCL ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div><label htmlFor="pagibigLoanMPL" className="block text-xs font-medium text-slate-500">Pag-IBIG Loan-MPL</label><input type="number" id="pagibigLoanMPL" name="pagibigLoanMPL" value={employee.pagibigLoanMPL ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div><label htmlFor="sssLoan" className="block text-xs font-medium text-slate-500">SSS Loan</label><input type="number" id="sssLoan" name="sssLoan" value={employee.sssLoan ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div><label htmlFor="personalLoan" className="block text-xs font-medium text-slate-500">Personal Loan</label><input type="number" id="personalLoan" name="personalLoan" value={employee.personalLoan ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div><label htmlFor="cashAdvance" className="block text-xs font-medium text-slate-500">Cash Advance</label><input type="number" id="cashAdvance" name="cashAdvance" value={employee.cashAdvance ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div><label htmlFor="canteen" className="block text-xs font-medium text-slate-500">Canteen</label><input type="number" id="canteen" name="canteen" value={employee.canteen ?? ''} onChange={handleEmployeeDeductionChange} placeholder="0.00" className={inputStyle}/></div>
            <div className="sm:col-span-1"><label htmlFor="tithings" className="block text-xs font-medium text-slate-500">Tithings</label><input type="number" id="tithings" name="tithings" value={payslipDetails?.tithings ?? ''} onChange={handlePayslipDetailsChange} placeholder="0.00" className={inputStyle}/></div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-md font-medium text-white">Other Custom Deductions</h4>
          {employee?.otherDeductions?.map((deduction, index) => (
            <div key={index} className="flex gap-2 mt-2 items-center">
              <input type="text" name="name" value={deduction.name} onChange={(e) => handleOtherDeductionChange(index, e)} placeholder="Deduction Name" className={`${inputStyle} flex-1`}/>
              <input type="number" name="amount" value={deduction.amount} onChange={(e) => handleOtherDeductionChange(index, e)} placeholder="Amount" className={`${inputStyle} w-32`}/>
              <button type="button" onClick={() => handleRemoveOtherDeduction(index)} className="text-red-500 hover:text-red-400 font-bold text-2xl transition">&times;</button>
            </div>
          ))}
          <button type="button" onClick={handleAddOtherDeduction} className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-2"><FontAwesomeIcon icon={faPlus} /> Add deduction</button>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t-2 border-slate-700">
        <div className="flex justify-between items-center">
            <button onClick={handleGeneratePayslip} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faPaperPlane} /> Generate Payslip
            </button>
            <div className="flex gap-2">
                <button onClick={handleSaveEmployee} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition flex items-center gap-2">
                    <FontAwesomeIcon icon={faSave} /> {isEditing ? 'Update' : 'Save'}
                </button>
                {isEditing && (
                    <button onClick={() => handleDeleteClick(employee.id)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 transition flex items-center gap-2">
                        <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                )}
            </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
      />
    </div>
  );
};

export default EmployeeForm;