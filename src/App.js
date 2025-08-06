// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

import LoginScreen from './LoginScreen';
import EmployeeForm from './EmployeeForm';
import PayslipDisplay from './PayslipDisplay';
import PayslipHistory from './PayslipHistory';
import PrintManager from './PrintManager';

import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const initialEmployeeState = {
  id: null,
  name: '',
  employeeId: '',
  basicSalary: '',
  costOfLivingAllowance: '',
  otherDeductions: [],
  sssContribution: '',
  philhealthContribution: '',
  pagibigContribution: '',
  ceapContribution: '',
};

const initialPayslipDetails = {
  startDate: '',
  endDate: '',
  employeeSignatoryName: '',
  adminSignatoryName: '',
  bookkeeperName: 'ANGELITA S. BLANAQUE, LPT',
};

const App = () => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(initialEmployeeState);
  const [payslip, setPayslip] = useState(null);
  const [error, setError] = useState(null);
  const [payslipDetails, setPayslipDetails] = useState(initialPayslipDetails);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const employeesRef = collection(db, 'artifacts', appId, 'users', userId, 'employees');
    const unsubscribeEmployees = onSnapshot(employeesRef, (employeeSnapshot) => {
      const employeesList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeesList);
    }, (err) => {
      console.error("Error fetching employees: ", err);
      setError("Failed to fetch employee data.");
    });

    const payslipsRef = collection(db, 'artifacts', appId, 'users', userId, 'payslips');
    const payslipsQuery = query(payslipsRef, orderBy('generatedAt', 'desc'));
    const unsubscribePayslips = onSnapshot(payslipsQuery, (payslipSnapshot) => {
      const payslipList = payslipSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayslipHistory(payslipList);
    }, (err) => {
      console.error("Error fetching payslip history: ", err);
      setError("Failed to fetch payslip history.");
    });

    return () => {
      unsubscribeEmployees();
      unsubscribePayslips();
    };
  }, [userId]);

  const handleSaveEmployee = async () => {
    if (!userId) {
      setError("You must be logged in to save employees.");
      return;
    }
    if (!currentEmployee.name || !currentEmployee.employeeId || !currentEmployee.basicSalary) {
      setError("Employee Name, ID, and Basic Salary are required.");
      return;
    }
    try {
      const employeesRef = collection(db, 'artifacts', appId, 'users', userId, 'employees');
      
      const basicSalary = parseFloat(currentEmployee.basicSalary) || 0;
      const sss = currentEmployee.sssContribution !== '' ? parseFloat(currentEmployee.sssContribution) : getSssContribution(basicSalary);
      const philhealth = currentEmployee.philhealthContribution !== '' ? parseFloat(currentEmployee.philhealthContribution) : getPhilhealthContribution(basicSalary);
      const pagibig = currentEmployee.pagibigContribution !== '' ? parseFloat(currentEmployee.pagibigContribution) : getPagibigContribution(basicSalary);
      const ceap = currentEmployee.ceapContribution !== '' ? parseFloat(currentEmployee.ceapContribution) : getCeapContribution(basicSalary);

      const employeeToSave = {
        name: currentEmployee.name,
        employeeId: currentEmployee.employeeId,
        basicSalary: basicSalary,
        costOfLivingAllowance: parseFloat(currentEmployee.costOfLivingAllowance) || 0,
        otherDeductions: currentEmployee.otherDeductions.map(ded => ({
          name: ded.name,
          amount: parseFloat(ded.amount) || 0,
        })),
        sssContribution: sss,
        philhealthContribution: philhealth,
        pagibigContribution: pagibig,
        ceapContribution: ceap,
      };

      if (currentEmployee.id) {
        await setDoc(doc(employeesRef, currentEmployee.id), employeeToSave);
      } else {
        await addDoc(employeesRef, employeeToSave);
      }
      resetForm();
    } catch (e) {
      console.error("Error adding/updating document: ", e);
      setError("Failed to save employee data.");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!userId) {
      setError("You must be logged in to delete employees.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'employees', id));
      resetForm();
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Failed to delete employee data.");
    }
  };
  
  const handleDeletePayslip = useCallback(async (id) => {
    if (!userId) {
      setError("You must be logged in to delete payslips.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'payslips', id));
      // Manually update state to ensure immediate UI change
      setPayslipHistory(prevPayslips => prevPayslips.filter(payslip => payslip.id !== id));
      setError(null);
    } catch (e) {
      console.error("Error deleting payslip:", e);
      setError("Failed to delete payslip. Please check your permissions.");
    }
  }, [userId, appId, db]);

  const handleGeneratePayslip = async (employeeData) => {
    const employeeToGenerate = employeeData || currentEmployee;
    if (!employeeToGenerate.id) {
      setError("Please select an employee or create a new one to generate a payslip.");
      return;
    }
    if (!payslipDetails.startDate || !payslipDetails.endDate) {
      setError("Payslip start and end dates are required.");
      return;
    }
    const basic = parseFloat(employeeToGenerate.basicSalary) || 0;
    const costOfLivingAllowance = parseFloat(employeeToGenerate.costOfLivingAllowance) || 0;
    const totalOtherDeductions = (employeeToGenerate.otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);
    
    const sss = employeeToGenerate.sssContribution !== '' ? parseFloat(employeeToGenerate.sssContribution) : getSssContribution(basic);
    const philhealth = employeeToGenerate.philhealthContribution !== '' ? parseFloat(employeeToGenerate.philhealthContribution) : getPhilhealthContribution(basic);
    const pagibig = employeeToGenerate.pagibigContribution !== '' ? parseFloat(employeeToGenerate.pagibigContribution) : getPagibigContribution(basic);
    const ceap = employeeToGenerate.ceapContribution !== '' ? parseFloat(employeeToGenerate.ceapContribution) : getCeapContribution(basic);
    
    const totalDeductions = sss + philhealth + pagibig + ceap + totalOtherDeductions;
    const grossSalary = basic + costOfLivingAllowance;
    const netSalary = grossSalary - totalDeductions;
    const newPayslip = {
      ...employeeToGenerate,
      startDate: payslipDetails.startDate,
      endDate: payslipDetails.endDate,
      grossSalary,
      totalDeductions,
      netSalary,
      sssContribution: sss,
      philhealthContribution: philhealth,
      pagibigContribution: pagibig,
      ceapContribution: ceap,
      ...payslipDetails,
      generatedAt: Timestamp.now(),
    };
    try {
      const payslipsRef = collection(db, 'artifacts', appId, 'users', userId, 'payslips');
      await addDoc(payslipsRef, newPayslip);
      setPayslip(newPayslip);
      setError(null);
    } catch (e) {
      console.error("Error generating and saving payslip: ", e);
      setError("Failed to generate or save the payslip.");
    }
  };

  const resetForm = () => {
    setCurrentEmployee(initialEmployeeState);
    setPayslip(null);
    setError(null);
    setPayslipDetails(initialPayslipDetails);
  };

  const handleSelectEmployee = (e) => {
    const employeeId = e.target.value;
    if (employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      setCurrentEmployee({
        ...employee,
        basicSalary: employee.basicSalary.toString(),
        costOfLivingAllowance: employee.costOfLivingAllowance.toString(),
        sssContribution: employee.sssContribution.toString(),
        philhealthContribution: employee.philhealthContribution.toString(),
        pagibigContribution: employee.pagibigContribution.toString(),
        ceapContribution: employee.ceapContribution.toString(),
        otherDeductions: employee.otherDeductions.map(ded => ({
          ...ded,
          amount: ded.amount.toString(),
        })),
      });
      setPayslip(null);
    } else {
      resetForm();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      resetForm();
    } catch (e) {
      console.error("Error signing out: ", e);
      setError("Failed to sign out.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {userId ? (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
          <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Payslip Manager</h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
              >
                Sign Out
              </button>
            </div>
          </header>
          <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Details & Payslip Generation</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <EmployeeForm
                    employee={currentEmployee}
                    setEmployee={setCurrentEmployee}
                    employees={employees}
                    payslipDetails={payslipDetails}
                    setPayslipDetails={setPayslipDetails}
                    handleSaveEmployee={handleSaveEmployee}
                    handleDeleteEmployee={handleDeleteEmployee}
                    resetForm={resetForm}
                    handleSelectEmployee={handleSelectEmployee}
                    handleGeneratePayslip={handleGeneratePayslip}
                  />
                  
                  <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Payslip Preview</h3>
                    {payslip ? (
                      <>
                        <PayslipDisplay payslipData={payslip} />
                        <div className="mt-6 flex justify-center">
                          <PrintManager
                            payslip={payslip}
                            employees={employees}
                            payslipDetails={payslipDetails}
                            setPayslipDetails={setPayslipDetails}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-10">Generate a payslip to see a preview here.</div>
                    )}
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              )}
            </div>
    
            <div className="lg:col-span-1">
              <PayslipHistory
                payslipHistory={payslipHistory}
                employees={employees}
                payslipDetails={payslipDetails}
                setPayslipDetails={setPayslipDetails}
                handleDeletePayslip={handleDeletePayslip}
              />
            </div>
          </main>
        </div>
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

export default App;