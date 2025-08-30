// src/PayslipHistory.js
import React, { useContext } from 'react';
import { EmployeeContext } from './EmployeeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

const PayslipHistory = ({ payslipHistory, handleDeletePayslip, employees }) => {
  const { setSelectedPayslipData, setShowPayslipModal } = useContext(EmployeeContext);

  const handleSelectPayslip = (payslip) => {
    const employee = employees.find(emp => emp.id === payslip.employeeDocId);
    if (employee) {
      const fullPayslipData = { ...employee, ...payslip };
      setSelectedPayslipData(fullPayslipData);
      setShowPayslipModal(true);
    }
  };
  
  const handleDeleteWithConfirmation = (payslipId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete the payslip for ${employeeName}? This action cannot be undone.`)) {
      handleDeletePayslip(payslipId);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    const date = new Date(`${dateInput}T00:00:00`);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const employeeMap = employees.reduce((acc, employee) => {
    acc[employee.id] = employee.name;
    return acc;
  }, {});

  const sortedPayslipHistory = [...payslipHistory].sort((a, b) => {
    const nameA = employeeMap[a.employeeDocId]?.toLowerCase() || '';
    const nameB = employeeMap[b.employeeDocId]?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });
  
  // Minimalist Elegance UI CSS classes
  const containerClass = "bg-white p-8 rounded-2xl shadow-lg";
  const titleClass = "text-3xl font-bold text-gray-800";
  const tableContainerClass = "overflow-hidden rounded-lg shadow-inner border border-gray-300";
  const tableHeaderClass = "py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100";
  const tableRowClass = "hover:bg-gray-50 transition-colors duration-200 ease-in-out";
  const tableCellClass = "py-4 px-6 whitespace-nowrap text-sm text-gray-700";
  const tableCellRightClass = "py-4 px-6 whitespace-nowrap text-right text-sm";
  const actionButtonClass = "text-blue-600 hover:text-blue-900 mx-2 transition-all duration-200 transform hover:scale-110";
  const deleteButtonClass = "text-red-600 hover:text-red-900 mx-2 transition-all duration-200 transform hover:scale-110";

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-12">
        <div className={containerClass}>
          <h2 className={titleClass}>Payslip History</h2>
          <p className="text-md text-gray-500 mb-6">A clear view of all generated payslips.</p>
          <div className={tableContainerClass}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th scope="col" className={`${tableHeaderClass} rounded-tl-lg`}>Employee Name</th>
                  <th scope="col" className={tableHeaderClass}>Pay Period</th>
                  <th scope="col" className={tableHeaderClass}>Net Pay</th>
                  <th scope="col" className={`${tableHeaderClass} text-right rounded-tr-lg`}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedPayslipHistory.length > 0 ? (
                  sortedPayslipHistory.map((p) => (
                    <tr key={p.id} className={tableRowClass}>
                      <td className={`${tableCellClass} font-semibold text-gray-900`}>{p.name}</td>
                      <td className={tableCellClass}>{formatDate(p.startDate)} - {formatDate(p.endDate)}</td>
                      <td className={tableCellClass}>₱{parseFloat(p.netSalary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={tableCellRightClass}>
                        <button
                          onClick={() => handleSelectPayslip(p)}
                          className={actionButtonClass}
                          title="View Payslip"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => handleDeleteWithConfirmation(p.id, p.name)}
                          className={deleteButtonClass}
                          title="Delete Payslip"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No payslips found for the selected date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipHistory;