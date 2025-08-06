// src/PayslipHistory.js
import React, { useState, useEffect } from 'react';
import PayslipModal from './PayslipModal';
import { Timestamp } from 'firebase/firestore';

const PayslipHistory = ({ payslipHistory, employees, payslipDetails, setPayslipDetails, handleDeletePayslip }) => {
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [filteredPayslips, setFilteredPayslips] = useState([]);

  useEffect(() => {
    if (startDateFilter && endDateFilter) {
      const start = new Date(startDateFilter);
      const end = new Date(endDateFilter);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const tempFilteredPayslips = payslipHistory.filter(payslip => {
        const payslipDate = payslip.generatedAt instanceof Timestamp ? payslip.generatedAt.toDate() : payslip.generatedAt;
        const payslipPeriodStart = new Date(payslip.startDate);
        const payslipPeriodEnd = new Date(payslip.endDate);
        return payslipPeriodStart >= start && payslipPeriodEnd <= end;
      });
      setFilteredPayslips(tempFilteredPayslips);
    } else {
      setFilteredPayslips([]);
    }
  }, [payslipHistory, startDateFilter, endDateFilter]);

  const handleOpenModal = (payslip) => {
    setSelectedPayslip(payslip);
  };

  const handleCloseModal = () => {
    setSelectedPayslip(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Payslip History</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            id="startDateFilter"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            id="endDateFilter"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="h-[500px] overflow-y-auto pr-2 -mr-2">
        {(startDateFilter && endDateFilter) ? (
          filteredPayslips.length > 0 ? (
            filteredPayslips.map((payslip) => (
              <div
                key={payslip.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between hover:bg-gray-100 transition duration-200"
              >
                <div>
                  <p className="font-semibold text-gray-800">{payslip.name}</p>
                  <p className="text-sm text-gray-500">
                    {payslip.startDate && payslip.endDate
                      ? `${new Date(payslip.startDate).toLocaleDateString()} - ${new Date(payslip.endDate).toLocaleDateString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(payslip);
                    }}
                    className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition duration-300"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Are you sure you want to delete this payslip? This action cannot be undone.")) {
                        handleDeletePayslip(payslip.id);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">No payslips found for the selected date range.</p>
          )
        ) : (
          <p className="text-center text-gray-500 py-10">Please select a date range to view payslip history.</p>
        )}
      </div>

      <PayslipModal
        payslip={selectedPayslip}
        onClose={handleCloseModal}
        employees={employees}
        payslipDetails={payslipDetails}
        setPayslipDetails={setPayslipDetails}
      />
    </div>
  );
};

export default PayslipHistory;