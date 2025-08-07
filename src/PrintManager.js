// src/PrintManager.js
import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import PrintOptionsModal from './PrintOptionsModal';
import ConfirmationModal from './ConfirmationModal';
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import { getAuth } from 'firebase/auth';

/**
 * Helper function to ensure consistent date formatting for printing.
 * It handles Date objects and produces a 'YYYY-MM-DD' string.
 * @param {Date} dateInput - The date object from the DatePicker.
 * @returns {string|null} The formatted date string in 'YYYY-MM-DD' or null if input is invalid.
 */
const formatDateForPrinting = (dateInput) => {
    if (dateInput instanceof Date && !isNaN(dateInput)) {
        return dateInput.toISOString().split('T')[0];
    }
    return null;
};

/**
 * Renders the PayslipDisplay component to an HTML string.
 * This is crucial for ensuring the print output is identical to the on-screen preview.
 * @param {object} payslipData - The payslip data object.
 * @returns {string} The HTML string for the payslip.
 */
const renderPayslipToHtml = (payslipData) => {
    const modifiedPayslipData = {
        ...payslipData,
        employeeSignatureLabel: 'Employee Signature',
        bookkeeperSignatureLabel: 'Bookkeeper Signature',
    };

    const PayslipDisplayForPrint = ({ payslipData: data }) => {
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
        } = data;

        // CORRECTED: This function is now more robust to avoid "Invalid Date" errors
        const formatDate = (dateInput) => {
            if (!dateInput || typeof dateInput !== 'string') return 'Invalid Date';

            const [year, month, day] = dateInput.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, day));

            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

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
                <div className="text-center pb-3 mb-3 border-b border-gray-300 payslip-print-header">
                    <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" className="mx-auto h-16 mb-1" />
                    <h1 className="text-xl font-bold">SAN RAMON CATHOLIC SCHOOL, INC.</h1>
                    <p className="text-xs text-gray-600">Su-ay, Himamaylan City, Negros Occidental</p>
                    <h2 className="text-lg font-semibold text-gray-700 mt-3">PAYSLIP</h2>
                    <p className="text-xs text-gray-500">
                        Period: {formatDate(startDate)} - {formatDate(endDate)}
                    </p>
                </div>
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
                <div className="text-xl font-bold border-t-2 pt-4 mt-6 flex justify-between items-center text-gray-800">
                    <span>NET PAY:</span>
                    <span className="text-green-700">{formatCurrency(netSalary)}</span>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-8 text-center text-sm">
                    <div>
                        <div className="signature-line-placeholder"></div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-gray-600 text-xs">{modifiedPayslipData.employeeSignatureLabel}</p>
                    </div>
                    <div>
                        <div className="signature-line-placeholder"></div>
                        <p className="font-semibold">{bookkeeperName}</p>
                        <p className="text-gray-600 text-xs">{modifiedPayslipData.bookkeeperSignatureLabel}</p>
                    </div>
                </div>
            </div>
        );
    };

    return ReactDOMServer.renderToString(
        <PayslipDisplayForPrint payslipData={modifiedPayslipData} />
    );
};

const PrintManager = ({ payslip, employees, payslipDetails, setPayslipDetails, startDate, endDate }) => {
    const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
    const [showNoPayslipAlert, setShowNoPayslipAlert] = useState(false);
    const [showPopupBlockerAlert, setShowPopupBlockerAlert] = useState(false);
    const [printOption, setPrintOption] = useState('current');
    const [selectedEmployeesForPrint, setSelectedEmployeesForPrint] = useState([]);
    const auth = getAuth();

    const handleOpenPrintOptions = () => {
        if (payslip) {
            setShowPrintOptionsModal(true);
        } else {
            setShowNoPayslipAlert(true);
        }
    };

    const handleClosePrintOptions = () => {
        setShowPrintOptionsModal(false);
    };

    const handleSelectEmployeesForPrint = (employeeId) => {
        setSelectedEmployeesForPrint(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const executePrint = () => {
        const payslipsToGenerate = [];
        const formattedStartDate = formatDateForPrinting(startDate);
        const formattedEndDate = formatDateForPrinting(endDate);

        if (!formattedStartDate || !formattedEndDate) {
            console.error("Invalid start or end date for printing.");
            setShowNoPayslipAlert(true);
            return;
        }

        if (printOption === 'current' && payslip) {
            const updatedPayslip = {
                ...payslip,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
            };
            payslipsToGenerate.push(updatedPayslip);
        } else if (printOption === 'selected' && selectedEmployeesForPrint.length > 0) {
            const selectedEmployees = employees.filter(emp => selectedEmployeesForPrint.includes(emp.id));
            selectedEmployees.forEach(employee => {
                const basic = parseFloat(employee.basicSalary) || 0;
                const costOfLivingAllowance = parseFloat(employee.costOfLivingAllowance) || 0;
                const sssLoan = parseFloat(employee.sssLoan) || 0;
                const pagibigLoanSTL = parseFloat(employee.pagibigLoanSTL) || 0;
                const pagibigLoanCL = parseFloat(employee.pagibigLoanCL) || 0;
                const personalLoan = parseFloat(employee.personalLoan) || 0;
                const cashAdvance = parseFloat(employee.cashAdvance) || 0;
                const canteen = parseFloat(employee.canteen) || 0;
                const totalOtherDeductions = (employee.otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);
                const sss = getSssContribution(basic);
                const philhealth = getPhilhealthContribution(basic);
                const pagibig = getPagibigContribution(basic);
                const ceap = getCeapContribution(basic);
                const tithings = parseFloat(payslipDetails.tithings) || 0;
                const grossSalary = basic + costOfLivingAllowance;
                const totalDeductions = totalOtherDeductions + sss + philhealth + pagibig + ceap + tithings + sssLoan + pagibigLoanSTL + pagibigLoanCL + personalLoan + cashAdvance + canteen;
                const netSalary = grossSalary - totalDeductions;

                payslipsToGenerate.push({
                    ...employee,
                    ...payslipDetails,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    grossSalary,
                    totalDeductions,
                    netSalary,
                    sssContribution: sss,
                    philhealthContribution: philhealth,
                    pagibigContribution: pagibig,
                    ceapContribution: ceap,
                    tithings: tithings,
                    sssLoan: sssLoan,
                    pagibigLoanSTL: pagibigLoanSTL,
                    pagibigLoanCL: pagibigLoanCL,
                    personalLoan: personalLoan,
                    cashAdvance: cashAdvance,
                    canteen: canteen,
                    totalOtherDeductions
                });
            });
        } else if (printOption === 'all' && employees.length > 0) {
            employees.forEach(employee => {
                const basic = parseFloat(employee.basicSalary) || 0;
                const costOfLivingAllowance = parseFloat(employee.costOfLivingAllowance) || 0;
                const sssLoan = parseFloat(employee.sssLoan) || 0;
                const pagibigLoanSTL = parseFloat(employee.pagibigLoanSTL) || 0;
                const pagibigLoanCL = parseFloat(employee.pagibigLoanCL) || 0;
                const personalLoan = parseFloat(employee.personalLoan) || 0;
                const cashAdvance = parseFloat(employee.cashAdvance) || 0;
                const canteen = parseFloat(employee.canteen) || 0;
                const totalOtherDeductions = (employee.otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);
                const sss = getSssContribution(basic);
                const philhealth = getPhilhealthContribution(basic);
                const pagibig = getPagibigContribution(basic);
                const ceap = getCeapContribution(basic);
                const tithings = parseFloat(payslipDetails.tithings) || 0;
                const grossSalary = basic + costOfLivingAllowance;
                const totalDeductions = totalOtherDeductions + sss + philhealth + pagibig + ceap + tithings + sssLoan + pagibigLoanSTL + pagibigLoanCL + personalLoan + cashAdvance + canteen;
                const netSalary = grossSalary - totalDeductions;

                payslipsToGenerate.push({
                    ...employee,
                    ...payslipDetails,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    grossSalary,
                    totalDeductions,
                    netSalary,
                    sssContribution: sss,
                    philhealthContribution: philhealth,
                    pagibigContribution: pagibig,
                    ceapContribution: ceap,
                    tithings: tithings,
                    sssLoan: sssLoan,
                    pagibigLoanSTL: pagibigLoanSTL,
                    pagibigLoanCL: pagibigLoanCL,
                    personalLoan: personalLoan,
                    cashAdvance: cashAdvance,
                    canteen: canteen,
                    totalOtherDeductions
                });
            });
        }

        if (payslipsToGenerate.length === 0) {
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setShowPopupBlockerAlert(true);
            return;
        }

        const payslipChunks = [];
        for (let i = 0; i < payslipsToGenerate.length; i += 2) {
            const payslip1 = payslipsToGenerate[i];
            const payslip2 = payslipsToGenerate[i + 1] || null;
            payslipChunks.push({ payslip1, payslip2 });
        }

        const payslipHtml = payslipChunks.map(({ payslip1, payslip2 }) => {
            const p1Html = renderPayslipToHtml(payslip1);
            const p2Html = payslip2 ? renderPayslipToHtml(payslip2) : '';
            return `
        <div class="page-container">
          <div class="employee-payslip-section">
            <div class="payslip-copy">${p1Html}</div>
            <div class="payslip-copy">${p1Html}</div>
          </div>
          ${p2Html ? `
          <div class="employee-payslip-section">
            <div class="payslip-copy">${p2Html}</div>
            <div class="payslip-copy">${p2Html}</div>
          </div>
          ` : ''}
        </div>
      `;
        }).join('');

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip Print</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          @page { size: 8.5in 13in; margin: 0.5in; }
          body { margin: 0; padding: 0; font-family: 'Roboto', sans-serif; color: #333; }

          .page-container {
            width: 7.5in;
            height: 12in;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }

          .employee-payslip-section {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            height: 5.9in;
            margin-bottom: 0.2in;
            gap: 0.2in;
          }

          .payslip-copy {
            width: 3.65in;
            height: 100%;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 0.08in;
            padding: 0.15in;
            overflow: hidden;
            background-color: #ffffff;
            box-shadow: 0 0 0.05in rgba(0,0,0,0.05);
          }
          .payslip-copy:first-child {
            margin-right: 0in;
          }

          .payslip-copy > div {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: transparent !important;
            max-width: none !important;
            margin: 0 !important;
          }

          .payslip-copy img { height: 0.4in; margin-bottom: 0.08in; display: block; margin-left: auto; margin-right: auto; }
          .payslip-copy h1 { font-size: 0.7rem; line-height: 1.1; margin: 0; font-weight: 700; color: #2c3e50; text-align: center; }
          .payslip-copy h2 { font-size: 0.6rem; line-height: 1.1; margin: 0.06in 0; font-weight: 600; color: #4a5568; text-align: center; }
          .payslip-copy p, .payslip-copy span, .payslip-copy div { font-size: 0.48rem; line-height: 1.25; margin: 0; padding: 0; }

          .payslip-copy .pb-3 { padding-bottom: 0.06in; }
          .payslip-copy .mb-3 { margin-bottom: 0.06in; }
          .payslip-copy .mt-3 { margin-top: 0.06in; }
          .payslip-copy .pb-1 { padding-bottom: 0.03in; }
          .payslip-copy .mb-1 { margin-bottom: 0.03in; }
          .payslip-copy .mt-2 { margin-top: 0.05in; }
          .payslip-copy .pt-2 { padding-top: 0.05in; }
          .payslip-copy .p-6 { padding: 0.1in; }

          .payslip-copy .payslip-print-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 0.1in;
            margin-bottom: 0.1in;
            text-align: center;
          }
          .payslip-copy .payslip-print-header p {
            font-size: 0.38rem;
            color: #777;
          }

          .payslip-copy .text-md.font-bold.text-gray-700.mb-2.border-b.pb-1 {
            font-size: 0.55rem;
            font-weight: 700;
            color: #444;
            background-color: #f9f9f9;
            padding: 0.05in 0.1in;
            border-radius: 0.04in;
            border-bottom: none;
            margin-bottom: 0.06in;
            text-align: left;
            border: 1px solid #eee;
          }

          .payslip-copy .text-sm.mb-4.border-b.border-gray-200.pb-3 {
            margin-bottom: 0.08in;
            padding-bottom: 0.08in;
            border-bottom: 1px dashed #e5e5e5;
          }
          .payslip-copy .text-sm.mb-4.border-b.border-gray-200.pb-3 .flex.justify-between.mb-1 {
            margin-bottom: 0.015in;
          }
          .payslip-copy .text-sm.mb-4.border-b.border-gray-200.pb-3 .font-semibold.text-gray-700 {
            font-weight: 600;
            color: #555;
          }

          .payslip-copy .grid.grid-cols-2.gap-y-1.text-sm {
            gap-y: 0.03in;
            font-size: 0.48rem;
          }
          .payslip-copy .grid.grid-cols-2.gap-y-1.text-sm p {
            line-height: 1.25;
          }
          .payslip-copy .grid.grid-cols-2.gap-y-1.text-sm p.text-right {
            font-weight: 500;
          }

          .payslip-copy .col-span-2.border-t.mt-2.pt-2 {
            border-top: 1px solid #eee;
            margin-top: 0.06in;
            padding-top: 0.06in;
          }
          .payslip-copy .col-span-2.border-t.mt-2.pt-2 .font-bold.text-gray-800 {
            font-size: 0.55rem;
            color: #444;
          }
          .payslip-copy .col-span-2.border-t.mt-2.pt-2 .text-right.font-bold {
            font-size: 0.55rem;
            color: #444;
          }
          .payslip-copy .col-span-2.border-t.mt-2.pt-2 .text-right.font-bold.text-lg.text-indigo-600 {
            font-size: 0.7rem;
            color: #007bff;
          }

          .payslip-copy .text-xl.font-bold.border-t-2.pt-4.mt-6 {
            font-size: 0.75rem;
            border-top: 2px solid #555;
            padding-top: 0.1in;
            margin-top: 0.12in;
            color: #222;
          }
          .payslip-copy .text-xl.font-bold.border-t-2.pt-4.mt-6 .text-green-700 {
            font-size: 0.9rem;
            font-weight: 700;
            color: #28a745;
          }

          .payslip-copy .mt-8.grid.grid-cols-2.gap-8.text-center.text-sm {
            margin-top: 0.2in;
            gap: 0.35in;
            font-size: 0.48rem;
          }
          .payslip-copy .signature-line-placeholder {
            border-bottom: 1px solid #999;
            padding-bottom: 0.07in;
            margin-bottom: 0.03in;
            width: 85%;
            margin-left: auto;
            margin-right: auto;
          }
          .payslip-copy .font-semibold {
            margin-top: 0.03in;
            color: #444;
          }
          .payslip-copy .text-gray-600.text-xs {
            font-size: 0.4rem;
            color: #888;
            margin-top: 0.01in;
          }
        </style>
      </head>
      <body>
        ${payslipHtml}
      </body>
      </html>
    `);

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
                startDate={startDate}
                endDate={endDate}
            />
            <ConfirmationModal
                isOpen={showNoPayslipAlert}
                onClose={() => setShowNoPayslipAlert(false)}
                title="No Payslip to Print"
                message="Please generate a payslip first to print the current one."
            />
            <ConfirmationModal
                isOpen={showPopupBlockerAlert}
                onClose={() => setShowPopupBlockerAlert(false)}
                title="Pop-up Blocker Detected"
                message="Please allow pop-ups for this website to enable printing."
            />
        </>
    );
};

export default PrintManager;