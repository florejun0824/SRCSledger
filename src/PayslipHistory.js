// src/PayslipHistory.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const PayslipHistory = ({
    payslipHistory,
    employees,
    handleDeletePayslip,
    setPayslip,
    startDate, // New prop for filtering
    endDate,   // New prop for filtering
}) => {
    const getEmployeeName = (employeeDocId) => {
        const employee = employees.find((emp) => emp.id === employeeDocId);
        return employee ? employee.name : 'Unknown Employee';
    };

    const handleSelectPayslip = (payslip) => {
        setPayslip(payslip); // This opens the modal
    };

    // --- Date Filtering Logic ---
    const startRange = new Date(startDate);
    startRange.setHours(0, 0, 0, 0); // Set to the beginning of the start day

    const endRange = new Date(endDate);
    endRange.setHours(23, 59, 59, 999); // Set to the end of the end day

    const filteredPayslips = payslipHistory.filter(p => {
        if (!p.startDate) return false;
        // Create a date object from the payslip's start date string
        // Appending T00:00:00 avoids potential timezone-related parsing issues
        const payslipDate = new Date(`${p.startDate}T00:00:00`);
        // Check if the payslip's period starts within the selected range
        return payslipDate >= startRange && payslipDate <= endRange;
    });
    // --- End of Filtering Logic ---

    return (
        <div className="p-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Payslip History</h2>
            {filteredPayslips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredPayslips.map((payslip) => (
                        <div
                            key={payslip.id}
                            onClick={() => handleSelectPayslip(payslip)}
                            className="p-5 border rounded-xl shadow-sm cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200 group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {getEmployeeName(payslip.employeeDocId)}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click when deleting
                                        handleDeletePayslip(payslip.id);
                                    }}
                                    className="text-gray-400 hover:text-red-600 p-1 rounded-full transition-colors duration-200 opacity-50 group-hover:opacity-100"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                    <span className="font-semibold">Period:</span> {payslip.startDate} to {payslip.endDate}
                                </p>
                                <p>
                                    <span className="font-semibold">Generated:</span> {new Date(payslip.generatedAt.seconds * 1000).toLocaleDateString()}
                                </p>
                                <p className="text-lg font-semibold text-green-600 pt-2 mt-2 border-t border-gray-100">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(payslip.netSalary)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Payslips Found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There are no payslips recorded for the selected date range. Please try adjusting the dates.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PayslipHistory;