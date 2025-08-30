// src/MonthlyReport.js
import React from 'react';
import { FaFileExcel } from 'react-icons/fa';
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
          basicSalary: 0,
          costOfLivingAllowance: 0,
          grossSalary: 0,
          sssContribution: 0,
          philhealthContribution: 0,
          pagibigContribution: 0,
          ceapContribution: 0,
          totalLoans: 0,
          canteen: 0,
          tithings: 0,
          otherDeductions: 0,
          totalDeductions: 0,
          netSalary: 0,
        };
      }

      aggregatedData[employeeId].basicSalary += parseFloat(p.basicSalary || 0);
      aggregatedData[employeeId].costOfLivingAllowance += parseFloat(p.costOfLivingAllowance || 0);
      aggregatedData[employeeId].grossSalary += parseFloat(p.grossSalary || 0);
      aggregatedData[employeeId].sssContribution += parseFloat(p.sssContribution || 0);
      aggregatedData[employeeId].philhealthContribution += parseFloat(p.philhealthContribution || 0);
      aggregatedData[employeeId].pagibigContribution += parseFloat(p.pagibigContribution || 0);
      aggregatedData[employeeId].ceapContribution += parseFloat(p.ceapContribution || 0);
      
      const loans = Math.max(0, parseFloat(p.sssLoan || 0)) +
                    Math.max(0, parseFloat(p.pagibigLoanSTL || 0)) +
                    Math.max(0, parseFloat(p.pagibigLoanCL || 0)) +
                    Math.max(0, parseFloat(p.personalLoan || 0)) +
                    Math.max(0, parseFloat(p.cashAdvance || 0));
                    
      aggregatedData[employeeId].totalLoans += loans;
      aggregatedData[employeeId].canteen += parseFloat(p.canteen || 0);
      aggregatedData[employeeId].tithings += parseFloat(p.tithings || 0);
      const others = (p.otherDeductions || []).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
      aggregatedData[employeeId].otherDeductions += others;
      aggregatedData[employeeId].totalDeductions += parseFloat(p.totalDeductions || 0);
      aggregatedData[employeeId].netSalary += parseFloat(p.netSalary || 0);
    });

    return Object.values(aggregatedData).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const aggregatedPayslips = calculateAggregatedData();

  const calculateTotals = () => {
    const totals = {
      basicSalary: 0,
      costOfLivingAllowance: 0,
      grossSalary: 0, sssContribution: 0, philhealthContribution: 0, pagibigContribution: 0,
      ceapContribution: 0, totalLoans: 0, canteen: 0, tithings: 0, otherDeductions: 0, totalDeductions: 0, netSalary: 0,
    };
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
      totals.otherDeductions += p.otherDeductions;
      totals.totalDeductions += p.totalDeductions;
      totals.netSalary += p.netSalary;
    });
    return totals;
  };

  const reportTotals = calculateTotals();

  const handleExportXlsx = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');

    const titleStyle = { font: { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF2D3748' } }, alignment: { vertical: 'middle', horizontal: 'center' } };
    const subtitleStyle = { font: { name: 'Calibri', size: 12, color: { argb: 'FF718096' } }, alignment: { vertical: 'middle', horizontal: 'center' } };
    const headerStyle = { font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A5568' } }, alignment: { horizontal: 'right' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
    const totalRowStyle = { font: { name: 'Calibri', size: 12, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }, alignment: { horizontal: 'right' }, border: { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
    const dataCellStyle = { border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }, alignment: { horizontal: 'right' } };

    worksheet.mergeCells('A1:O1');
    worksheet.getCell('A1').value = 'Monthly Payroll Report';
    worksheet.getCell('A1').style = titleStyle;

    worksheet.mergeCells('A2:O2');
    worksheet.getCell('A2').value = `For period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    worksheet.getCell('A2').style = subtitleStyle;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(4).values = [
        "Employee", "Employee ID", "Basic Salary", "Cost of Living Allowance", "Gross Salary", "SSS", "PhilHealth", "Pag-IBIG", "CEAP", 
        "Loans", "Canteen", "Tithings", "Others", "Total Deductions", "Net Salary"
    ];
    worksheet.getRow(4).eachCell((cell) => { cell.style = headerStyle; });
    worksheet.getCell('A4').style.alignment = { horizontal: 'left' };
    worksheet.getCell('B4').style.alignment = { horizontal: 'left' };

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
        p.otherDeductions,
        p.totalDeductions,
        p.netSalary,
      ];
      const row = worksheet.addRow(rowData);
      row.eachCell((cell, colNumber) => {
        cell.style = dataCellStyle;
        if (colNumber > 2) {
          cell.numFmt = '#,##0.00';
        }
        if(colNumber === 1 || colNumber === 2){
          cell.alignment = { horizontal: 'left' };
        }
      });
      
      if (index % 2 !== 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7FAFC' } };
        });
      }
      row.getCell('O').font = { bold: true };
    });

    const totalsRow = worksheet.addRow([
      'TOTALS', '',
      reportTotals.basicSalary,
      reportTotals.costOfLivingAllowance,
      reportTotals.grossSalary, reportTotals.sssContribution, reportTotals.philhealthContribution,
      reportTotals.pagibigContribution, reportTotals.ceapContribution, reportTotals.totalLoans,
      reportTotals.canteen, reportTotals.tithings, reportTotals.otherDeductions, reportTotals.totalDeductions, reportTotals.netSalary
    ]);
    totalsRow.eachCell((cell, colNumber) => {
      cell.style = totalRowStyle;
       if (colNumber > 2) {
          cell.numFmt = '#,##0.00';
       }
    });
    totalsRow.getCell('A').style.alignment = { horizontal: 'left' };
    worksheet.mergeCells(`A${totalsRow.number}:B${totalsRow.number}`);

    worksheet.getColumn('A').width = 30;
    worksheet.getColumn('B').width = 15;
    worksheet.getColumn('C').width = 18;
    worksheet.getColumn('D').width = 25;
    worksheet.getColumn('E').width = 18;
    worksheet.getColumn('F').width = 15;
    worksheet.getColumn('G').width = 15;
    worksheet.getColumn('H').width = 15;
    worksheet.getColumn('I').width = 15;
    worksheet.getColumn('J').width = 15;
    worksheet.getColumn('K').width = 15;
    worksheet.getColumn('L').width = 15;
    worksheet.getColumn('M').width = 15;
    worksheet.getColumn('N').width = 18;
    worksheet.getColumn('O').width = 18;
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Payroll_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };
  
  // Modern Professional UI CSS classes
  const containerClass = "bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100";
  const titleClass = "text-5xl font-extrabold text-gray-900";
  const subtitleClass = "text-lg text-gray-500 mt-2";
  const buttonClass = "flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 text-sm";
  const summaryCardClass = "bg-white p-8 rounded-2xl border border-gray-200 shadow-md";
  const summaryValueClass = "text-4xl font-extrabold mt-2";
  const summaryValuePositive = "text-blue-600";
  const summaryValueNegative = "text-red-600";
  const tableHeaderClass = "py-6 px-4 text-sm font-bold tracking-wider text-right text-white uppercase bg-gray-900";
  const bodyCellClass = "py-5 px-4 text-sm text-gray-800 border-b border-gray-100";
  const bodyCellRightClass = "py-5 px-4 text-sm text-gray-800 text-right whitespace-nowrap border-b border-gray-100";
  const totalCellClass = "py-6 px-4 text-md font-bold text-gray-900 text-right uppercase bg-gray-200";
  const totalCellLeftClass = "py-6 px-4 text-md font-bold text-gray-900 uppercase bg-gray-200";
  const highlightPositive = "font-bold text-green-600";
  const highlightNegative = "font-bold text-red-600";
  const tableContainerClass = "overflow-x-auto relative rounded-3xl shadow-lg border border-gray-200 max-h-[70vh]";

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 print-container">
        <div className={containerClass}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200">
            <div>
              <h2 className={titleClass}>Monthly Payroll Report</h2>
              <p className={subtitleClass}>
                For period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 mt-6 md:mt-0 no-print">
              <button
                onClick={handleExportXlsx}
                className={buttonClass}
              >
                <FaFileExcel />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 no-print">
            <div className={`${summaryCardClass}`}>
              <div className="text-gray-500 font-semibold">Total Gross Salary</div>
              <div className={`${summaryValueClass} text-gray-900`}>{formatCurrency(reportTotals.grossSalary)}</div>
            </div>
            <div className={`${summaryCardClass}`}>
              <div className="text-gray-500 font-semibold">Total Deductions</div>
              <div className={`${summaryValueClass} ${summaryValueNegative}`}>{formatCurrency(reportTotals.totalDeductions)}</div>
            </div>
            <div className={`${summaryCardClass}`}>
              <div className="text-gray-500 font-semibold">Total Net Salary</div>
              <div className={`${summaryValueClass} ${summaryValuePositive}`}>{formatCurrency(reportTotals.netSalary)}</div>
            </div>
          </div>
          
          {aggregatedPayslips.length > 0 ? (
            <div className={tableContainerClass}>
              <table className="w-full min-w-[1400px] table-fixed">
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className={`${tableHeaderClass} text-left rounded-tl-3xl sticky left-0 z-20`} style={{ width: '15%' }}>Employee</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Basic Salary</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Cost of Living Allowance</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Gross Salary</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>SSS</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>PhilHealth</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Pag-IBIG</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>CEAP</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Loans</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Canteen</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Tithings</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Others</th>
                    <th className={tableHeaderClass} style={{ width: '8%' }}>Total Deductions</th>
                    <th className={`${tableHeaderClass} rounded-tr-3xl`} style={{ width: '8%' }}>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedPayslips.map((p, index) => {
                    return (
                      <tr key={index} className="transition-all duration-200 ease-in-out hover:bg-gray-100 even:bg-white odd:bg-gray-50/70">
                        <td className={`${bodyCellClass} text-left sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}`} style={{ width: '15%' }}>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.employeeId}</div>
                        </td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.basicSalary)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.costOfLivingAllowance)}</td>
                        <td className={`${bodyCellRightClass} font-semibold`} style={{ width: '8%' }}>{formatCurrency(p.grossSalary)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.sssContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.philhealthContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.pagibigContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.ceapContribution)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.totalLoans)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.canteen)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.tithings)}</td>
                        <td className={bodyCellRightClass} style={{ width: '8%' }}>{formatCurrency(p.otherDeductions)}</td>
                        <td className={`${bodyCellRightClass} ${highlightNegative}`} style={{ width: '8%' }}>{formatCurrency(p.totalDeductions)}</td>
                        <td className={`${bodyCellRightClass} ${highlightPositive}`} style={{ width: '8%' }}>{formatCurrency(p.netSalary)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className={`${totalCellLeftClass} rounded-bl-3xl sticky left-0 z-10`} style={{ width: '15%' }}>TOTALS</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.basicSalary)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.costOfLivingAllowance)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.grossSalary)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.sssContribution)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.philhealthContribution)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.pagibigContribution)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.ceapContribution)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.totalLoans)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.canteen)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.tithings)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.otherDeductions)}</td>
                    <td className={totalCellClass} style={{ width: '8%' }}>{formatCurrency(reportTotals.totalDeductions)}</td>
                    <td className={`${totalCellClass} rounded-br-3xl`} style={{ width: '8%' }}>{formatCurrency(reportTotals.netSalary)}</td>
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