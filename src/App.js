import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

// Corrected import paths for files directly in src/
import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import EmployeeForm from './EmployeeForm';
import PayslipDisplay from './PayslipDisplay';
import PrintOptionsModal from './PrintOptionsModal';
import LoginScreen from './LoginScreen'; // Import the new LoginScreen component

// Firebase configuration (provided by the environment)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? initialAuthToken : null;

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Main App component
const App = () => {
  // State variables for employee data and payslip details
  const [employee, setEmployee] = useState({
    id: null, // Firestore document ID for existing employee
    name: '',
    employeeId: '',
    basicSalary: '',
    costOfLivingAllowance: '',
    otherDeductions: [],
    sssContribution: 0,
    philhealthContribution: 0,
    pagibigContribution: 0,
    ceapContribution: 0,
  });

  const [payslip, setPayslip] = useState(null);
  const [employees, setEmployees] = useState([]); // List of stored employees
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To ensure auth is ready before Firestore ops

  // State for payslip specific details (not stored with employee master data)
  const [payslipDetails, setPayslipDetails] = useState({
    startDate: '',
    endDate: '',
    bookkeeperName: '',
    employeeSignatoryName: '',
  });

  // Print Modal States
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [printOption, setPrintOption] = useState('current'); // 'current', 'selected', 'all'
  const [selectedEmployeesForPrint, setSelectedEmployeesForPrint] = useState([]); // Array of employee IDs

  // Effect to handle Firebase authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          // If no initial token, try anonymous sign-in, but this will be overridden by email/password
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Firebase auth error during initial sign-in:", e);
        setError("Failed to initialize authentication.");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        setLoading(false); // Auth is ready, stop loading
      } else {
        setUserId(null); // No user logged in
        setIsAuthReady(false); // Auth is not ready for data operations
        setLoading(false); // Stop loading, show login screen
      }
    });

    // If auth state is not yet determined, try initial anonymous sign-in
    if (!auth.currentUser && !isAuthReady && !loading) {
      initializeAuth();
    }


    return () => unsubscribe(); // Cleanup auth listener
  }, []);

  // Effect to fetch employees from Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!isAuthReady || !userId) {
        setEmployees([]); // Clear employees if not authenticated
        return;
      }

      setLoading(true);
      try {
        const employeesCol = collection(db, `artifacts/${appId}/users/${userId}/employees`);
        const employeeSnapshot = await getDocs(employeesCol);
        const employeesList = employeeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeesList);
      } catch (e) {
        console.error("Error fetching employees:", e);
        setError("Failed to load employee data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isAuthReady, userId]); // Re-fetch when auth state or userId changes

  // Handle input changes for main employee form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  // Handle input changes for payslip specific details
  const handlePayslipDetailsChange = (e) => {
    const { name, value } = e.target;
    setPayslipDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle changes for dynamic other deductions
  const handleDeductionChange = (index, field, value) => {
    const updatedDeductions = [...employee.otherDeductions];
    updatedDeductions[index] = {
      ...updatedDeductions[index],
      [field]: value,
    };
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      otherDeductions: updatedDeductions,
    }));
  };

  // Add a new empty deduction field
  const handleAddDeductionField = () => {
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      otherDeductions: [...prevEmployee.otherDeductions, { name: '', amount: '' }],
    }));
  };

  // Remove a deduction field
  const handleRemoveDeductionField = (index) => {
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      otherDeductions: prevEmployee.otherDeductions.filter((_, i) => i !== index),
    }));
  };

  // Handle selection of an existing employee
  const handleSelectEmployee = (e) => {
    const selectedId = e.target.value;
    if (selectedId === "") {
      resetForm();
      return;
    }
    const selectedEmployee = employees.find(emp => emp.id === selectedId);
    if (selectedEmployee) {
      setEmployee({
        id: selectedEmployee.id,
        name: selectedEmployee.name,
        employeeId: selectedEmployee.employeeId,
        basicSalary: selectedEmployee.basicSalary,
        costOfLivingAllowance: '', // Clear allowances for new monthly input
        otherDeductions: [], // Clear other deductions for new monthly input
        sssContribution: getSssContribution(parseFloat(selectedEmployee.basicSalary) || 0),
        philhealthContribution: getPhilhealthContribution(parseFloat(selectedEmployee.basicSalary) || 0),
        pagibigContribution: getPagibigContribution(parseFloat(selectedEmployee.basicSalary) || 0),
        ceapContribution: getCeapContribution(parseFloat(selectedEmployee.basicSalary) || 0),
      });
      setPayslip(null); // Clear previous payslip
    }
  };

  // Add or update an employee in Firestore
  const handleSaveEmployee = async () => {
    if (!userId) {
      setError("User not authenticated. Please log in to save data.");
      return;
    }
    if (!employee.name || !employee.basicSalary) {
      setError("Employee Name and Basic Salary are required to save.");
      return;
    }

    setLoading(true);
    try {
      const employeeData = {
        name: employee.name,
        employeeId: employee.employeeId || '',
        basicSalary: parseFloat(employee.basicSalary) || 0,
      };

      if (employee.id) {
        const employeeRef = doc(db, `artifacts/${appId}/users/${userId}/employees`, employee.id);
        await setDoc(employeeRef, employeeData, { merge: true });
      } else {
        const employeesCol = collection(db, `artifacts/${appId}/users/${userId}/employees`);
        const docRef = await addDoc(employeesCol, employeeData);
        employeeData.id = docRef.id;
      }

      const employeesCol = collection(db, `artifacts/${appId}/users/${userId}/employees`);
      const employeeSnapshot = await getDocs(employeesCol);
      const employeesList = employeeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeesList);
      setError(null);
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center">
          <p class="text-lg font-semibold mb-4">Employee saved successfully!</p>
          <button id="closeMessageBox" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      document.getElementById('closeMessageBox').onclick = () => document.body.removeChild(messageBox);

    } catch (e) {
      console.error("Error saving employee:", e);
      setError("Failed to save employee data.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an employee from Firestore
  const handleDeleteEmployee = async () => {
    if (!userId || !employee.id) {
      setError("No employee selected or user not authenticated.");
      return;
    }

    const confirmBox = document.createElement('div');
    confirmBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    confirmBox.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl text-center">
        <p class="text-lg font-semibold mb-4">Are you sure you want to delete ${employee.name}?</p>
        <button id="confirmDelete" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mr-2">Yes, Delete</button>
        <button id="cancelDelete" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
      </div>
    `;
    document.body.appendChild(confirmBox);

    document.getElementById('confirmDelete').onclick = async () => {
      document.body.removeChild(confirmBox);
      setLoading(true);
      try {
        const employeeRef = doc(db, `artifacts/${appId}/users/${userId}/employees`, employee.id);
        await deleteDoc(employeeRef);

        const employeesCol = collection(db, `artifacts/${appId}/users/${userId}/employees`);
        const employeeSnapshot = await getDocs(employeesCol);
        const employeesList = employeeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeesList);
        resetForm();
        setError(null);
        const messageBox = document.createElement('div');
        messageBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
        messageBox.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl text-center">
            <p class="text-lg font-semibold mb-4">Employee deleted successfully!</p>
            <button id="closeMessageBox" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">OK</button>
          </div>
        `;
        document.body.appendChild(messageBox);
        document.getElementById('closeMessageBox').onclick = () => document.body.removeChild(messageBox);
      } catch (e) {
        console.error("Error deleting employee:", e);
        setError("Failed to delete employee data.");
      } finally {
        setLoading(false);
      }
    };

    document.getElementById('cancelDelete').onclick = () => {
      document.body.removeChild(confirmBox);
    };
  };

  // Function to calculate and generate the payslip
  const generatePayslip = () => {
    const basic = parseFloat(employee.basicSalary) || 0;
    const costOfLivingAllowance = parseFloat(employee.costOfLivingAllowance) || 0;

    const totalOtherDeductions = employee.otherDeductions.reduce((sum, ded) => {
      return sum + (parseFloat(ded.amount) || 0);
    }, 0);

    const sss = employee.sssContribution;
    const philhealth = employee.philhealthContribution;
    const pagibig = employee.pagibigContribution;
    const ceap = employee.ceapContribution;

    const grossSalary = basic + costOfLivingAllowance;
    const totalDeductions = totalOtherDeductions + sss + philhealth + pagibig + ceap;
    const netSalary = grossSalary - totalDeductions;

    setPayslip({
      ...employee,
      ...payslipDetails,
      basicSalary: basic,
      costOfLivingAllowance: costOfLivingAllowance,
      totalOtherDeductions: totalOtherDeductions,
      sssContribution: sss,
      philhealthContribution: philhealth,
      pagibigContribution: pagibig,
      ceapContribution: ceap,
      grossSalary: grossSalary,
      totalDeductions: totalDeductions,
      netSalary: netSalary,
    });
  };

  // Function to reset the form and clear the payslip
  const resetForm = () => {
    setEmployee({
      id: null,
      name: '',
      employeeId: '',
      basicSalary: '',
      costOfLivingAllowance: '',
      otherDeductions: [],
      sssContribution: 0,
      philhealthContribution: 0,
      pagibigContribution: 0,
      ceapContribution: 0,
    });
    setPayslip(null);
    setPayslipDetails({
      startDate: '',
      endDate: '',
      bookkeeperName: '',
      employeeSignatoryName: '',
    });
    setError(null);
  };

  // Function to open the print options modal
  const handleOpenPrintOptions = () => {
    setShowPrintOptionsModal(true);
    setPrintOption('current');
    setSelectedEmployeesForPrint([]);
  };

  // Function to close the print options modal
  const handleClosePrintOptions = () => {
    setShowPrintOptionsModal(false);
  };

  // Function to handle selection of employees for printing
  const handleSelectEmployeesForPrint = (e) => {
    const options = Array.from(e.target.options);
    const values = options.filter(option => option.selected).map(option => option.value);
    setSelectedEmployeesForPrint(values);
  };

  // Function to execute printing based on selected option
  const executePrint = () => {
    let payslipsToGenerate = [];

    if (printOption === 'current') {
      if (!payslip) {
        setError("No payslip generated to print. Please generate one first.");
        return;
      }
      payslipsToGenerate.push(payslip);
    } else if (printOption === 'selected') {
      if (selectedEmployeesForPrint.length === 0) {
        setError("Please select at least one employee to print.");
        return;
      }
      selectedEmployeesForPrint.forEach(empId => {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
          const basic = parseFloat(emp.basicSalary) || 0;
          const allowances = 0;
          const otherDeductions = [];
          const sss = getSssContribution(basic);
          const philhealth = getPhilhealthContribution(basic);
          const pagibig = getPagibigContribution(basic);
          const ceap = getCeapContribution(basic);

          const grossSalary = basic + allowances;
          const totalDeductions = sss + philhealth + pagibig + ceap;
          const netSalary = grossSalary - totalDeductions;

          payslipsToGenerate.push({
            ...emp,
            basicSalary: basic,
            costOfLivingAllowance: allowances,
            otherDeductions: otherDeductions,
            sssContribution: sss,
            philhealthContribution: philhealth,
            pagibigContribution: pagibig,
            ceapContribution: ceap,
            grossSalary: grossSalary,
            totalDeductions: totalDeductions,
            netSalary: netSalary,
            ...payslipDetails
          });
        }
      });
    } else if (printOption === 'all') {
      if (employees.length === 0) {
        setError("No employees found to print.");
        return;
      }
      employees.forEach(emp => {
        const basic = parseFloat(emp.basicSalary) || 0;
        const allowances = 0;
        const otherDeductions = [];
        const sss = getSssContribution(basic);
        const philhealth = getPhilhealthContribution(basic);
        const pagibig = getPagibigContribution(basic);
        const ceap = getCeapContribution(basic);

        const grossSalary = basic + allowances;
        const totalDeductions = sss + philhealth + pagibig + ceap;
        const netSalary = grossSalary - totalDeductions;

        payslipsToGenerate.push({
          ...emp,
          basicSalary: basic,
          costOfLivingAllowance: allowances,
          otherDeductions: otherDeductions,
          sssContribution: sss,
          philhealthContribution: philhealth,
          pagibigContribution: pagibig,
          ceapContribution: ceap,
          grossSalary: grossSalary,
          totalDeductions: totalDeductions,
          netSalary: netSalary,
          ...payslipDetails
        });
      });
    }

    if (payslipsToGenerate.length === 0) {
      setError("No payslips to print based on your selection.");
      return;
    }

    const finalPayslipsForPrinting = [];
    payslipsToGenerate.forEach(p => {
      finalPayslipsForPrinting.push(p);
      finalPayslipsForPrinting.push(p);
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Payslips</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @page {
        size: 8.5in 13in;
        margin: 0.5in;
      }
      body {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, 4.25in);
        grid-auto-rows: 6.5in;
        gap: 0.2in;
        box-sizing: border-box;
      }
      .payslip-container {
        width: 4.25in;
        height: 6.5in;
        padding: 0.25in;
        box-sizing: border-box;
        border: 1px solid #ccc;
        page-break-inside: avoid;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .payslip-container:nth-child(4n) {
        page-break-after: always;
      }
      .payslip-header {
        text-align: center;
        margin-bottom: 0.2rem;
      }
      .payslip-header img {
        max-width: 0.75in;
        height: auto;
        display: block;
        margin: 0 auto 0.1rem auto;
      }
      .payslip-header h3 {
        font-size: 0.75rem;
        font-weight: bold;
        margin-bottom: 0.05rem;
      }
      .payslip-header p {
        font-size: 0.65rem;
      }
      .payslip-section-title {
        background-color: #e0e7ff;
        padding: 0.2rem 0.3rem;
        font-weight: bold;
        font-size: 0.7rem;
        color: #3730a3;
        border-radius: 0.25rem;
        margin-bottom: 0.2rem;
      }
      .payslip-detail {
        display: flex;
        justify-content: space-between;
        padding: 0.05rem 0;
        border-bottom: 1px dashed #eee;
        font-size: 0.65rem;
      }
      .payslip-detail:last-child {
        border-bottom: none;
      }
      .payslip-summary {
        background-color: #eef2ff;
        padding: 0.3rem;
        border-radius: 0.25rem;
        margin-top: 0.3rem;
      }
      .payslip-summary .payslip-detail {
        border-bottom: 1px solid #c7d2fe;
        font-size: 0.7rem;
      }
      .payslip-signatories {
        margin-top: 0.5rem;
        padding-top: 0.2rem;
        border-top: 1px solid #ccc;
        text-align: center;
      }
      .payslip-signatories div {
        margin-bottom: 1rem;
      }
      .payslip-signatories p {
        font-size: 0.6rem;
        margin: 0;
      }
      .payslip-signatories .name {
        font-weight: bold;
        font-size: 0.7rem;
        margin-top: 0.8rem;
        border-bottom: 1px solid black;
        display: inline-block;
        min-width: 1.8in;
        padding-bottom: 0.05rem;
      }
      .payslip-signatories .role {
        font-size: 0.55rem;
        color: #666;
      }
    `);
    printWindow.document.write('</style></head><body>');

    finalPayslipsForPrinting.forEach((payslipData, index) => {
      const payslipHtml = `
        <div class="payslip-container">
          <div class="payslip-header">
            <img src="https://i.ibb.co/XfJ8scGX/1.png" alt="School Logo" />
            <h3>SAN RAMON CATHOLIC SCHOOL, INC.</h3>
            <p>Su-ay, Himamaylan City Negros Occidental</p>
          </div>
          <div class="payslip-content">
            <div class="payslip-detail"><span>Employee Name:</span><span>${payslipData.name || 'N/A'}</span></div>
            <div class="payslip-detail"><span>Employee ID:</span><span>${payslipData.employeeId || 'N/A'}</span></div>
            <div class="payslip-detail"><span>Payslip Period:</span><span>${payslipData.startDate && payslipData.endDate ? `${new Date(payslipData.startDate).toLocaleDateString()} - ${new Date(payslipData.endDate).toLocaleDateString()}` : 'N/A'}</span></div>

            <div class="payslip-section-title mt-4">Earnings</div>
            <div class="payslip-detail"><span>Basic Salary:</span><span>PHP ${payslipData.basicSalary.toFixed(2)}</span></div>
            <div class="payslip-detail"><span>Cost of Living Allowance:</span><span>PHP ${payslipData.costOfLivingAllowance.toFixed(2)}</span></div>

            <div class="payslip-section-title mt-4">Deductions</div>
            <div class="payslip-detail"><span>SSS Contribution:</span><span>PHP ${payslipData.sssContribution.toFixed(2)}</span></div>
            <div class="payslip-detail"><span>PhilHealth Contribution:</span><span>PHP ${payslipData.philhealthContribution.toFixed(2)}</span></div>
            <div class="payslip-detail"><span>Pag-IBIG Contribution:</span><span>PHP ${payslipData.pagibigContribution.toFixed(2)}</span></div>
            <div class="payslip-detail"><span>CEAP Contribution:</span><span>PHP ${payslipData.ceapContribution.toFixed(2)}</span></div>
            ${payslipData.otherDeductions.map(ded => `<div class="payslip-detail"><span>${ded.name || 'Custom Deduction'}:</span><span>PHP ${(parseFloat(ded.amount) || 0).toFixed(2)}</span></div>`).join('')}
            ${payslipData.otherDeductions.length > 0 ? `<div class="payslip-detail font-semibold"><span>Total Other Deductions:</span><span>PHP ${payslipData.totalOtherDeductions.toFixed(2)}</span></div>` : ''}

            <div class="payslip-summary mt-4">
              <div class="payslip-detail"><span>Gross Salary:</span><span class="font-bold">PHP ${payslipData.grossSalary.toFixed(2)}</span></div>
              <div class="payslip-detail"><span>Total Deductions:</span><span class="font-bold text-red-700">PHP ${payslipData.totalDeductions.toFixed(2)}</span></div>
              <div class="payslip-detail"><span>Net Salary:</span><span class="font-bold text-green-700">PHP ${payslipData.netSalary.toFixed(2)}</span></div>
            </div>
          </div>
          <div class="payslip-signatories">
            <div class="mb-8">
              <p>Prepared By:</p>
              <p class="name">${payslipData.bookkeeperName || '_____________________'}</p>
              <p class="role">Bookkeeper</p>
            </div>
            <div>
              <p>Acknowledged By:</p>
              <p class="name">${payslipData.employeeSignatoryName || '_____________________'}</p>
              <p class="role">Employee</p>
            </div>
          </div>
        </div>
      `;
      printWindow.document.write(payslipHtml);

      if ((index + 1) % 4 === 0 && (index + 1) < finalPayslipsForPrinting.length) {
        printWindow.document.write('<div style="page-break-after: always;"></div>');
      }
    });

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    handleClosePrintOptions();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      resetForm(); // Clear form and payslip data on logout
      setEmployees([]); // Clear employee list on logout
      setUserId(null); // Clear userId
      setIsAuthReady(false); // Set auth not ready
    } catch (e) {
      console.error("Error signing out:", e);
      setError("Failed to log out.");
    }
  };

  // Render LoginScreen if not authenticated
  if (!isAuthReady || !userId) {
    return (
      <LoginScreen
        auth={auth}
        onLoginSuccess={() => {
          // This callback will be triggered when LoginScreen successfully authenticates
          // The onAuthStateChanged listener in useEffect will then update userId and isAuthReady
          // which will cause App.js to re-render the main application.
        }}
      />
    );
  }

  // Render main application if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-indigo-600 p-6 text-white text-center rounded-t-2xl relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">SRCS Bookkeeper's System</h1>
          <p className="text-indigo-200 text-lg">Manage employees and generate detailed payslips with auto-calculated premiums</p>
          {userId && (
            <p className="text-sm text-indigo-200 mt-2">
              Your User ID: <span className="font-mono bg-indigo-700 px-2 py-1 rounded-md">{userId}</span>
            </p>
          )}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <EmployeeForm
            employee={employee}
            employees={employees}
            payslipDetails={payslipDetails}
            handleChange={handleChange}
            handlePayslipDetailsChange={handlePayslipDetailsChange}
            handleDeductionChange={handleDeductionChange}
            handleAddDeductionField={handleAddDeductionField}
            handleRemoveDeductionField={handleRemoveDeductionField}
            handleSelectEmployee={handleSelectEmployee}
            handleSaveEmployee={handleSaveEmployee}
            handleDeleteEmployee={handleDeleteEmployee}
            resetForm={resetForm}
            setEmployee={setEmployee}
          />

          {/* Payslip Generation Button */}
          <div className="mb-8 text-center">
            <button
              onClick={generatePayslip}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-xl"
            >
              Generate Payslip
            </button>
          </div>

          {/* Print Button */}
          <div className="mb-8 text-center">
            <button
              onClick={handleOpenPrintOptions}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-xl"
            >
              Print Payslips
            </button>
          </div>

          {/* Payslip Display Section */}
          {payslip && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
              <PayslipDisplay payslipData={payslip} />
            </div>
          )}
        </div>
      </div>

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
      />
    </div>
  );
};

export default App;
