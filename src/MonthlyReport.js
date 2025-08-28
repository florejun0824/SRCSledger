// src/MonthlyReport.js
import React from 'react';
import { FaPrint, FaFileExcel } from 'react-icons/fa';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


const MonthlyReport = ({ payslipHistory, startDate, endDate }) => {

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? '0.00' : number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateAggregatedData = () => {
    const aggregatedData = {};

    payslipHistory.forEach(p => {
      const employeeId = p.employeeDocId;
      if (!aggregatedData[employeeId]) {
        aggregatedData[employeeId] = {
          name: p.name,
          employeeId: p.employeeId,
          basicSalary: 0, // Added Basic Salary
          costOfLivingAllowance: 0, // Added Cost of Living Allowance
          grossSalary: 0,
          sssContribution: 0,
          philhealthContribution: 0,
          pagibigContribution: 0,
          ceapContribution: 0,
          totalLoans: 0,
          otherDeductions: 0,
          totalDeductions: 0,
          netSalary: 0,
        };
      }

      aggregatedData[employeeId].basicSalary += parseFloat(p.basicSalary || 0); // Aggregate basic salary
      aggregatedData[employeeId].costOfLivingAllowance += parseFloat(p.costOfLivingAllowance || 0); // Aggregate COLA
      aggregatedData[employeeId].grossSalary += parseFloat(p.grossSalary || 0);
      aggregatedData[employeeId].sssContribution += parseFloat(p.sssContribution || 0);
      aggregatedData[employeeId].philhealthContribution += parseFloat(p.philhealthContribution || 0);
      aggregatedData[employeeId].pagibigContribution += parseFloat(p.pagibigContribution || 0);
      aggregatedData[employeeId].ceapContribution += parseFloat(p.ceapContribution || 0);
      
      // FIX: Ensure loan values are non-negative before summing
      const loans = Math.max(0, parseFloat(p.sssLoan || 0)) +
                    Math.max(0, parseFloat(p.pagibigLoanSTL || 0)) +
                    Math.max(0, parseFloat(p.pagibigLoanCL || 0)) +
                    Math.max(0, parseFloat(p.personalLoan || 0)) +
                    Math.max(0, parseFloat(p.cashAdvance || 0));
                    
      aggregatedData[employeeId].totalLoans += loans;
      const others = parseFloat(p.canteen || 0) + parseFloat(p.tithings || 0) + (p.otherDeductions || []).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
      aggregatedData[employeeId].otherDeductions += others;
      aggregatedData[employeeId].totalDeductions += parseFloat(p.totalDeductions || 0);
      aggregatedData[employeeId].netSalary += parseFloat(p.netSalary || 0);
    });

    // Sort the aggregated data alphabetically by employee name
    return Object.values(aggregatedData).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const aggregatedPayslips = calculateAggregatedData();

  const calculateTotals = () => {
    const totals = {
      basicSalary: 0, // Added Basic Salary
      costOfLivingAllowance: 0, // Added Cost of Living Allowance
      grossSalary: 0, sssContribution: 0, philhealthContribution: 0, pagibigContribution: 0,
      ceapContribution: 0, totalLoans: 0, otherDeductions: 0, totalDeductions: 0, netSalary: 0,
    };
    // Now iterate over the aggregated data
    aggregatedPayslips.forEach(p => {
      totals.basicSalary += p.basicSalary;
      totals.costOfLivingAllowance += p.costOfLivingAllowance;
      totals.grossSalary += p.grossSalary;
      totals.sssContribution += p.sssContribution;
      totals.philhealthContribution += p.philhealthContribution;
      totals.pagibigContribution += p.pagibigContribution;
      totals.ceapContribution += p.ceapContribution;
      totals.totalLoans += p.totalLoans;
      totals.otherDeductions += p.otherDeductions;
      totals.totalDeductions += p.totalDeductions;
      totals.netSalary += p.netSalary;
    });
    return totals;
  };

  const reportTotals = calculateTotals();

  const handlePrint = () => {
    window.print();
  };
  
  const handleExportXlsx = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');

    // --- STYLING DEFINITIONS ---
    const titleStyle = { font: { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF2D3748' } }, alignment: { vertical: 'middle', horizontal: 'center' } };
    const subtitleStyle = { font: { name: 'Calibri', size: 12, color: { argb: 'FF718096' } }, alignment: { vertical: 'middle', horizontal: 'center' } };
    const headerStyle = { font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A5568' } }, alignment: { horizontal: 'right' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
    const totalRowStyle = { font: { name: 'Calibri', size: 12, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }, alignment: { horizontal: 'right' }, border: { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
    const dataCellStyle = { border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }, alignment: { horizontal: 'right' } };

    // --- REPORT HEADER ---
    worksheet.mergeCells('A1:M1');
    worksheet.getCell('A1').value = 'Monthly Payroll Report';
    worksheet.getCell('A1').style = titleStyle;

    worksheet.mergeCells('A2:M2');
    worksheet.getCell('A2').value = `For period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    worksheet.getCell('A2').style = subtitleStyle;
    worksheet.getRow(2).height = 20;

    // --- TABLE HEADERS ---
    worksheet.getRow(4).values = [
        "Employee", "Employee ID", "Basic Salary", "Cost of Living Allowance", "Gross Salary", "SSS", "PhilHealth", "Pag-IBIG", "CEAP", 
        "Loans", "Others", "Total Deductions", "Net Salary"
    ];
    worksheet.getRow(4).eachCell((cell) => { cell.style = headerStyle; });
    worksheet.getCell('A4').style.alignment = { horizontal: 'left' }; // Employee name left-aligned
    worksheet.getCell('B4').style.alignment = { horizontal: 'left' }; // Employee ID left-aligned

    // --- DATA ROWS ---
    // Use the aggregated data for the report rows
    aggregatedPayslips.forEach((p, index) => {
      const rowData = [
        p.name,
        p.employeeId || '',
        p.basicSalary,
        p.costOfLivingAllowance,
        p.grossSalary,
        p.sssContribution,
        p.philhealthContribution,
        p.pagibigContribution,
        p.ceapContribution,
        p.totalLoans,
        p.otherDeductions,
        p.totalDeductions,
        p.netSalary,
      ];
      const row = worksheet.addRow(rowData);

      // Apply currency format and styles
      row.eachCell((cell, colNumber) => {
        cell.style = dataCellStyle;
        if (colNumber > 2) {
          cell.numFmt = '#,##0.00';
        }
        if(colNumber === 1 || colNumber === 2){
          cell.alignment = { horizontal: 'left' };
        }
      });
      
      // Zebra-striping
      if (index % 2 !== 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7FAFC' } };
        });
      }
       // Bold net salary
      row.getCell('M').font = { bold: true };
    });

    // --- TOTALS ROW ---
    const totalsRow = worksheet.addRow([
      'TOTALS', '',
      reportTotals.basicSalary,
      reportTotals.costOfLivingAllowance,
      reportTotals.grossSalary, reportTotals.sssContribution, reportTotals.philhealthContribution,
      reportTotals.pagibigContribution, reportTotals.ceapContribution, reportTotals.totalLoans,
      reportTotals.otherDeductions, reportTotals.totalDeductions, reportTotals.netSalary
    ]);
    totalsRow.eachCell((cell, colNumber) => {
      cell.style = totalRowStyle;
       if (colNumber > 2) {
          cell.numFmt = '#,##0.00';
       }
    });
    totalsRow.getCell('A').style.alignment = { horizontal: 'left' }; // 'TOTALS' text left-aligned
    worksheet.mergeCells(`A${totalsRow.number}:B${totalsRow.number}`); // Merge cells for 'TOTALS'

    // --- COLUMN WIDTHS ---
    worksheet.getColumn('A').width = 30; // Employee
    worksheet.getColumn('B').width = 15; // Employee ID
    worksheet.getColumn('C').width = 18; // Basic Salary
    worksheet.getColumn('D').width = 25; // Cost of Living Allowance
    worksheet.getColumn('E').width = 18; // Gross Salary
    worksheet.getColumn('F').width = 15; // SSS
    worksheet.getColumn('G').width = 15; // PhilHealth
    worksheet.getColumn('H').width = 15; // Pag-IBIG
    worksheet.getColumn('I').width = 15; // CEAP
    worksheet.getColumn('J').width = 15; // Loans
    worksheet.getColumn('K').width = 15; // Others
    worksheet.getColumn('L').width = 18; // Total Deductions
    worksheet.getColumn('M').width = 18; // Net Salary
    
    // --- GENERATE & DOWNLOAD FILE ---
    const buffer = await workbook.xlsx.writeBuffer();
    // *** THIS IS THE FIX: The buffer must be wrapped in an array for the Blob constructor. ***
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Payroll_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };
  
  
  // --- Styling classes for the web page (unchanged) ---
  const tableHeaderClass = "px-4 py-3 text-xs font-semibold tracking-wider text-left text-slate-500 uppercase bg-slate-100";
  const tableCellClass = "px-4 py-4 text-sm text-slate-700";
  const tableFooterClass = "px-4 py-3 text-sm font-bold text-slate-800 bg-slate-200";

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 print-container">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Monthly Payroll Report</h2>
              <p className="text-sm text-slate-500 mt-1">
                For period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0 no-print">
              <button
                onClick={handleExportXlsx}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-all duration-300 text-sm"
              >
                <FaFileExcel />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
          
          {/* The rest of the JSX for displaying the table remains unchanged */}
          {aggregatedPayslips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] table-auto">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className={`${tableHeaderClass} rounded-l-lg`}>Employee</th>
                    <th className={`${tableHeaderClass} text-right`}>Basic Salary</th>
                    <th className={`${tableHeaderClass} text-right`}>Cost of Living Allowance</th>
                    <th className={`${tableHeaderClass} text-right`}>Gross Salary</th>
                    <th className={`${tableHeaderClass} text-right`}>SSS</th>
                    <th className={`${tableHeaderClass} text-right`}>PhilHealth</th>
                    <th className={`${tableHeaderClass} text-right`}>Pag-IBIG</th>
                    <th className={`${tableHeaderClass} text-right`}>CEAP</th>
                    <th className={`${tableHeaderClass} text-right`}>Loans</th>
                    <th className={`${tableHeaderClass} text-right`}>Others</th>
                    <th className={`${tableHeaderClass} text-right`}>Total Deductions</th>
                    <th className={`${tableHeaderClass} text-right rounded-r-lg`}>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedPayslips.map((p, index) => {
                    return (
                      <tr key={index} className="transition-colors duration-200 ease-in-out border-b border-slate-100 even:bg-white odd:bg-slate-50/70 hover:bg-blue-50">
                        <td className={tableCellClass}><div className="font-semibold text-slate-800">{p.name}</div><div className="text-xs text-slate-500">{p.employeeId}</div></td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.basicSalary)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.costOfLivingAllowance)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.grossSalary)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.sssContribution)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.philhealthContribution)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.pagibigContribution)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.ceapContribution)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.totalLoans)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.otherDeductions)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap`}>{formatCurrency(p.totalDeductions)}</td>
                        <td className={`${tableCellClass} text-right whitespace-nowrap font-bold text-slate-900`}>{formatCurrency(p.netSalary)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className={`${tableFooterClass} rounded-l-lg text-left`}>TOTALS</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.basicSalary)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.costOfLivingAllowance)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.grossSalary)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.sssContribution)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.philhealthContribution)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.pagibigContribution)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.ceapContribution)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.totalLoans)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.otherDeductions)}</td>
                    <td className={`${tableFooterClass} text-right`}>{formatCurrency(reportTotals.totalDeductions)}</td>
                    <td className={`${tableFooterClass} text-right rounded-r-lg`}>{formatCurrency(reportTotals.netSalary)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : ( <div className="text-center py-20"><p className="text-slate-500 text-lg">No payslip data found for the selected period.</p><p className="text-slate-400 mt-2">Try adjusting the date range or generate payslips in the Employee Management tab.</p></div> )}
        </div>
       <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; background-color: white !important; }
          .no-print { display: none; }
          body { background-color: white !important; }
        }
      `}</style>
      </div>
    </div>
  );
};

export default MonthlyReport;