// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import LoginScreen from './LoginScreen';
import TabbedInterface from './TabbedInterface';
import PayslipModal from './PayslipModal';

import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Log the projectId from the firebaseConfig
console.log(`Firebase Project ID: ${firebaseConfig.projectId}`);

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
  pagibigLoanSTL: '',
  pagibigLoanCL: '',
  sssLoan: '',
  personalLoan: '',
  cashAdvance: '',
  canteen: '',
};

const initialPayslipDetails = {
  employeeSignatoryName: '',
  adminSignatoryName: '',
  bookkeeperName: 'ANGELITA S. BLANAQUE, LPT',
  tithings: 100,
};

const initialPayslipDeductionsState = {
  pagibigLoanSTL: 0,
  pagibigLoanCL: 0,
  sssLoan: 0,
  personalLoan: 0,
  cashAdvance: 0,
  canteen: 0,
  tithings: 100,
  otherDeductions: [],
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [payslipDeductions, setPayslipDeductions] = useState(initialPayslipDeductionsState);

  // This state will hold the generated payslip for preview and printing.
  const [generatedPayslip, setGeneratedPayslip] = useState(null);

  // Sign in with custom token on app load if available
  useEffect(() => {
    const signIn = async () => {
      // eslint-disable-next-line no-undef
      const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
      try {
        if (token) {
          await signInWithCustomToken(auth, token);
        }
      } catch (e) {
        console.error("Firebase Auth Error:", e);
      }
    };
    signIn();
  }, [auth]);

  // Firebase auth state observer
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
  }, [auth]);

  // Firestore listeners for employees and payslips
  useEffect(() => {
    if (!userId) {
      setEmployees([]);
      setPayslipHistory([]);
      return;
    }

    const employeeCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/employees`);
    const payslipCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/payslips`);

    const unsubscribeEmployees = onSnapshot(employeeCollectionRef, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        otherDeductions: doc.data().otherDeductions || []
      }));
      setEmployees(employeesData);
    });

    const unsubscribePayslips = onSnapshot(query(payslipCollectionRef, orderBy('generatedAt', 'desc')), (snapshot) => {
      const payslipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayslipHistory(payslipsData);
    });

    return () => {
      unsubscribeEmployees();
      unsubscribePayslips();
    };
  }, [userId]);


  const handleSaveEmployee = async () => {
    setError(null);
    if (!currentEmployee.name) {
      setError("Employee Name is required.");
      return;
    }

    try {
      const employeeToSave = {
        ...currentEmployee,
        otherDeductions: currentEmployee.otherDeductions.filter(d => d.name && d.amount),
        basicSalary: currentEmployee.basicSalary.toString(),
        costOfLivingAllowance: currentEmployee.costOfLivingAllowance.toString(),
      };
      
      if (currentEmployee.id && !currentEmployee.id.startsWith('new-doc-')) {
        await setDoc(doc(db, `artifacts/${appId}/users/${userId}/employees`, currentEmployee.id), employeeToSave, { merge: true });
      } else {
        const { id, ...dataToSave } = employeeToSave;
        const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/employees`), dataToSave);
        setCurrentEmployee(prev => ({ ...prev, id: docRef.id }));
      }
      resetForm();
      await handleGeneratePayslip();
    } catch (e) {
      console.error("Error adding/updating employee: ", e);
      setError("Failed to save employee. Please try again.");
    }
  };

  const handleDeleteEmployee = async (id) => {
    setError(null);
    if (!id) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/employees`, id));
      resetForm();
    } catch (e) {
      console.error("Error deleting employee: ", e);
      setError("Failed to delete employee. Please try again.");
    }
  };

  const resetForm = () => {
    setCurrentEmployee(initialEmployeeState);
    setPayslipDeductions(initialPayslipDeductionsState);
    setPayslip(null);
    setGeneratedPayslip(null);
    setError(null);
  };

  const handleSelectEmployee = (id) => {
    const employee = employees.find(emp => emp.id === id) || initialEmployeeState;
    setCurrentEmployee(employee);
    
    const mostRecentPayslip = payslipHistory.find(p => p.employeeDocId === employee.id);

    setGeneratedPayslip(mostRecentPayslip || null);
    setPayslip(null);
    setPayslipDeductions(initialPayslipDeductionsState);
    setError(null);
  };

  const handleDeletePayslip = async (id) => {
    setError(null);
    if (!id) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/payslips`, id));
    } catch (e) {
      console.error("Error deleting payslip: ", e);
      setError("Failed to delete payslip.");
    }
  };

  const handleGeneratePayslip = useCallback(async () => {
    setError(null);
    if (!currentEmployee || !currentEmployee.id) {
      setError("Please select or save an employee first.");
      return;
    }

    const basic = parseFloat(currentEmployee.basicSalary) || 0;
    const costOfLivingAllowance = parseFloat(currentEmployee.costOfLivingAllowance) || 0;
    const sss = getSssContribution(basic);
    const philhealth = getPhilhealthContribution(basic);
    const pagibig = getPagibigContribution(basic);
    const ceap = getCeapContribution(basic);
    
    const { pagibigLoanSTL, pagibigLoanCL, sssLoan, personalLoan, cashAdvance, canteen, tithings, otherDeductions } = payslipDeductions;
    const totalStatutoryDeductions = sss + philhealth + pagibig + ceap;
    const totalLoans = parseFloat(pagibigLoanSTL) + parseFloat(pagibigLoanCL) + parseFloat(sssLoan) + parseFloat(personalLoan) + parseFloat(cashAdvance);
    const totalOtherDeductionsValue = (otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0) + parseFloat(tithings) + parseFloat(canteen);
    
    const grossSalary = basic + costOfLivingAllowance;
    const totalDeductions = totalStatutoryDeductions + totalLoans + totalOtherDeductionsValue;
    const netSalary = grossSalary - totalDeductions;

    const { id, ...employeeDataWithoutId } = currentEmployee;
    const toFormattedDateString = (dateInput) => {
      if (!dateInput) return null;
      let date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    };

    const newPayslip = {
      employeeDocId: currentEmployee.id,
      ...employeeDataWithoutId,
      ...payslipDetails,
      startDate: toFormattedDateString(startDate),
      endDate: toFormattedDateString(endDate),
      grossSalary: grossSalary.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netSalary: netSalary.toFixed(2),
      sssContribution: sss.toFixed(2),
      philhealthContribution: philhealth.toFixed(2),
      pagibigContribution: pagibig.toFixed(2),
      ceapContribution: ceap.toFixed(2),
      tithings: parseFloat(tithings).toFixed(2),
      pagibigLoanSTL: parseFloat(pagibigLoanSTL).toFixed(2),
      pagibigLoanCL: parseFloat(pagibigLoanCL).toFixed(2),
      sssLoan: parseFloat(sssLoan).toFixed(2),
      personalLoan: parseFloat(personalLoan).toFixed(2),
      cashAdvance: parseFloat(cashAdvance).toFixed(2),
      canteen: parseFloat(canteen).toFixed(2),
      otherDeductions: (otherDeductions || []).map(d => ({ ...d, amount: parseFloat(d.amount || 0).toFixed(2) })),
      generatedAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/payslips`), newPayslip);
      setGeneratedPayslip(newPayslip);
    } catch (e) {
      console.error("Error generating payslip:", e);
      setError("Failed to generate and save payslip.");
    }
  }, [currentEmployee, payslipDetails, userId, payslipDeductions, startDate, endDate]);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {userId ? (
        <>
          <div className="flex justify-center my-4 z-20 relative">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="MMMM d, yyyy"
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mt-1"
                    id="startDate"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="MMMM d, yyyy"
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mt-1"
                    id="endDate"
                />
              </div>
            </div>
          </div>
          <TabbedInterface
            employees={employees}
            payslipHistory={payslipHistory}
            currentEmployee={currentEmployee}
            setCurrentEmployee={setCurrentEmployee}
            payslip={generatedPayslip} // Pass generated payslip for preview
            setPayslip={setPayslip} // This is for the modal
            setGeneratedPayslip={setGeneratedPayslip}
            error={error}
            setError={setError}
            payslipDetails={payslipDetails}
            setPayslipDetails={setPayslipDetails}
            handleSaveEmployee={handleSaveEmployee}
            handleDeleteEmployee={handleDeleteEmployee}
            handleDeletePayslip={handleDeletePayslip}
            handleGeneratePayslip={handleGeneratePayslip}
            resetForm={resetForm}
            handleSelectEmployee={handleSelectEmployee}
            handleSignOut={handleSignOut}
            payslipDeductions={payslipDeductions}
            setPayslipDeductions={setPayslipDeductions}
            getSssContribution={getSssContribution}
            getPhilhealthContribution={getPhilhealthContribution}
            getPagibigContribution={getPagibigContribution}
            getCeapContribution={getCeapContribution}
            startDate={startDate}
            endDate={endDate}
          />
          <PayslipModal
            payslip={payslip} // This is the modal's specific payslip
            onClose={() => setPayslip(null)}
            employees={employees}
            payslipDetails={payslipDetails}
            setPayslipDetails={setPayslipDetails}
            startDate={startDate} 
            endDate={endDate}     
          />
        </>
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

export default App;