import React, { useContext } from 'react';
import { EmployeeContext } from './EmployeeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

const PayslipHistory = ({ payslipHistory, handleDeletePayslip, employees }) => {
  const { setSelectedPayslipData, setShowPayslipModal } = useContext(EmployeeContext);

  const handleSelectPayslip = (payslip) => {
    // Find the corresponding full employee record to ensure all data is available
    const employee = employees.find(emp => emp.id === payslip.employeeDocId);
    if (employee) {
      const fullPayslipData = { ...employee, ...payslip };
      setSelectedPayslipData(fullPayslipData);
      setShowPayslipModal(true); // Open the modal
    }
  };
  
  // New function with confirmation
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
  
  // Create a map for quick employee name lookup
  const employeeMap = employees.reduce((acc, employee) => {
    acc[employee.id] = employee.name;
    return acc;
  }, {});

  // Sort the payslipHistory alphabetically by employee name
  const sortedPayslipHistory = [...payslipHistory].sort((a, b) => {
    const nameA = employeeMap[a.employeeDocId]?.toLowerCase() || '';
    const nameB = employeeMap[b.employeeDocId]?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Payslip History</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPayslipHistory.length > 0 ? (
              sortedPayslipHistory.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.startDate)} - {formatDate(p.endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{parseFloat(p.netSalary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleSelectPayslip(p)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="View Payslip"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => handleDeleteWithConfirmation(p.id, p.name)}
                      className="text-red-600 hover:text-red-900"
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
  );
};

export default PayslipHistory;