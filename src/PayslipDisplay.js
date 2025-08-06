// src/PayslipDisplay.js
import React from 'react';

const PayslipDisplay = ({ payslipData }) => {
  if (!payslipData) {
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
    grossSalary,
    totalDeductions,
    netSalary,
    bookkeeperName,
    employeeSignatoryName,
  } = payslipData;

  const otherDeductionsList = otherDeductions || [];

  return (
    <div className="bg-white rounded-xl shadow-inner p-4 text-xs font-sans max-w-full overflow-hidden">
      <div className="text-center mb-2">
        <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" className="mx-auto h-12 mb-2" />
        <h3 className="text-sm font-bold text-gray-900">SAN RAMON CATHOLIC SCHOOL, INC.</h3>
        <p className="text-gray-700 text-xs">Su-ay, Himamaylan City Negros Occidental</p>
      </div>

      <div className="payslip-content text-gray-800">
        <div className="border-t border-b border-gray-300 py-2">
          <p className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-600">Employee Name:</span>
            <span className="font-bold text-right">{name}</span>
          </p>
          <p className="flex justify-between items-center text-xs mt-1">
            <span className="font-semibold text-gray-600">Employee ID:</span>
            <span className="font-bold text-right">{employeeId}</span>
          </p>
          <p className="flex justify-between items-center text-xs mt-1">
            <span className="font-semibold text-gray-600">Payslip Period:</span>
            <span className="font-bold text-right">
              {startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'N/A'}
            </span>
          </p>
        </div>

        <div className="mt-4">
          <h4 className="text-xs font-bold text-indigo-700 border-b pb-1 mb-2">Earnings</h4>
          <div className="flex justify-between text-xs mb-1">
            <span>Basic Salary:</span>
            <span className="font-medium">PHP {parseFloat(basicSalary).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Cost of Living Allowance:</span>
            <span className="font-medium">PHP {parseFloat(costOfLivingAllowance).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-xs font-bold text-red-700 border-b pb-1 mb-2">Deductions</h4>
          <div className="flex justify-between text-xs mb-1">
            <span>SSS Contribution:</span>
            <span className="font-medium">PHP {parseFloat(sssContribution).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>PhilHealth Contribution:</span>
            <span className="font-medium">PHP {parseFloat(philhealthContribution).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>Pag-IBIG Contribution:</span>
            <span className="font-medium">PHP {parseFloat(pagibigContribution).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>CEAP Contribution:</span>
            <span className="font-medium">PHP {parseFloat(ceapContribution).toFixed(2)}</span>
          </div>
          {otherDeductionsList.map((deduction, index) => (
            <div key={index} className="flex justify-between text-xs mb-1">
              <span>{deduction.name}:</span>
              <span className="font-medium">PHP {parseFloat(deduction.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-2 border-t border-gray-300">
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span>Gross Salary:</span>
            <span className="text-indigo-600">PHP {parseFloat(grossSalary).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span>Total Deductions:</span>
            <span className="text-red-600">PHP {parseFloat(totalDeductions).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2">
            <span className="text-green-700">Net Salary:</span>
            <span className="text-green-700">PHP {parseFloat(netSalary).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-300 text-center">
        <div className="inline-block mx-4">
          <p className="font-bold text-xs border-b border-black min-w-[150px] pb-1">{bookkeeperName}</p>
          <p className="text-xs text-gray-600">Bookkeeper</p>
        </div>
        <div className="inline-block mx-4">
          <p className="font-bold text-xs border-b border-black min-w-[150px] pb-1">{employeeSignatoryName}</p>
          <p className="text-xs text-gray-600">Employee</p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDisplay;