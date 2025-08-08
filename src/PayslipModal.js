import React, { useRef } from 'react';
import PayslipDisplay from './PayslipDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPrint } from '@fortawesome/free-solid-svg-icons';
import ReactDOMServer from 'react-dom/server';

const PayslipModal = ({ payslipData, onClose }) => {
  const payslipRef = useRef();

  if (!payslipData) {
    return null;
  }

  const handlePrint = () => {
    const payslipHtml = payslipRef.current.innerHTML;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
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
            .page-container { width: 7.5in; height: 12in; padding: 0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; }
            .employee-payslip-section { display: flex; justify-content: center; align-items: flex-start; height: 5.9in; margin-bottom: 0.2in; gap: 0.2in; }
            .payslip-copy { width: 3.65in; height: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 0.08in; padding: 0.15in; overflow: hidden; background-color: #ffffff; box-shadow: 0 0 0.05in rgba(0,0,0,0.05); }
            .payslip-copy:first-child { margin-right: 0in; }
            .payslip-copy > div { height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 0 !important; border: none !important; box-shadow: none !important; background-color: transparent !important; max-width: none !important; margin: 0 !important; }
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
            .payslip-copy .payslip-print-header { border-bottom: 1px solid #eee; padding-bottom: 0.1in; margin-bottom: 0.1in; text-align: center; }
            .payslip-copy .payslip-print-header p { font-size: 0.38rem; color: #777; }
            .payslip-copy .text-md.font-bold.text-gray-700.mb-2.border-b.pb-1 { font-size: 0.55rem; font-weight: 700; color: #444; background-color: #f9f9f9; padding: 0.05in 0.1in; border-radius: 0.04in; border-bottom: none; margin-bottom: 0.06in; text-align: left; border: 1px solid #eee; }
            .payslip-copy .text-sm.mb-4.border-b.border-gray-200.pb-3 { margin-bottom: 0.08in; padding-bottom: 0.08in; border-bottom: 1px dashed #e5e5e5; }
            .payslip-copy .text-sm.mb-4.border-b.border-gray-200.pb-3 .flex.justify-between.mb-1 { margin-bottom: 0.015in; }
            .payslip-copy .text-sm.mb-4.border-b.border-gray-200.pb-3 .font-semibold.text-gray-700 { font-weight: 600; color: #555; }
            .payslip-copy .grid.grid-cols-2.gap-y-1.text-sm { gap-y: 0.03in; font-size: 0.48rem; }
            .payslip-copy .grid.grid-cols-2.gap-y-1.text-sm p { line-height: 1.25; }
            .payslip-copy .grid.grid-cols-2.gap-y-1.text-sm p.text-right { font-weight: 500; }
            .payslip-copy .col-span-2.border-t.mt-2.pt-2 { border-top: 1px solid #eee; margin-top: 0.06in; padding-top: 0.06in; }
            .payslip-copy .col-span-2.border-t.mt-2.pt-2 .font-bold.text-gray-800 { font-size: 0.55rem; color: #444; }
            .payslip-copy .col-span-2.border-t.mt-2.pt-2 .text-right.font-bold { font-size: 0.55rem; color: #444; }
            .payslip-copy .col-span-2.border-t.mt-2.pt-2 .text-right.font-bold.text-lg.text-indigo-600 { font-size: 0.7rem; color: #007bff; }
            .payslip-copy .text-xl.font-bold.border-t-2.pt-4.mt-6 { font-size: 0.75rem; border-top: 2px solid #555; padding-top: 0.1in; margin-top: 0.12in; color: #222; }
            .payslip-copy .text-xl.font-bold.border-t-2.pt-4.mt-6 .text-green-700 { font-size: 0.9rem; font-weight: 700; color: #28a745; }
            .payslip-copy .mt-8.grid.grid-cols-2.gap-8.text-center.text-sm { margin-top: 0.2in; gap: 0.35in; font-size: 0.48rem; }
            .payslip-copy .signature-line-placeholder { border-bottom: 1px solid #999; padding-bottom: 0.07in; margin-bottom: 0.03in; width: 85%; margin-left: auto; margin-right: auto; }
            .payslip-copy .font-semibold { margin-top: 0.03in; color: #444; }
            .payslip-copy .text-gray-600.text-xs { font-size: 0.4rem; color: #888; margin-top: 0.01in; }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="employee-payslip-section">
              <div class="payslip-copy">
                ${payslipHtml}
              </div>
              <div class="payslip-copy">
                ${payslipHtml}
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-2xl leading-6 font-medium text-gray-900" id="modal-title">
                  Payslip Details
                </h3>
                <div className="mt-4" ref={payslipRef}>
                  <PayslipDisplay payslipData={payslipData} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handlePrint}
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" />
              Print Payslip
            </button>
            <button
              onClick={onClose}
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;