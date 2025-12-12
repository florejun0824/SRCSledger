// src/PrintManager.js
import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import PrintOptionsModal from './PrintOptionsModal';
import ConfirmationModal from './ConfirmationModal';
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

const formatDateForPrinting = (dateInput) => {
    if (dateInput instanceof Date && !isNaN(dateInput)) {
        return dateInput.toISOString().split('T')[0];
    }
    return null;
};

const renderPayslipToHtml = (payslipData) => {
    const {
        name, employeeId, startDate, endDate, basicSalary, costOfLivingAllowance,
        otherDeductions, sssContribution, philhealthContribution, pagibigContribution,
        ceapContribution, tithings, pagibigLoanSTL, pagibigLoanCL, pagibigLoanMPL, sssLoan,
        personalLoan, cashAdvance, canteen, grossSalary, totalDeductions, netSalary, bookkeeperName,
    } = payslipData;

    const formatDate = (dateInput) => {
        if (!dateInput || typeof dateInput !== 'string') return 'N/A';
        const [year, month, day] = dateInput.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatCurrency = (amount) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return '₱0.00';
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(numericAmount);
    };

    const allDeductions = [
        { label: 'SSS Contribution', value: sssContribution },
        { label: 'Philhealth', value: philhealthContribution },
        { label: 'Pag-IBIG Contrib.', value: pagibigContribution },
        { label: 'CEAP Contribution', value: ceapContribution },
        { label: 'Tithings', value: tithings },
        { label: 'Pag-IBIG Loan-STL', value: pagibigLoanSTL },
        { label: 'Pag-IBIG Loan-CL', value: pagibigLoanCL },
        { label: 'Pag-IBIG Loan-MPL', value: pagibigLoanMPL },
        { label: 'SSS Loan', value: sssLoan },
        { label: 'Personal Loan', value: personalLoan },
        { label: 'Cash Advance', value: cashAdvance },
        { label: 'Canteen', value: canteen },
        ...(otherDeductions || []).map(d => ({ label: d.name, value: d.amount }))
    ];

    const visibleDeductions = allDeductions.filter(d => parseFloat(d.value) > 0);
    const deductionCount = visibleDeductions.length;

    const deductionsHtml = visibleDeductions.map(d => `
        <div class="details-row">
            <p>${d.label}:</p>
            <p class="text-right">${formatCurrency(d.value)}</p>
        </div>
    `).join('');

    return `
        <div class="payslip-container" data-deduction-count="${deductionCount}">
            <div class="header">
                <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="Logo" />
                <h1>SAN RAMON CATHOLIC SCHOOL, INC.</h1>
                <p>Su-ay, Himamaylan City, Negros Occidental</p>
                <h2>PAYSLIP</h2>
                <p class="period">Period: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
            </div>
            <div class="employee-details">
                <div><span>Employee Name:</span><strong>${name}</strong></div>
                <div><span>Employee ID:</span><strong>${employeeId || 'N/A'}</strong></div>
            </div>
            <div class="main-content">
                <div class="section">
                    <h3>EARNINGS</h3>
                    <div class="details-grid">
                        <div class="details-row"><p>Basic Salary:</p><p class="text-right font-semibold">${formatCurrency(basicSalary)}</p></div>
                        ${parseFloat(costOfLivingAllowance) > 0 ? `<div class="details-row"><p>COLA:</p><p class="text-right">${formatCurrency(costOfLivingAllowance)}</p></div>` : ''}
                    </div>
                    <div class="total-row">
                        <p>Gross Salary:</p>
                        <p class="amount-prominent">${formatCurrency(grossSalary)}</p>
                    </div>
                </div>
                <div class="section">
                    <h3>DEDUCTIONS</h3>
                    <div class="details-grid">${deductionsHtml}</div>
                    <div class="total-row">
                        <p>Total Deductions:</p>
                        <p class="amount-prominent deduction">${formatCurrency(totalDeductions)}</p>
                    </div>
                </div>
            </div>
            <div class="net-pay-section">
                <span>NET PAY:</span>
                <span>${formatCurrency(netSalary)}</span>
            </div>
            <div class="signature-section">
                <div class="signature-box">
                    <p class="name">${name}</p>
                    <p class="title">Employee Signature</p>
                </div>
                <div class="signature-box">
                    <p class="name">${bookkeeperName}</p>
                    <p class="title">Bookkeeper Signature</p>
                </div>
            </div>
        </div>
    `;
};


const PrintManager = ({ payslip, employees, payslipDetails, setPayslipDetails, startDate, endDate, handlePayslipDeductionChange }) => {
    const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
    const [showNoPayslipAlert, setShowNoPayslipAlert] = useState(false);
    const [showPopupBlockerAlert, setShowPopupBlockerAlert] = useState(false);
    const [printOption, setPrintOption] = useState('current');
    const [selectedEmployeesForPrint, setSelectedEmployeesForPrint] = useState([]);

    const handleOpenPrintOptions = () => {
        if (payslip || employees.length > 0) {
            setShowPrintOptionsModal(true);
        } else {
            setShowNoPayslipAlert(true);
        }
    };

    const handleClosePrintOptions = () => setShowPrintOptionsModal(false);

    const handleSelectEmployeesForPrint = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
        setSelectedEmployeesForPrint(selectedIds);
    };

    const generatePayslipObjectForEmployee = (employee, pStartDate, pEndDate) => {
        const basic = Number(employee.basicSalary) || 0;
        const costOfLivingAllowance = Number(employee.costOfLivingAllowance) || 0;
        const sss = getSssContribution(basic);
        const philhealth = getPhilhealthContribution(basic);
        const pagibig = getPagibigContribution(basic);
        const ceap = getCeapContribution(basic);
        
        const { pagibigLoanSTL, pagibigLoanCL, pagibigLoanMPL, sssLoan, personalLoan, cashAdvance, canteen, otherDeductions } = employee;
        const { tithings } = payslipDetails;

        const totalStatutory = sss + philhealth + pagibig + ceap;
        const totalLoans = Number(pagibigLoanSTL) + Number(pagibigLoanCL) + Number(pagibigLoanMPL) + Number(sssLoan) + Number(personalLoan) + Number(cashAdvance);
        const totalOther = (otherDeductions || []).reduce((sum, ded) => sum + (Number(ded.amount) || 0), 0) + Number(tithings) + Number(canteen);

        const grossSalary = basic + costOfLivingAllowance;
        const totalDeductions = totalStatutory + totalLoans + totalOther;
        const netSalary = grossSalary - totalDeductions;

        return {
            ...employee,
            ...payslipDetails,
            startDate: formatDateForPrinting(pStartDate),
            endDate: formatDateForPrinting(pEndDate),
            grossSalary, totalDeductions, netSalary,
            sssContribution: sss, philhealthContribution: philhealth, pagibigContribution: pagibig, ceapContribution: ceap,
        };
    };

    const executePrint = (printConfig) => {
        let payslipsToGenerate = [];

        if (printOption === 'current' && payslip) {
            payslipsToGenerate.push(payslip);
        } else if (printConfig && (printOption === 'selected' || printOption === 'all')) {
            const { printStartDate, printEndDate } = printConfig;
            
            if (printOption === 'selected') {
                payslipsToGenerate = employees
                    .filter(emp => selectedEmployeesForPrint.includes(emp.id))
                    .map(emp => generatePayslipObjectForEmployee(emp, printStartDate, printEndDate));
            } else if (printOption === 'all') {
                payslipsToGenerate = employees.map(emp => generatePayslipObjectForEmployee(emp, printStartDate, printEndDate));
            }
        }

        if (payslipsToGenerate.length === 0) {
            setShowNoPayslipAlert(true);
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setShowPopupBlockerAlert(true);
            return;
        }
        
        const payslipChunks = [];
        for (let i = 0; i < payslipsToGenerate.length; i += 2) {
            payslipChunks.push(payslipsToGenerate.slice(i, i + 2));
        }

        const pagesHtml = payslipChunks.map(chunk => {
            const payslip1Html = renderPayslipToHtml(chunk[0]);
            const payslip2Html = chunk[1] ? renderPayslipToHtml(chunk[1]) : '<div class="employee-section"></div>';

            return `
                <div class="page">
                    <div class="employee-section">
                        <div class="payslip-copy">${payslip1Html}</div>
                        <div class="payslip-copy">${payslip1Html}</div>
                    </div>
                    <div class="employee-section">
                        ${chunk[1] ? `
                        <div class="payslip-copy">${payslip2Html}</div>
                        <div class="payslip-copy">${payslip2Html}</div>
                        ` : '<div class="payslip-copy-placeholder"></div><div class="payslip-copy-placeholder"></div>'}
                    </div>
                </div>
            `;
        }).join('');


        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payslip Print</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    :root { --base-font-size: 9.5pt; }
                    @page { size: 8.5in 13in; margin: 0.5in; }
                    body { margin: 0; font-family: 'Roboto', 'Inter', sans-serif; background-color: #f0f0f0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .page { display: flex; flex-direction: column; gap: 0.2in; width: 7.5in; height: 12in; box-sizing: border-box; page-break-after: always; }
                    .employee-section { display: flex; flex: 1; gap: 0.2in; min-height: 0; }
                    .payslip-copy { flex: 1; border: 1px solid #ccc; background: white; box-sizing: border-box; display: flex; }
                    .payslip-copy-placeholder { flex: 1; }
                    
                    .payslip-container { display: flex; flex-direction: column; width: 100%; padding: 0.2in; box-sizing: border-box; font-size: var(--base-font-size); }
                    .header { text-align: center; border-bottom: 1.5px solid #bbb; padding-bottom: 0.15in; margin-bottom: 0.15in; }
                    .header img { height: 0.5in; margin-bottom: 0.1in; }
                    .header h1 { font-size: 1.1em; font-weight: 700; margin: 0; color: #000; }
                    .header p { font-size: 0.8em; margin: 1px 0 0; color: #333; }
                    .header h2 { font-size: 1em; font-weight: 700; margin: 0.1in 0 0.05in; color: #000; }
                    .header .period { font-size: 0.75em; color: #555; }
                    
                    .employee-details { display: flex; justify-content: space-between; margin-bottom: 0.15in; padding: 0.1in; background-color: #f8f8f8; border-radius: 4px; }
                    .employee-details div { font-size: 0.9em; display: flex; flex-direction: column; }
                    .employee-details span { color: #555; font-size: 0.8em; }
                    .employee-details strong { font-weight: 700; color: #000; }

                    .main-content { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2in; flex-grow: 1; }
                    .section h3 { font-size: 0.9em; font-weight: 700; padding-bottom: 0.08in; margin: 0 0 0.08in; border-bottom: 1.5px solid #555; }
                    .section:last-child h3 { border-bottom-color: #c00; }
                    .details-grid { font-size: 0.85em; }
                    .details-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .details-row p { margin: 0; }
                    .details-row .text-right { font-weight: 500; }

                    .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.95em; border-top: 1.5px solid #ccc; padding-top: 0.08in; margin-top: 0.08in; }
                    .total-row p { margin: 0; }
                    .total-row .amount-prominent { color: #005a9e; }
                    .total-row .amount-prominent.deduction { color: #b00; }

                    .net-pay-section { display: flex; justify-content: space-between; align-items: center; background-color: #e8e8e8; padding: 0.15in; border-radius: 6px; margin-top: 0.15in; }
                    .net-pay-section span:first-child { font-size: 1.1em; font-weight: 800; color: #000; }
                    .net-pay-section span:last-child { font-size: 1.3em; font-weight: 800; color: #007f00; }
                    
                    .signature-section { display: flex; justify-content: space-around; margin-top: auto; padding-top: 0.25in; }
                    .signature-box { text-align: center; width: 45%; }
                    .signature-box .name { font-weight: 700; font-size: 0.8em; padding-top: 0.08in; border-top: 1px solid #333; }
                    .signature-box .title { font-size: 0.75em; color: #555; }
                </style>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const payslips = document.querySelectorAll('.payslip-container');
                        payslips.forEach(payslip => {
                            const count = parseInt(payslip.getAttribute('data-deduction-count'), 10);
                            let fontSize = 9.5;
                            if (count > 8) {
                                fontSize = Math.max(7.0, 9.5 - (count - 8) * 0.4);
                            }
                            payslip.style.fontSize = fontSize + 'pt';
                        });
                    });
                </script>
            </head>
            <body>${pagesHtml}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
        handleClosePrintOptions();
    };

    return (
        <>
            <button
                onClick={handleOpenPrintOptions}
                className="w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105 flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faPrint} /> Print Payslips
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
                handlePayslipDeductionChange={handlePayslipDeductionChange}
            />
            <ConfirmationModal
                isOpen={showNoPayslipAlert}
                onClose={() => setShowNoPayslipAlert(false)}
                title="No Payslip to Print"
                message="Please generate or select a payslip first, or choose to print for all/selected employees."
            />
            <ConfirmationModal
                isOpen={showPopupBlockerAlert}
                onClose={() => setShowPopupBlockerAlert(false)}
                title="Pop-up Blocker Detected"
                message="Your browser blocked the print window. Please allow pop-ups for this site to enable printing."
            />
        </>
    );
};

export default PrintManager;