// src/EmployeeManagement.js
import React, { useContext } from 'react';
import { EmployeeContext } from './EmployeeContext';
import { FaTrashAlt, FaSave, FaPlus, FaTimes, FaUserPlus, FaFileInvoiceDollar } from 'react-icons/fa';

const EmployeeManagement = ({
  employees,
  currentEmployee,
  setCurrentEmployee,
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
  const { setGeneratedPayslip } = useContext(EmployeeContext);

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
  const handleGeneratePayslipClick = async () => {
    const newPayslip = await handleGeneratePayslip();
    if (newPayslip) {
      setGeneratedPayslip(newPayslip);
    }
  };

  const isEditing = !!currentEmployee.id;

  const inputClass = "w-full p-4 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="flex flex-col gap-10">
      {/* Employee Management Form */}
      <div className="w-full bg-gray-50 rounded-3xl p-8 lg:p-12 shadow-inner-xl border border-gray-200">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8 pb-4 border-b border-gray-200">Employee Management</h2>

        {/* Select Employee and New Button */}
        <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
          <label htmlFor="employeeSelect" className="block text-base font-semibold text-gray-700 whitespace-nowrap flex-shrink-0">
            Select Employee:
          </label>
          <div className="relative flex-grow">
            <select
              id="employeeSelect"
              onChange={(e) => handleSelectEmployee(e.target.value)}
              value={currentEmployee.id || ''}
              className={`block w-full pl-5 pr-12 py-3 text-lg border border-gray-300 rounded-xl shadow-inner-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 appearance-none bg-white text-gray-800`}
            >
              <option value="">-- New Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <FaUserPlus className="h-5 w-5" />
            <span>New</span>
          </button>
        </div>

        {/* Employee Details Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={labelClass}>Employee Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={currentEmployee.name}
                onChange={handleInputChange}
                placeholder="E.g., JUAN DELA CRUZ"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="employeeId" className={labelClass}>Employee ID (Optional)</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={currentEmployee.employeeId}
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
                value={currentEmployee.basicSalary}
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
                value={currentEmployee.costOfLivingAllowance}
                onChange={handleInputChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Statutory Contributions Section */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Statutory Contributions (Auto-Computed)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-inner">
              <label htmlFor="sssContribution" className="text-sm font-semibold text-gray-500 mb-2">SSS Contribution</label>
              <input
                type="text"
                id="sssContribution"
                name="sssContribution"
                value={statutoryContributions.sss}
                readOnly
                className="w-full text-center px-4 py-2 border-none rounded-lg bg-gray-100 text-gray-700 font-bold text-lg"
              />
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-inner">
              <label htmlFor="philhealthContribution" className="text-sm font-semibold text-gray-500 mb-2">Philhealth</label>
              <input
                type="text"
                id="philhealthContribution"
                name="philhealthContribution"
                value={statutoryContributions.philhealth}
                readOnly
                className="w-full text-center px-4 py-2 border-none rounded-lg bg-gray-100 text-gray-700 font-bold text-lg"
              />
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-inner">
              <label htmlFor="pagibigContribution" className="text-sm font-semibold text-gray-500 mb-2">Pag-IBIG</label>
              <input
                type="text"
                id="pagibigContribution"
                name="pagibigContribution"
                value={statutoryContributions.pagibig}
                readOnly
                className="w-full text-center px-4 py-2 border-none rounded-lg bg-gray-100 text-gray-700 font-bold text-lg"
              />
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-inner">
              <label htmlFor="ceapContribution" className="text-sm font-semibold text-gray-500 mb-2">CEAP</label>
              <input
                type="text"
                id="ceapContribution"
                name="ceapContribution"
                value={statutoryContributions.ceap}
                readOnly
                className="w-full text-center px-4 py-2 border-none rounded-lg bg-gray-100 text-gray-700 font-bold text-lg"
              />
            </div>
          </div>
        </div>

        {/* Deduction Inputs */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Payslip Deductions</h3>
          <p className="text-sm text-gray-500 mb-6">These fields are for the current payslip only.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div>
              <label htmlFor="sssLoan" className={labelClass}>SSS Loan</label>
              <input
                type="number"
                id="sssLoan"
                name="sssLoan"
                value={payslipDeductions.sssLoan}
                onChange={handleDeductionChange}
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
                value={payslipDeductions.pagibigLoanSTL}
                onChange={handleDeductionChange}
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
                value={payslipDeductions.pagibigLoanCL}
                onChange={handleDeductionChange}
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
                value={payslipDeductions.personalLoan}
                onChange={handleDeductionChange}
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
                value={payslipDeductions.cashAdvance}
                onChange={handleDeductionChange}
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
                value={payslipDeductions.canteen}
                onChange={handleDeductionChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="tithings" className={labelClass}>Tithings</label>
              <input
                type="number"
                id="tithings"
                name="tithings"
                value={payslipDeductions.tithings}
                onChange={handleDeductionChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Other Deductions */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Other Deductions (Custom)</h3>
          <div className="space-y-4">
            {payslipDeductions.otherDeductions.map((deduction, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-xl shadow-inner">
                <input
                  type="text"
                  name="name"
                  value={deduction.name}
                  onChange={(e) => handleOtherDeductionChange(index, e)}
                  placeholder="Deduction Name"
                  className="flex-1 w-full p-3 border-none rounded-lg bg-white shadow-inner-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="amount"
                  value={deduction.amount}
                  onChange={(e) => handleOtherDeductionChange(index, e)}
                  placeholder="Amount"
                  className="w-full sm:w-40 p-3 border-none rounded-lg bg-white shadow-inner-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveOtherDeduction(index)}
                  className="p-3 text-red-500 hover:text-red-700 transition duration-300 rounded-full hover:bg-red-100"
                  title="Remove this deduction"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOtherDeduction}
            className="mt-6 flex items-center gap-3 text-blue-600 hover:text-blue-800 text-base font-semibold transition-colors rounded-xl p-3 hover:bg-blue-50"
          >
            <FaPlus className="h-5 w-5" />
            <span>Add another deduction</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={handleGeneratePayslipClick}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
          >
            <FaFileInvoiceDollar className="h-5 w-5" />
            <span>Generate Payslip</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSaveEmployee()}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
            >
              <FaSave className="h-5 w-5" />
              <span>{isEditing ? 'Update Employee' : 'Save Employee'}</span>
            </button>
            {isEditing && (
              <button
                onClick={() => handleDeleteEmployee(currentEmployee.id)}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
              >
                <FaTrashAlt className="h-5 w-5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;