// src/PayslipModal.js
import React from 'react';
import PayslipDisplay from './PayslipDisplay';
import PrintManager from './PrintManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const PayslipModal = ({ payslip, onClose, employees, payslipDetails, setPayslipDetails, startDate, endDate, handlePayslipDeductionChange }) => {
  if (!payslip) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-2xl shadow-cyan-500/10 transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative border border-slate-700">
          
          <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-200 z-10"
              aria-label="Close"
          >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
          </button>
          
          <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-bold text-white mb-4" id="modal-title">
                  Payslip for {payslip.name}
                </h3>
                <div className="mt-2 rounded-lg overflow-hidden">
                  <PayslipDisplay payslipData={payslip} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-700">
            <div className="sm:mt-0 mt-3 w-full sm:w-auto sm:ml-3">
              <PrintManager
                payslip={payslip}
                employees={employees}
                payslipDetails={payslipDetails}
                setPayslipDetails={setPayslipDetails}
                startDate={startDate}
                endDate={endDate}
                handlePayslipDeductionChange={handlePayslipDeductionChange}
              />
            </div>
             <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-700 text-base font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;