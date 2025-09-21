// src/App.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  getDocs,
  where
} from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// UPDATED: Added FaSpinner for the new loading animation
import { FaPrint, FaCheckCircle, FaSpinner } from 'react-icons/fa';

import Header from './Header';
import LoginScreen from './LoginScreen';
import TabbedInterface from './TabbedInterface';
import PrintManager from './PrintManager';
import { EmployeeProvider } from './EmployeeContext';

import {
  getSssContribution,
  getPhilhealthContribution,
  getPagibigContribution,
  getCeapContribution
} from './utils';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Log the projectId from the firebaseConfig
console.log(`Firebase Project ID: ${firebaseConfig.projectId}`);

// --- NO CHANGES to initial state objects ---
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
  // --- NO CHANGES to state hooks, refs, or functions ---
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(initialEmployeeState);
  const [error, setError] = useState(null);
  const [payslipDetails, setPayslipDetails] = useState(initialPayslipDetails);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [payslipDeductions, setPayslipDeductions] = useState(initialPayslipDeductionsState);
  const [toast, setToast] = useState({ show: false, message: '' });

  const printManagerRef = useRef();

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };
  
  // --- NO CHANGES to any useEffect hooks or handler functions ---
  // --- (handleSaveEmployee, handleDeleteEmployee, handleGeneratePayslip, etc. are identical) ---
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setEmployees([]);
      setPayslipHistory([]);
      return;
    }

    const employeeCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/employees`);
    const payslipCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/payslips`);

    const unsubscribeEmployees = onSnapshot(query(employeeCollectionRef, orderBy('name')), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        otherDeductions: doc.data().otherDeductions || []
      })));
    });

    const unsubscribePayslips = onSnapshot(
      query(payslipCollectionRef, orderBy('generatedAt', 'desc')),
      (snapshot) => {
        const normalizedStart = new Date(startDate);
        normalizedStart.setHours(0, 0, 0, 0);

        const normalizedEnd = new Date(endDate);
        normalizedEnd.setHours(23, 59, 59, 999);

        const filtered = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => {
            if (!p.startDate) return false;
            const payslipDate = new Date(`${p.startDate}T00:00:00`);
            return payslipDate >= normalizedStart && payslipDate <= normalizedEnd;
          });

        setPayslipHistory(filtered);
      }
    );

    return () => {
      unsubscribeEmployees();
      unsubscribePayslips();
    };
  }, [userId, startDate, endDate]);

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
      
      const isUpdating = currentEmployee.id && !currentEmployee.id.startsWith('new-doc-');
      
      if (isUpdating) {
        await setDoc(doc(db, `artifacts/${appId}/users/${userId}/employees`, currentEmployee.id), employeeToSave, { merge: true });
        showToast('Employee profile updated successfully!');
      } else {
        const { id, ...dataToSave } = employeeToSave;
        const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/employees`), dataToSave);
        setCurrentEmployee(prev => ({ ...prev, id: docRef.id }));
        showToast('New employee saved successfully!');
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
    setError(null);
  };

  const handleSelectEmployee = (id) => {
    const employee = employees.find(emp => emp.id === id) || initialEmployeeState;
    setCurrentEmployee(employee);
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
    if (!currentEmployee || !currentEmployee.name || !currentEmployee.id) {
      setError("Please select or save an employee first.");
      return;
    }

    const basic = parseFloat(currentEmployee.basicSalary) || 0;
    const costOfLivingAllowance = parseFloat(currentEmployee.costOfLivingAllowance) || 0;

    const sssContribution = parseFloat(currentEmployee.sssContribution) || 0;
    const philhealthContribution = parseFloat(currentEmployee.philhealthContribution) || 0;
    const pagibigContribution = parseFloat(currentEmployee.pagibigContribution) || 0;
    const ceapContribution = parseFloat(currentEmployee.ceapContribution) || 0;
    
    const { pagibigLoanSTL, pagibigLoanCL, sssLoan, personalLoan, cashAdvance, canteen, tithings, otherDeductions } = payslipDeductions;
    const totalStatutoryDeductions = sssContribution + philhealthContribution + pagibigContribution + ceapContribution;
    const totalLoans = parseFloat(pagibigLoanSTL || 0) + parseFloat(pagibigLoanCL || 0) + parseFloat(sssLoan || 0) + parseFloat(personalLoan || 0) + parseFloat(cashAdvance || 0);
    const totalOtherDeductionsValue = (otherDeductions || []).reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0) + parseFloat(tithings || 0) + parseFloat(canteen || 0);
    
    const grossSalary = basic + costOfLivingAllowance;
    const totalDeductions = totalStatutoryDeductions + totalLoans + totalOtherDeductionsValue;
    const netSalary = grossSalary - totalDeductions;

    const { id, ...employeeDataWithoutId } = currentEmployee;
    const toFormattedDateString = (dateInput) => {
      if (!dateInput) return null;
      let date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    };

    const payslipCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/payslips`);
    const q = query(
      payslipCollectionRef,
      where("employeeDocId", "==", currentEmployee.id),
      where("startDate", "==", toFormattedDateString(startDate)),
      where("endDate", "==", toFormattedDateString(endDate))
    );
    const existing = await getDocs(q);
    for (let docSnap of existing.docs) {
      await deleteDoc(docSnap.ref);
    }

    const newPayslip = {
      employeeDocId: currentEmployee.id,
      ...employeeDataWithoutId,
      ...payslipDetails,
      startDate: toFormattedDateString(startDate),
      endDate: toFormattedDateString(endDate),
      grossSalary: grossSalary.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netSalary: netSalary.toFixed(2),
      sssContribution: sssContribution.toFixed(2),
      philhealthContribution: philhealthContribution.toFixed(2),
      pagibigContribution: pagibigContribution.toFixed(2),
      ceapContribution: ceapContribution.toFixed(2),
      tithings: parseFloat(tithings || 0).toFixed(2),
      pagibigLoanSTL: parseFloat(pagibigLoanSTL || 0).toFixed(2),
      pagibigLoanCL: parseFloat(pagibigLoanCL || 0).toFixed(2),
      sssLoan: parseFloat(sssLoan || 0).toFixed(2),
      personalLoan: parseFloat(personalLoan || 0).toFixed(2),
      cashAdvance: parseFloat(cashAdvance || 0).toFixed(2),
      canteen: parseFloat(canteen || 0).toFixed(2),
      otherDeductions: (otherDeductions || []).map(d => ({ ...d, amount: parseFloat(d.amount || 0).toFixed(2) })),
      generatedAt: Timestamp.now(),
    };

    try {
      await addDoc(payslipCollectionRef, newPayslip);
      return newPayslip;
    } catch (e) {
      console.error("Error generating payslip:", e);
      setError("Failed to generate and save payslip.");
      return null;
    }
  }, [currentEmployee, payslipDetails, userId, payslipDeductions, startDate, endDate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  const handlePrintAllPayslips = () => {
    if (printManagerRef.current) {
      printManagerRef.current.printAllPayslips(payslipHistory);
    }
  };

  // UPDATED: Replaced the old spinner with the FaSpinner icon for a cleaner look.
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <FaSpinner className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="ml-4 text-xl text-slate-700 font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    // UPDATED: Removed bg-slate-50 as the background is now handled by the body in index.css
    <div className="App min-h-screen">
      {/* UPDATED: Toast notification now uses the glass effect and a semi-transparent background color. */}
      {toast.show && (
        <div
          className="fixed top-28 right-5 z-[100] flex items-center gap-3 text-white py-3 px-5 rounded-xl transition-transform duration-300 transform glass-effect border-none"
          style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              transform: toast.show ? 'translateX(0)' : 'translateX(100%)', 
              opacity: toast.show ? 1 : 0 
          }}
        >
          <FaCheckCircle />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}
      
      {userId ? (
        <EmployeeProvider>
          <Header userId={userId} handleSignOut={handleSignOut} />

          <main>
            {/* UPDATED: Pay Period bar now uses the new .glass-effect class instead of bg-white and shadow-md. */}
            <div className="sticky top-24 z-40 glass-effect">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-x-6">
                      <div className="flex flex-col">
                          <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 mb-2">Pay Period Start</label>
                          <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                              dateFormat="MMMM d, yyyy"
                              // UPDATED: Applied the new iOS-like form input style class.
                              className="form-input-ios w-full"
                              id="startDate"
                          />
                      </div>
                      <div className="flex flex-col">
                          <label htmlFor="endDate" className="block text-sm font-medium text-slate-600 mb-2">Pay Period End</label>
                          <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(date)}
                              dateFormat="MMMM d, yyyy"
                              // UPDATED: Applied the new iOS-like form input style class.
                              className="form-input-ios w-full"
                              id="endDate"
                          />
                      </div>
                  </div>
                  <button
                    onClick={handlePrintAllPayslips}
                    // UPDATED: Replaced multiple utility classes with the single, new .btn-primary class.
                    className="btn-primary w-full md:w-auto no-print"
                    type="button"
                    aria-label="Print All Payslips"
                  >
                    <FaPrint className="h-5 w-5"/>
                    <span>Print All Payslips</span>
                  </button>
              </div>
            </div>

            <TabbedInterface
              employees={employees}
              payslipHistory={payslipHistory}
              currentEmployee={currentEmployee}
              setCurrentEmployee={setCurrentEmployee}
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
              payslipDeductions={payslipDeductions}
              setPayslipDeductions={setPayslipDeductions}
              getSssContribution={getSssContribution}
              getPhilhealthContribution={getPhilhealthContribution}
      getPagibigContribution={getPagibigContribution}
              getCeapContribution={getCeapContribution}
              startDate={startDate}
              endDate={endDate}
            />
          </main>
          
          <PrintManager
            ref={printManagerRef}
            payslip={null}
            employees={employees}
            payslipDetails={payslipDetails}
            setPayslipDetails={setPayslipDetails}
            payslipHistory={payslipHistory}
            startDate={startDate}
            endDate={endDate}
            hideButton={true}
          />
        </EmployeeProvider>
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

export default App;