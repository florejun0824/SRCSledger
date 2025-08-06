import React from 'react';

// Component for rendering a single payslip (for both display and print)
const PayslipDisplay = ({ payslipData }) => {
  return (
    <div className="payslip-container print:w-[4.25in] print:h-[6.5in] print:p-[0.25in] print:border print:border-gray-300 print:m-[0.1in] print:box-border print:flex print:flex-col print:justify-between print:page-break-inside-avoid">
      {/* Payslip Header */}
      <div className="payslip-header print:text-center print:mb-[0.2rem]">
        <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" className="print:max-width-[0.75in] print:height-auto print:mx-auto print:mb-[0.1rem] mx-auto h-16 mb-1" /> {/* Adjusted max-width for print */}
        <h3 className="print:text-[0.75rem] print:font-bold print:mb-[0.05rem] text-lg font-bold text-gray-900">SAN RAMON CATHOLIC SCHOOL, INC.</h3>
        <p className="print:text-[0.65rem] text-gray-700 text-sm">Su-ay, Himamaylan City Negros Occidental</p>
      </div>
      <div className="payslip-content">
        <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between items-center py-1 border-b border-gray-200">
          <span className="font-medium text-gray-600 print:text-[0.65rem]">Employee Name:</span>
          <span className="font-semibold text-gray-800 print:text-[0.65rem]">{payslipData.name || 'N/A'}</span>
        </div>
        <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between items-center py-1 border-b border-gray-200">
          <span className="font-medium text-gray-600 print:text-[0.65rem]">Employee ID:</span>
          <span className="font-semibold text-gray-800 print:text-[0.65rem]">{payslipData.employeeId || 'N/A'}</span>
        </div>
        <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between items-center py-1 border-b border-gray-200 col-span-full">
          <span className="font-medium text-gray-600 print:text-[0.65rem]">Payslip Period:</span>
          <span className="font-semibold text-gray-800 print:text-[0.65rem]">
            {payslipData.startDate && payslipData.endDate
              ? `${new Date(payslipData.startDate).toLocaleDateString()} - ${new Date(payslipData.endDate).toLocaleDateString()}`
              : 'N/A'}
          </span>
        </div>

        <div className="payslip-section-title print:bg-indigo-100 print:px-[0.2rem] print:py-[0.3rem] print:font-bold print:text-[0.7rem] print:text-indigo-800 print:rounded-[0.25rem] print:mb-[0.2rem] bg-indigo-100 px-2 py-1 font-bold text-indigo-800 mt-2 rounded-lg">Earnings</div>
        <div className="p-2 print:p-0">
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-700 print:text-[0.65rem]">Basic Salary:</span>
            <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP {payslipData.basicSalary.toFixed(2)}</span>
          </div>
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1">
            <span className="text-gray-700 print:text-[0.65rem]">Cost of Living Allowance:</span>
            <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP {payslipData.costOfLivingAllowance.toFixed(2)}</span>
          </div>
        </div>

        <div className="payslip-section-title print:bg-red-100 print:px-[0.2rem] print:py-[0.3rem] print:font-bold print:text-[0.7rem] print:text-red-800 print:rounded-[0.25rem] print:mb-[0.2rem] bg-red-100 px-2 py-1 font-bold text-red-800 mt-2 rounded-lg">Deductions</div>
        <div className="p-2 print:p-0">
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-700 print:text-[0.65rem]">SSS Contribution:</span>
            <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP {payslipData.sssContribution.toFixed(2)}</span>
          </div>
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-700 print:text-[0.65rem]">PhilHealth Contribution:</span>
            <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP {payslipData.philhealthContribution.toFixed(2)}</span>
          </div>
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-700 print:text-[0.65rem]">Pag-IBIG Contribution:</span>
            <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP {payslipData.pagibigContribution.toFixed(2)}</span>
          </div>
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-700 print:text-[0.65rem]">CEAP Contribution:</span>
            <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP {payslipData.ceapContribution.toFixed(2)}</span>
          </div>
          {payslipData.otherDeductions.map((deduction, index) => (
            <div key={index} className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700 print:text-[0.65rem]">{deduction.name || 'Custom Deduction'}:</span>
              <span className="font-medium text-gray-900 print:text-[0.65rem]">PHP ${(parseFloat(deduction.amount) || 0).toFixed(2)}</span>
            </div>
          ))}
          {payslipData.otherDeductions.length > 0 && (
            <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-gray-200 print:text-[0.65rem] flex justify-between py-1 mt-1 font-semibold">
              <span className="text-gray-700 print:text-[0.65rem]">Total Other Deductions:</span>
              <span className="text-gray-900 print:text-[0.65rem]">PHP {payslipData.totalOtherDeductions.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="payslip-summary print:bg-indigo-50 print:p-[0.3rem] print:rounded-[0.25rem] print:mt-[0.3rem] bg-indigo-50 p-2 rounded-lg shadow-inner mb-2">
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-indigo-300 print:text-[0.7rem] flex justify-between items-center py-1 border-b-2 border-indigo-300 mb-1">
            <span className="text-base font-semibold text-indigo-700 print:text-[0.7rem]">Gross Salary:</span>
            <span className="text-lg font-bold text-indigo-900 print:text-[0.7rem]">PHP {payslipData.grossSalary.toFixed(2)}</span>
          </div>
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-indigo-300 print:text-[0.7rem] flex justify-between items-center py-1 border-b-2 border-indigo-300 mb-1">
            <span className="text-base font-semibold text-indigo-700 print:text-[0.7rem]">Total Deductions:</span>
            <span className="text-xl font-bold text-red-700 print:text-[0.7rem]">PHP {payslipData.totalDeductions.toFixed(2)}</span>
          </div>
          <div className="payslip-detail print:flex print:justify-between print:py-[0.05rem] print:border-b print:border-dashed print:border-indigo-300 print:text-[0.7rem] flex justify-between items-center py-1">
            <span className="text-base font-semibold text-indigo-700 print:text-[0.7rem]">Net Salary:</span>
            <span className="text-xl font-bold text-green-700 print:text-[0.7rem]">PHP {payslipData.netSalary.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="payslip-signatories print:mt-[0.5rem] print:pt-[0.2rem] print:border-t print:border-gray-300 print:text-center mt-4 pt-2 border-t border-gray-300 text-center">
        <div className="print:mb-[1rem] mb-4">
          <p className="text-gray-700 text-xs print:text-[0.6rem]">Prepared By:</p>
          <p className="font-bold text-base text-gray-900 mt-4 print:text-[0.7rem] print:font-bold print:mt-[0.8rem] print:border-b print:border-black print:inline-block print:min-w-[1.8in] print:pb-[0.05rem]">{payslipData.bookkeeperName || '_____________________'}</p>
          <p className="text-gray-600 text-xs print:text-[0.55rem] print:text-gray-600">Bookkeeper</p>
        </div>
        <div className="print:mb-[1rem]">
          <p className="text-gray-700 text-xs print:text-[0.6rem]">Acknowledged By:</p>
          <p className="font-bold text-base text-gray-900 mt-4 print:text-[0.7rem] print:font-bold print:mt-[0.8rem] print:border-b print:border-black print:inline-block print:min-w-[1.8in] print:pb-[0.05rem]">{payslipData.employeeSignatoryName || '_____________________'}</p>
          <p className="text-gray-600 text-xs print:text-[0.55rem] print:text-gray-600">Employee</p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDisplay;
