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
    sssLoan,
    personalLoan,
    cashAdvance,
    canteen,
    grossSalary,
    totalDeductions,
    netSalary,
    bookkeeperName,
  } = payslipData;

  // ========= ROBUST DATE FORMATTING FUNCTION START =========
  const formatDate = (dateInput) => {
    if (!dateInput) return 'Invalid Date';

    let date;
    // Handles Firestore Timestamp objects, which have a toDate() method
    if (typeof dateInput.toDate === 'function') {
      date = dateInput.toDate();
    }
    // Handles date strings in 'YYYY-MM-DD' format
    else if (typeof dateInput === 'string' && dateInput.includes('-')) {
      // Use a reliable way to create a Date object from a YYYY-MM-DD string
      date = new Date(`${dateInput}T00:00:00`);
    }
    // Handles standard JavaScript Date objects
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    // If format is unknown, return 'Invalid Date'
    else {
      return 'Invalid Date';
    }

    // Final check to ensure the created date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  // ========= ROBUST DATE FORMATTING FUNCTION END =========

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(numericAmount);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 font-sans max-w-2xl mx-auto text-gray-800">
      {/* Header Section */}
      <div className="text-center pb-3 mb-3 border-b border-gray-300 payslip-print-header">
        <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" className="mx-auto h-16 mb-1" />
        <h1 className="text-xl font-bold">SAN RAMON CATHOLIC SCHOOL, INC.</h1>
        <p className="text-xs text-gray-600">Su-ay, Himamaylan City, Negros Occidental</p>
        <h2 className="text-lg font-semibold text-gray-700 mt-3">PAYSLIP</h2>
        <p className="text-xs text-gray-500">
          Period: {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </div>

      {/* Employee Details Section */}
      <div className="text-sm mb-4 border-b border-gray-200 pb-3">
        <div className="flex justify-between mb-1">
          <span className="font-semibold text-gray-700">Employee Name:</span>
          <span>{name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Employee ID:</span>
          <span>{employeeId}</span>
        </div>
      </div>

      {/* Earnings Section */}
      <div className="mb-4">
        <h3 className="text-md font-bold text-gray-700 mb-2 border-b pb-1">EARNINGS</h3>
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <p>Basic Salary:</p>
          <p className="text-right font-semibold">{formatCurrency(basicSalary)}</p>
          {costOfLivingAllowance > 0 && (
            <>
              <p>Cost of Living Allowance:</p>
              <p className="text-right font-semibold">{formatCurrency(costOfLivingAllowance)}</p>
            </>
          )}
          <div className="col-span-2 border-t mt-2 pt-2 flex justify-between items-center">
            <p className="font-bold text-gray-800">Gross Salary:</p>
            <p className="text-right font-bold text-lg text-indigo-600">{formatCurrency(grossSalary)}</p>
          </div>
        </div>
      </div>

      {/* Deductions Section */}
      <div className="mb-4">
        <h3 className="text-md font-bold text-gray-700 mb-2 border-b pb-1">DEDUCTIONS</h3>
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <p>SSS Contribution:</p>
          <p className="text-right">{formatCurrency(sssContribution)}</p>
          <p>Philhealth Contribution:</p>
          <p className="text-right">{formatCurrency(philhealthContribution)}</p>
          <p>Pag-IBIG Contribution:</p>
          <p className="text-right">{formatCurrency(pagibigContribution)}</p>
          <p>CEAP Contribution:</p>
          <p className="text-right">{formatCurrency(ceapContribution)}</p>
          {tithings > 0 && (
            <>
              <p>Tithings:</p>
              <p className="text-right">{formatCurrency(tithings)}</p>
            </>
          )}
          {pagibigLoanSTL > 0 && (
            <>
              <p>Pag-IBIG Loan-STL:</p>
              <p className="text-right">{formatCurrency(pagibigLoanSTL)}</p>
            </>
          )}
          {pagibigLoanCL > 0 && (
            <>
              <p>Pag-IBIG Loan-CL:</p>
              <p className="text-right">{formatCurrency(pagibigLoanCL)}</p>
            </>
          )}
          {sssLoan > 0 && (
            <>
              <p>SSS Loan:</p>
              <p className="text-right">{formatCurrency(sssLoan)}</p>
            </>
          )}
          {personalLoan > 0 && (
            <>
              <p>Personal Loan:</p>
            <p className="text-right">{formatCurrency(personalLoan)}</p>
            </>
          )}
          {cashAdvance > 0 && (
            <>
              <p>Cash Advance:</p>
              <p className="text-right">{formatCurrency(cashAdvance)}</p>
            </>
          )}
          {canteen > 0 && (
            <>
              <p>Canteen:</p>
              <p className="text-right">{formatCurrency(canteen)}</p>
            </>
          )}
          {(otherDeductions || []).map((ded, index) => (
            ded.amount > 0 && (
              <React.Fragment key={index}>
                <p>{ded.name}:</p>
                <p className="text-right">{formatCurrency(ded.amount)}</p>
              </React.Fragment>
            )
          ))}
          <div className="col-span-2 border-t mt-2 pt-2 flex justify-between items-center">
            <p className="font-bold text-gray-800">Total Deductions:</p>
            <p className="text-right font-bold">{formatCurrency(totalDeductions)}</p>
          </div>
        </div>
      </div>

      {/* Net Pay Section */}
      <div className="text-xl font-bold border-t-2 pt-4 mt-6 flex justify-between items-center text-gray-800">
        <span>NET PAY:</span>
        <span className="text-green-700">{formatCurrency(netSalary)}</span>
      </div>

      {/* Signature Section */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-center text-sm">
        <div>
          <div className="signature-line-placeholder"></div> {/* Placeholder for signature */}
          <p className="font-semibold">{name}</p>
          <p className="text-gray-600 text-xs">Employee Signature</p>
        </div>
        <div>
          <div className="signature-line-placeholder"></div> {/* Placeholder for signature */}
          <p className="font-semibold">{bookkeeperName}</p>
          <p className="text-gray-600 text-xs">Bookkeeper Signature</p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDisplay;