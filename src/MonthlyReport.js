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
          canteen: 0,
          tithings: 0,
          late: 0,
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
      aggregatedData[employeeId].canteen += parseFloat(p.canteen || 0);
      aggregatedData[employeeId].tithings += parseFloat(p.tithings || 0);
      aggregatedData[employeeId].late += parseFloat(p.late || 0);
      const others = (p.otherDeductions || []).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
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
      ceapContribution: 0, totalLoans: 0, canteen: 0, tithings: 0, late: 0, otherDeductions: 0, totalDeductions: 0, netSalary: 0,
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
      totals.canteen += p.canteen;
      totals.tithings += p.tithings;
      totals.late += p.late;
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
    worksheet.mergeCells('A1:P1');
    worksheet.getCell('A1').value = 'Monthly Payroll Report';
    worksheet.getCell('A1').style = titleStyle;

    worksheet.mergeCells('A2:P2');
    worksheet.getCell('A2').value = `For period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    worksheet.getCell('A2').style = subtitleStyle;
    worksheet.getRow(2).height = 20;

    // --- TABLE HEADERS ---
    worksheet.getRow(4).values = [
        "Employee", "Employee ID", "Basic Salary", "Cost of Living Allowance", "Gross Salary", "SSS", "PhilHealth", "Pag-IBIG", "CEAP", 
        "Loans", "Canteen", "Tithings", "Late", "Others", "Total Deductions", "Net Salary"
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
        p.canteen,
        p.tithings,
        p.late,
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
      row.getCell('P').font = { bold: true };
    });

    // --- TOTALS ROW ---
    const totalsRow = worksheet.addRow([
      'TOTALS', '',
      reportTotals.basicSalary,
      reportTotals.costOfLivingAllowance,
      reportTotals.grossSalary, reportTotals.sssContribution, reportTotals.philhealthContribution,
      reportTotals.pagibigContribution, reportTotals.ceapContribution, reportTotals.totalLoans,
      reportTotals.canteen, reportTotals.tithings, reportTotals.late, reportTotals.otherDeductions, reportTotals.totalDeductions, reportTotals.netSalary
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
    worksheet.getColumn('K').width = 15; // Canteen
    worksheet.getColumn('L').width = 15; // Tithings
    worksheet.getColumn('M').width = 15; // Late
    worksheet.getColumn('N').width = 15; // Others
    worksheet.getColumn('O').width = 18; // Total Deductions
    worksheet.getColumn('P').width = 18; // Net Salary
    
    // --- GENERATE & DOWNLOAD FILE ---
    const buffer = await workbook.xlsx.writeBuffer();
    // *** THIS IS THE FIX: The buffer must be wrapped in an array for the Blob constructor. ***
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Payroll_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };
  
  
  const tableHeaderClass = "py-4 px-3 text-sm font-semibold tracking-wider text-right text-gray-700 uppercase bg-gray-100 border-b border-gray-300";
  const bodyCellClass = "py-3 px-3 text-sm text-gray-800 border-b border-gray-200";
  const bodyCellRightClass = "py-3 px-3 text-sm text-gray-800 text-right whitespace-nowrap border-b border-gray-200";
  const totalCellClass = "py-4 px-3 text-sm font-bold text-gray-900 text-right uppercase bg-gray-200";
  const totalCellLeftClass = "py-4 px-3 text-sm font-bold text-gray-900 uppercase bg-gray-200";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 print-container">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Monthly Payroll Report</h2>
              <p className="text-sm text-gray-500 mt-1">
                For period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0 no-print">
              <button
                onClick={handleExportXlsx}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 text-sm"
              >
                <FaFileExcel />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
          
          {aggregatedPayslips.length > 0 ? (
            <div className="overflow-x-auto relative rounded-lg shadow-inner border border-gray-300 max-h-[70vh]">
              <table className="w-full min-w-[1500px] table-fixed">
                <thead className="sticky top-0 bg-white z-20">
                  <tr>
                    <th className={`${tableHeaderClass} text-left rounded-tl-lg sticky left-0 bg-gray-100`} style={{ width: '15%' }}>Employee</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Basic Salary</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '8%' }}>Cost of Living Allowance</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Gross Salary</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>SSS</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>PhilHealth</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Pag-IBIG</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>CEAP</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Loans</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Canteen</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Tithings</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Late</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '7%' }}>Others</th>
                    <th className={`${tableHeaderClass} text-right`} style={{ width: '8%' }}>Total Deductions</th>
                    <th className={`${tableHeaderClass} text-right rounded-tr-lg`} style={{ width: '8%' }}>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedPayslips.map((p, index) => {
                    return (
                      <tr key={index} className="transition-colors duration-200 ease-in-out hover:bg-blue-50 even:bg-white odd:bg-gray-50/70">
                        <td className={`${bodyCellClass} text-left sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}`} style={{ width: '15%' }}>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.employeeId}</div>
                        </td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.basicSalary)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.costOfLivingAllowance)}</td>
                        <td className={`${bodyCellRightClass} font-semibold`} style={{ width: '7%' }}>{formatCurrency(p.grossSalary)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.sssContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.philhealthContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.pagibigContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.ceapContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.totalLoans)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.canteen)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.tithings)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.late)}</td>
                        <td className={bodyCellRightClass} style={{ width: '7%' }}>{formatCurrency(p.otherDeductions)}</td>
                        <td className={`${bodyCellRightClass} font-semibold text-red-600`} style={{ width: '8%' }}>{formatCurrency(p.totalDeductions)}</td>
                        <td className={`${bodyCellRightClass} font-extrabold text-green-600`} style={{ width: '8%' }}>{formatCurrency(p.netSalary)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className={`${totalCellLeftClass} rounded-bl-lg sticky left-0 z-10 bg-gray-200`} style={{ width: '15%' }}>TOTALS</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.basicSalary)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.costOfLivingAllowance)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.grossSalary)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.sssContribution)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.philhealthContribution)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.pagibigContribution)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.ceapContribution)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.totalLoans)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.canteen)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.tithings)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.late)}</td>
                    <td className={totalCellClass} style={{ width: '7%' }}>{formatCurrency(reportTotals.otherDeductions)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.totalDeductions)}</td>
                    <td className={`${totalCellClass} rounded-br-lg`} style={{ width: '8%' }}>{formatCurrency(reportTotals.netSalary)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : ( <div className="text-center py-20"><p className="text-gray-500 text-lg">No payslip data found for the selected period.</p><p className="text-gray-400 mt-2">Try adjusting the date range or generate payslips in the Employee Management tab.</p></div> )}
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