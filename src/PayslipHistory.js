// src/PayslipHistory.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const PayslipHistory = ({
    payslipHistory,
    employees,
    handleDeletePayslip,
    setPayslip,
    startDate,
    endDate,
}) => {
    
    // UPDATED: This function now checks the historical snapshot first
    const getDisplayName = (payslip) => {
        // 1. First, try to use the name saved on the payslip itself (Historical Data)
        if (payslip.name) {
            return payslip.name;
        }

        // 2. Fallback: Try to find the employee in the current active list
        const employee = employees.find((emp) => emp.id === payslip.employeeDocId);
        return employee ? employee.name : 'Unknown Employee';
    };

    const handleSelectPayslip = (payslip) => {
        setPayslip(payslip);
    };

    const startRange = new Date(startDate);
    startRange.setHours(0, 0, 0, 0);
    const endRange = new Date(endDate);
    endRange.setHours(23, 59, 59, 999);

    // Filter by date, then Sort Alphabetically
    const filteredPayslips = payslipHistory
        .filter(p => {
            if (!p.startDate) return false;
            const payslipDate = new Date(`${p.startDate}T00:00:00`);
            return payslipDate >= startRange && payslipDate <= endRange;
        })
        .sort((a, b) => {
            const nameA = getDisplayName(a).toLowerCase();
            const nameB = getDisplayName(b).toLowerCase();
            return nameA.localeCompare(nameB);
        });

    return (
        <div className="p-1 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-6 px-4 pt-4">Payslip History</h2>
            {filteredPayslips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-4">
                    {filteredPayslips.map((payslip) => (
                        <div
                            key={payslip.id}
                            onClick={() => handleSelectPayslip(payslip)}
                            className="p-5 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:shadow-cyan-500/20 hover:-translate-y-1 bg-slate-900/70 border border-slate-700 group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                                    {/* UPDATED: Calling the new helper function with the full payslip object */}
                                    {getDisplayName(payslip)}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePayslip(payslip.id);
                                    }}
                                    className="text-slate-500 hover:text-red-500 p-1 rounded-full transition-colors duration-200 opacity-50 group-hover:opacity-100"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                            <div className="space-y-1 text-sm text-slate-400">
                                <p>
                                    <span className="font-semibold text-slate-300">Period:</span> {payslip.startDate} to {payslip.endDate}
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-300">Generated:</span> {new Date(payslip.generatedAt.seconds * 1000).toLocaleDateString()}
                                </p>
                                <p className="text-xl font-bold text-green-400 pt-2 mt-2 border-t border-slate-700">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(payslip.netSalary)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-slate-800/70 rounded-lg m-4">
                    <FontAwesomeIcon icon={faFolderOpen} className="mx-auto h-16 w-16 text-slate-600" />
                    <h3 className="mt-4 text-xl font-medium text-white">No Payslips Found</h3>
                    <p className="mt-1 text-sm text-slate-400">
                        There are no payslips recorded for the selected date range. Please try adjusting the dates.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PayslipHistory;