// src/PayslipDisplay.js
import React from 'react';

const PayslipDisplay = ({ payslipData }) => {
  if (!payslipData || !payslipData.name) {
    return null;
  }

  const {
    name,
    employeeId,
    startDate,
    endDate,
    basicSalary,
    costOfLivingAllowance,
    otherDeductions,
    sssContribution,
    philhealthContribution,
    pagibigContribution,
    ceapContribution,
    tithings,
    pagibigLoanSTL,
    pagibigLoanCL,
    pagibigLoanMPL, // Added
    sssLoan,
    personalLoan,
    cashAdvance,
    canteen,
    grossSalary,
    totalDeductions,
    netSalary,
    bookkeeperName,
  } = payslipData;

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    let date;
    if (typeof dateInput.toDate === 'function') {
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string' && dateInput.includes('-')) {
      date = new Date(`${dateInput}T00:00:00`);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return 'Invalid Date';
    }
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(numericAmount);
  };

  const DeductionItem = ({ label, value }) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) return null;
    return (
      <>
        <p>{label}:</p>
        <p className="text-right">{formatCurrency(numValue)}</p>
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 font-sans max-w-2xl mx-auto text-gray-800 printable-payslip">
      {/* Header Section */}
      <div className="text-center pb-4 mb-4 border-b border-gray-300">
        <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" className="mx-auto h-20 mb-2" />
        <h1 className="text-2xl font-extrabold text-gray-900">SAN RAMON CATHOLIC SCHOOL, INC.</h1>
        <p className="text-sm text-gray-600">Su-ay, Himamaylan City, Negros Occidental</p>
        <h2 className="text-xl font-bold text-gray-800 mt-4">PAYSLIP</h2>
        <p className="text-sm text-gray-500">
          For the period: {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </div>

      {/* Employee Details Section */}
      <div className="text-base mb-4 border-b border-gray-200 pb-4">
        <div className="flex justify-between mb-1">
          <span className="font-bold text-gray-700">Employee Name:</span>
          <span className="font-semibold">{name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-gray-700">Employee ID:</span>
          <span className="font-semibold">{employeeId || 'N/A'}</span>
        </div>
      </div>

      {/* Earnings & Deductions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {/* Earnings Section */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-700 mb-2 border-b-2 border-indigo-500 pb-1">EARNINGS</h3>
          <div className="grid grid-cols-2 gap-y-1 text-base">
            <p>Basic Salary:</p>
            <p className="text-right font-semibold">{formatCurrency(basicSalary)}</p>
            <DeductionItem label="COLA" value={costOfLivingAllowance} />
          </div>
           <div className="border-t-2 border-gray-300 mt-3 pt-3 flex justify-between items-center">
            <p className="font-extrabold text-gray-800 text-lg">Gross Salary:</p>
            <p className="text-right font-extrabold text-xl text-indigo-600">{formatCurrency(grossSalary)}</p>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-700 mb-2 border-b-2 border-red-500 pb-1">DEDUCTIONS</h3>
          <div className="grid grid-cols-2 gap-y-1 text-base">
            <DeductionItem label="SSS Contribution" value={sssContribution} />
            <DeductionItem label="Philhealth" value={philhealthContribution} />
            <DeductionItem label="Pag-IBIG Contrib." value={pagibigContribution} />
            <DeductionItem label="CEAP Contribution" value={ceapContribution} />
            <DeductionItem label="Tithings" value={tithings} />
            <DeductionItem label="Pag-IBIG Loan-STL" value={pagibigLoanSTL} />
            <DeductionItem label="Pag-IBIG Loan-CL" value={pagibigLoanCL} />
            <DeductionItem label="Pag-IBIG Loan-MPL" value={pagibigLoanMPL} />
            <DeductionItem label="SSS Loan" value={sssLoan} />
            <DeductionItem label="Personal Loan" value={personalLoan} />
            <DeductionItem label="Cash Advance" value={cashAdvance} />
            <DeductionItem label="Canteen" value={canteen} />
            {(otherDeductions || []).map((ded, index) => (
              <DeductionItem key={index} label={ded.name} value={ded.amount} />
            ))}
          </div>
           <div className="border-t-2 border-gray-300 mt-3 pt-3 flex justify-between items-center">
            <p className="font-extrabold text-gray-800 text-lg">Total Deductions:</p>
            <p className="text-right font-extrabold text-lg text-red-600">{formatCurrency(totalDeductions)}</p>
          </div>
        </div>
      </div>

      {/* Net Pay Section */}
      <div className="bg-gray-100 rounded-lg p-4 mt-6 flex justify-between items-center">
        <span className="text-2xl font-extrabold text-gray-900">NET PAY:</span>
        <span className="text-3xl font-extrabold text-green-600">{formatCurrency(netSalary)}</span>
      </div>

      {/* Signature Section */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm">
        <div>
          <div className="border-t-2 border-gray-400 w-3/4 mx-auto pt-2">
            <p className="font-bold text-base">{name}</p>
            <p className="text-gray-600 text-xs">Employee Signature</p>
          </div>
        </div>
        <div>
          <div className="border-t-2 border-gray-400 w-3/4 mx-auto pt-2">
            <p className="font-bold text-base">{bookkeeperName}</p>
            <p className="text-gray-600 text-xs">Bookkeeper Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDisplay;
