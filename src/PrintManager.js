// src/PrintManager.js
import React, { useState } from 'react';
import PrintOptionsModal from './PrintOptionsModal';
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';

/**
 * Generates the complete HTML for a single payslip.
 * @param {object} pData - The payslip data object.
 * @returns {string} The HTML string for the payslip.
 */
const getPayslipHTML = (pData) => {
  if (!pData) return '';

  const otherDeductionsRows = (pData.otherDeductions || []).map(deduction => `
    <div class="flex justify-between py-[0.5px] border-b border-dashed border-gray-300">
      <span class="text-gray-700 text-[6px]">${deduction.name || 'Custom Deduction'}:</span>
      <span class="font-medium text-gray-900 text-[6px]">PHP ${(parseFloat(deduction.amount) || 0).toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <div class="payslip-container bg-white p-2 font-sans text-[8px] w-full border border-gray-400 shadow-lg">
      <div class="text-center mb-1">
        <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" class="mx-auto h-8 mb-1" />
        <h3 class="text-[10px] font-bold text-gray-900">SAN RAMON CATHOLIC SCHOOL, INC.</h3>
        <p class="text-gray-700 text-[6px]">Su-ay, Himamaylan City Negros Occidental</p>
      </div>
      <div class="payslip-content">
        <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
          <span class="font-medium text-gray-600 text-[6px]">Employee Name:</span>
          <span class="font-semibold text-gray-800 text-[6px]">${pData.name || 'N/A'}</span>
        </div>
        <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
          <span class="font-medium text-gray-600 text-[6px]">Employee ID:</span>
          <span class="font-semibold text-gray-800 text-[6px]">${pData.employeeId || 'N/A'}</span>
        </div>
        <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
          <span class="font-medium text-gray-600 text-[6px]">Payslip Period:</span>
          <span class="font-semibold text-gray-800 text-[6px]">
            ${pData.startDate && pData.endDate
              ? `${new Date(pData.startDate).toLocaleDateString()} - ${new Date(pData.endDate).toLocaleDateString()}`
              : 'N/A'}
          </span>
        </div>

        <div class="bg-indigo-100 px-1 py-[1px] font-bold text-indigo-800 mt-1 rounded-sm text-[6px]">Earnings</div>
        <div class="p-1">
          <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
            <span class="text-gray-700 text-[6px]">Basic Salary:</span>
            <span class="font-medium text-gray-900 text-[6px]">PHP ${(pData.basicSalary || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-[1px]">
            <span class="text-gray-700 text-[6px]">Cost of Living Allowance:</span>
            <span class="font-medium text-gray-900 text-[6px]">PHP ${(pData.costOfLivingAllowance || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="bg-red-100 px-1 py-[1px] font-bold text-red-800 mt-1 rounded-sm text-[6px]">Deductions</div>
        <div class="p-1">
          <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
            <span class="text-gray-700 text-[6px]">SSS Contribution:</span>
            <span class="font-medium text-gray-900 text-[6px]">PHP ${(pData.sssContribution || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
            <span class="text-gray-700 text-[6px]">PhilHealth Contribution:</span>
            <span class="font-medium text-gray-900 text-[6px]">PHP ${(pData.philhealthContribution || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
            <span class="text-gray-700 text-[6px]">Pag-IBIG Contribution:</span>
            <span class="font-medium text-gray-900 text-[6px]">PHP ${(pData.pagibigContribution || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-[1px] border-b border-dashed border-gray-300">
            <span class="text-gray-700 text-[6px]">CEAP Contribution:</span>
            <span class="font-medium text-gray-900 text-[6px]">PHP ${(pData.ceapContribution || 0).toFixed(2)}</span>
          </div>
          ${otherDeductionsRows}
        </div>

        <div class="bg-indigo-50 p-1 rounded-sm shadow-inner mt-1">
          <div class="flex justify-between items-center py-[1px] border-b border-indigo-200 mb-1">
            <span class="text-[6px] font-semibold text-indigo-700">Gross Salary:</span>
            <span class="text-[8px] font-bold text-indigo-900">PHP ${(pData.grossSalary || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between items-center py-[1px] border-b border-indigo-200 mb-1">
            <span class="text-[6px] font-semibold text-red-700">Total Deductions:</span>
            <span class="text-[8px] font-bold text-red-700">PHP ${(pData.totalDeductions || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between items-center py-[1px] mt-1">
            <span class="text-[8px] font-semibold text-green-700">Net Salary:</span>
            <span class="text-[10px] font-bold text-green-700">PHP ${(pData.netSalary || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div class="mt-2 pt-1 border-t border-gray-400 text-center">
        <div class="inline-block mx-2 text-center">
          <p class="font-bold text-[6px] text-gray-900 mt-2 border-b border-black min-w-[100px] pb-1">${pData.bookkeeperName || ''}</p>
          <p class="text-[5px] text-gray-600">Bookkeeper</p>
        </div>
        <div class="inline-block mx-2 text-center">
          <p class="font-bold text-[6px] text-gray-900 mt-2 border-b border-black min-w-[100px] pb-1">${pData.employeeSignatoryName || ''}</p>
          <p class="text-[5px] text-gray-600">Employee</p>
        </div>
      </div>
    </div>
  `;
};

const PrintManager = ({ payslip, employees, payslipDetails, setPayslipDetails }) => {
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [printOption, setPrintOption] = useState('current');
  const [selectedEmployeesForPrint, setSelectedEmployeesForPrint] = useState([]);

  const handleOpenPrintOptions = () => setShowPrintOptionsModal(true);
  const handleClosePrintOptions = () => setShowPrintOptionsModal(false);

  const handleSelectEmployeesForPrint = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedEmployeesForPrint(values);
  };
  
  const executePrint = () => {
    let payslipsToGenerate = [];
    let employeesToProcess = [];

    if (printOption === 'current') {
      if (payslip) {
        employeesToProcess.push(payslip);
      }
    } else if (printOption === 'selected' && selectedEmployeesForPrint.length > 0) {
      employeesToProcess = employees.filter(e => selectedEmployeesForPrint.includes(e.id));
    } else if (printOption === 'all' && employees.length > 0) {
      employeesToProcess = employees;
    }
    
    if (employeesToProcess.length === 0) {
      alert("No payslips to print based on your selection.");
      return;
    }
    
    const payslipDetailsForPrint = payslipDetails || {};

    employeesToProcess.forEach(emp => {
      const basic = parseFloat(emp.basicSalary) || 0;
      const costOfLivingAllowance = parseFloat(emp.costOfLivingAllowance) || 0;
      const otherDeductionsList = emp.otherDeductions || [];
      const totalOtherDeductions = otherDeductionsList.reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);

      const sss = getSssContribution(basic);
      const philhealth = getPhilhealthContribution(basic);
      const pagibig = getPagibigContribution(basic);
      const ceap = getCeapContribution(basic);

      const grossSalary = basic + costOfLivingAllowance;
      const totalDeductions = totalOtherDeductions + sss + philhealth + pagibig + ceap;
      const netSalary = grossSalary - totalDeductions;

      payslipsToGenerate.push({
        ...emp,
        ...payslipDetailsForPrint,
        employeeSignatoryName: emp.name,
        basicSalary: basic,
        costOfLivingAllowance,
        otherDeductions: otherDeductionsList,
        sssContribution: sss,
        philhealthContribution: philhealth,
        pagibigContribution: pagibig,
        ceapContribution: ceap,
        grossSalary,
        totalDeductions,
        netSalary,
      });
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Payslips</title>');
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    printWindow.document.write(`<style>
      @page { size: 8.5in 13in; margin: 0.25in; }
      body { margin: 0; font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-container { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
      .employee-payslip-section { width: 100%; height: 50%; display: flex; justify-content: space-between; align-items: flex-start; box-sizing: border-box; }
      .payslip-container { width: 49%; max-width: 4in; box-sizing: border-box; overflow: hidden; }
    </style>`);
    printWindow.document.write('</head><body>');
    
    for (let i = 0; i < payslipsToGenerate.length; i++) {
      const payslipHtml = getPayslipHTML(payslipsToGenerate[i]);
      printWindow.document.write(`
        <div class="page-container">
          <div class="employee-payslip-section">
            ${payslipHtml}
            ${payslipHtml}
          </div>
        </div>
      `);
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    handleClosePrintOptions();
  };

  return (
    <>
      <button
        onClick={handleOpenPrintOptions}
        className="w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition transform hover:scale-105"
      >
        Print
      </button>
      <PrintOptionsModal
        showPrintOptionsModal={showPrintOptionsModal}
        printOption={printOption}
        setPrintOption={setPrintOption}
        employees={employees}
        selectedEmployeesForPrint={selectedEmployeesForPrint}
        handleSelectEmployeesForPrint={handleSelectEmployeesForPrint}
        handleClosePrintOptions={handleClosePrintOptions}
        executePrint={executePrint}
        payslip={payslip}
        payslipDetails={payslipDetails}
        setPayslipDetails={setPayslipDetails}
      />
    </>
  );
};

export default PrintManager;