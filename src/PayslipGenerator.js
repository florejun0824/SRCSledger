import React, { useState } from 'react';
import PayslipDisplay from './PayslipDisplay';
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';

const PayslipGenerator = ({ employee }) => {
  const [payslipDetails, setPayslipDetails] = useState({
    startDate: '',
    endDate: '',
    bookkeeperName: '',
    employeeSignatoryName: '',
  });
  const [payslip, setPayslip] = useState(null);

  const generatePayslip = () => {
    if (!employee) return;
    
    const basic = parseFloat(employee.basicSalary) || 0;
    const costOfLivingAllowance = parseFloat(employee.costOfLivingAllowance) || 0;
    const totalOtherDeductions = (employee.otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);
    
    const sss = getSssContribution(basic);
    const philhealth = getPhilhealthContribution(basic);
    const pagibig = getPagibigContribution(basic);
    const ceap = getCeapContribution(basic);

    const grossSalary = basic + costOfLivingAllowance;
    const totalDeductions = totalOtherDeductions + sss + philhealth + pagibig + ceap;
    const netSalary = grossSalary - totalDeductions;

    setPayslip({
      ...employee,
      ...payslipDetails,
      grossSalary,
      totalDeductions,
      netSalary,
      sssContribution: sss,
      philhealthContribution: philhealth,
      pagibigContribution: pagibig,
      ceapContribution: ceap,
      totalOtherDeductions,
    });
  };
  
  // ... other handlers like handlePayslipDetailsChange

  return (
    <div>
      {/* Inputs for payslipDetails (start date, end date, etc.) */}
      <div className="mb-8 text-center">
        <button
          onClick={generatePayslip}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl"
        >
          Generate Payslip
        </button>
      </div>
      {payslip && <PayslipDisplay payslipData={payslip} />}
    </div>
  );
};

export default PayslipGenerator;