// src/PayslipGenerator.js
import React, { useContext } from 'react';
import PayslipDisplay from './PayslipDisplay';
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import { EmployeeContext } from './EmployeeContext'; // Import the EmployeeContext

const PayslipGenerator = ({ employee, startDate, endDate, handleGeneratePayslip }) => {
  if (!employee) return null;

  const { generatedPayslip, setGeneratedPayslip } = useContext(EmployeeContext); // Use useContext to get the setter function

  const handleGenerate = () => {
    // This function will be called from the parent component
    // It is responsible for generating the payslip object
    const basic = parseFloat(employee.basicSalary) || 0;
    const costOfLivingAllowance = parseFloat(employee.costOfLivingAllowance) || 0;

    // Deductions from App.js's initialEmployeeState
    const sssLoan = parseFloat(employee.sssLoan) || 0;
    const pagibigLoanSTL = parseFloat(employee.pagibigLoanSTL) || 0;
    const pagibigLoanCL = parseFloat(employee.pagibigLoanCL) || 0;
    const personalLoan = parseFloat(employee.personalLoan) || 0;
    const cashAdvance = parseFloat(employee.cashAdvance) || 0;
    const canteen = parseFloat(employee.canteen) || 0;
    
    // Other Deductions
    const otherDeductions = (employee.otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);
    const tithings = parseFloat(employee.tithings) || 0; // Assuming tithings is part of employee state or passed separately

    // Social Contributions
    const sssContribution = getSssContribution(basic);
    const philhealthContribution = getPhilhealthContribution(basic);
    const pagibigContribution = getPagibigContribution(basic);
    const ceapContribution = getCeapContribution(basic);

    // Totals
    const grossSalary = basic + costOfLivingAllowance;
    const totalDeductions = sssContribution + philhealthContribution + pagibigContribution + ceapContribution + sssLoan + pagibigLoanSTL + pagibigLoanCL + personalLoan + cashAdvance + canteen + otherDeductions + tithings;
    const netSalary = grossSalary - totalDeductions;

	const formatDate = (date) => {
	  if (!date) return '';
	  if (date instanceof Date) return date.toISOString().split('T')[0]; // YYYY-MM-DD
	  return date; // assume already string
	};

	const newPayslip = {
	  name: employee.name,
	  employeeId: employee.employeeId,
	  startDate: formatDate(startDate),
	  endDate: formatDate(endDate),
	  basicSalary: basic,
	  costOfLivingAllowance,
	  grossSalary,
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
	  otherDeductions: employee.otherDeductions,
	  totalDeductions,
	  netSalary,
	};

    // Update the global state instead of the local state
    setGeneratedPayslip(newPayslip);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Payslip</button>
      {generatedPayslip && <PayslipDisplay payslipData={generatedPayslip} />}
    </div>
  );
};

export default PayslipGenerator;