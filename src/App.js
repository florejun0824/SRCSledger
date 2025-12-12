// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, Timestamp, writeBatch, getDocs, where } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import TabbedInterface from './TabbedInterface';
import PayslipModal from './PayslipModal';

import { getSssContribution, getPhilhealthContribution, getPagibigContribution, getCeapContribution } from './utils';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Log the projectId from the firebaseConfig
console.log(`Firebase Project ID: ${firebaseConfig.projectId}`);

// --- Custom Notification Component ---
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const baseStyle = "fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg text-white transition-transform transform";
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warn: 'bg-yellow-500 text-black',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type] || typeStyles.info}`}>
      {message}
      <button onClick={onClose} className="ml-4 font-bold">X</button>
    </div>
  );
};

const initialEmployeeState = {
  id: null,
  name: '',
  employeeId: '',
  basicSalary: 0,
  costOfLivingAllowance: 0,
  pagibigLoanSTL: 0,
  pagibigLoanCL: 0,
  pagibigLoanMPL: 0,
  sssLoan: 0,
  personalLoan: 0,
  cashAdvance: 0,
  canteen: 0,
  otherDeductions: [],
};

const initialPayslipDetails = {
  bookkeeperName: 'ANGELITA S. BLANAQUE, LPT',
  tithings: 100,
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
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [generatedPayslip, setGeneratedPayslip] = useState(null);

  const [payslipPeriod, setPayslipPeriod] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    const signIn = async () => {
      // Check if user is already logged in
      if (auth.currentUser) return;

      try {
        // eslint-disable-next-line no-undef
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Firebase Auth Error:", e);
        showNotification("Authentication failed.", "error");
      }
    };
    signIn();
  }, []);

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
    if (!userId) {
      setEmployees([]);
      setPayslipHistory([]);
      return;
    }

    const employeeCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/employees`);
    const payslipCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/payslips`);

    const unsubscribeEmployees = onSnapshot(query(employeeCollectionRef, orderBy('name')), (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        // FIXED: Spread initial state FIRST, then doc data, then explicitly set ID
        // This prevents 'initialEmployeeState.id: null' from overwriting 'doc.id'
        ...initialEmployeeState, 
        ...doc.data(),
        id: doc.id, 
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

  const toFormattedDateString = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateAllPayslipDates = async (newStartDate, newEndDate) => {
    if (!userId) return;
    const payslipCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/payslips`);
    const q = query(payslipCollectionRef, where("startDate", "==", toFormattedDateString(payslipPeriod.startDate)), where("endDate", "==", toFormattedDateString(payslipPeriod.endDate)));
    
    try {
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { 
          startDate: toFormattedDateString(newStartDate),
          endDate: toFormattedDateString(newEndDate)
        });
      });
      await batch.commit();
      setPayslipPeriod({ startDate: newStartDate, endDate: newEndDate });
      showNotification("Payslip period updated for all relevant records!", "success");
    } catch (e) {
      console.error("Error updating payslip dates in batch: ", e);
      showNotification("Failed to update all payslip dates.", "error");
    }
  };


  const handleSaveEmployee = async () => {
    setError(null);
    if (!currentEmployee.name) {
      showNotification("Employee Name is required.", "error");
      return;
    }

    try {
      const employeeToSave = {
        ...currentEmployee,
        otherDeductions: currentEmployee.otherDeductions.filter(d => d.name && d.amount),
        basicSalary: Number(currentEmployee.basicSalary) || 0,
        costOfLivingAllowance: Number(currentEmployee.costOfLivingAllowance) || 0,
        name: currentEmployee.name.toUpperCase(),
      };
      
      if (currentEmployee.id && !currentEmployee.id.startsWith('new-doc-')) {
        await setDoc(doc(db, `artifacts/${appId}/users/${userId}/employees`, currentEmployee.id), employeeToSave, { merge: true });
        showNotification(`${employeeToSave.name} updated successfully!`, "success");
      } else {
        const { id, ...dataToSave } = employeeToSave;
        const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/employees`), dataToSave);
        setCurrentEmployee(prev => ({ ...prev, id: docRef.id }));
        showNotification(`${dataToSave.name} added successfully!`, "success");
      }
      
      resetForm();
    } catch (e) {
      console.error("Error adding/updating employee: ", e);
      showNotification("Failed to save employee.", "error");
    }
  };

  const handleDeleteEmployee = async (id) => {
    setError(null);
    if (!id) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/employees`, id));
      showNotification("Employee deleted.", "warn");
      resetForm();
    } catch (e) {
      console.error("Error deleting employee: ", e);
      showNotification("Failed to delete employee.", "error");
    }
  };

  const resetForm = () => {
    setCurrentEmployee(initialEmployeeState);
    setPayslip(null);
    setGeneratedPayslip(null);
    setError(null);
  };

  const handleSelectEmployee = (id) => {
    const employee = employees.find(emp => emp.id === id);
    setCurrentEmployee(employee || initialEmployeeState);
    const mostRecentPayslip = payslipHistory.find(p => p.employeeDocId === id);
    setGeneratedPayslip(mostRecentPayslip || null);
    setPayslip(null);
    setError(null);
  };

  const handleDeletePayslip = async (id) => {
    setError(null);
    if (!id) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/payslips`, id));
      showNotification("Payslip record deleted.", "warn");
    } catch (e) {
      console.error("Error deleting payslip: ", e);
      showNotification("Failed to delete payslip.", "error");
    }
  };

  const handleGeneratePayslip = useCallback(async () => {
    setError(null);
    if (!currentEmployee || !currentEmployee.id) {
      showNotification("Please select or save an employee first.", "error");
      return;
    }

    const basic = Number(currentEmployee.basicSalary) || 0;
    const costOfLivingAllowance = Number(currentEmployee.costOfLivingAllowance) || 0;
    const sss = getSssContribution(basic);
    const philhealth = getPhilhealthContribution(basic);
    const pagibig = getPagibigContribution(basic);
    const ceap = getCeapContribution(basic);
    
    const { pagibigLoanSTL, pagibigLoanCL, pagibigLoanMPL, sssLoan, personalLoan, cashAdvance, canteen, otherDeductions } = currentEmployee;
    const { tithings } = payslipDetails;

    const totalStatutoryDeductions = sss + philhealth + pagibig + ceap;
    const totalLoans = Number(pagibigLoanSTL) + Number(pagibigLoanCL) + Number(pagibigLoanMPL) + Number(sssLoan) + Number(personalLoan) + Number(cashAdvance);
    const totalOtherDeductionsValue = (otherDeductions || []).reduce((sum, ded) => sum + (Number(ded.amount) || 0), 0) + Number(tithings) + Number(canteen);
    
    const grossSalary = basic + costOfLivingAllowance;
    const totalDeductions = totalStatutoryDeductions + totalLoans + totalOtherDeductionsValue;
    const netSalary = grossSalary - totalDeductions;

    const { id, ...employeeDataWithoutId } = currentEmployee;

    const newPayslip = {
      employeeDocId: currentEmployee.id,
      ...employeeDataWithoutId,
      ...payslipDetails,
      startDate: toFormattedDateString(payslipPeriod.startDate),
      endDate: toFormattedDateString(payslipPeriod.endDate),
      grossSalary: grossSalary.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netSalary: netSalary.toFixed(2),
      sssContribution: sss.toFixed(2),
      philhealthContribution: philhealth.toFixed(2),
      pagibigContribution: pagibig.toFixed(2),
      ceapContribution: ceap.toFixed(2),
      tithings: Number(tithings).toFixed(2),
      pagibigLoanSTL: Number(pagibigLoanSTL).toFixed(2),
      pagibigLoanCL: Number(pagibigLoanCL).toFixed(2),
      pagibigLoanMPL: Number(pagibigLoanMPL).toFixed(2),
      sssLoan: Number(sssLoan).toFixed(2),
      personalLoan: Number(personalLoan).toFixed(2),
      cashAdvance: Number(cashAdvance).toFixed(2),
      canteen: Number(canteen).toFixed(2),
      otherDeductions: (otherDeductions || []).map(d => ({ ...d, amount: (Number(d.amount) || 0).toFixed(2) })),
      generatedAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/payslips`), newPayslip);
      setGeneratedPayslip(newPayslip);
      setPayslip(newPayslip);
      showNotification(`Payslip generated for ${newPayslip.name}!`, "success");
    } catch (e) {
      console.error("Error generating payslip:", e);
      showNotification("Failed to generate and save payslip.", "error");
    }
  }, [currentEmployee, payslipDetails, userId, payslipPeriod]);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification("You have been signed out.", "info");
    } catch (e) {
      console.error("Error signing out:", e);
      showNotification("Sign out failed.", "error");
    }
  };
  
  const handlePayslipDeductionChange = (name, value) => {
    setPayslipDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-16 h-16 border-8 border-dashed border-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="App bg-slate-900 text-white min-h-screen font-sans">
      <Notification 
        message={notification.message} 
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      {userId ? (
        <>
          <header className="bg-slate-800/50 backdrop-blur-lg p-4 sticky top-0 z-30 border-b border-slate-700">
             <div className="max-w-8xl mx-auto flex items-center justify-between relative">
                
                {/* Spacer to balance the layout */}
                <div className="flex-1"></div>

                {/* Center: Date Picker */}
                <div className="flex-none flex items-center space-x-4 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                    <div className="flex flex-col">
                        <label htmlFor="startDate" className="block text-xs font-medium text-slate-400 mb-1">Pay Period Start</label>
                        <DatePicker
                            selected={payslipPeriod.startDate}
                            onChange={(date) => updateAllPayslipDates(date, payslipPeriod.endDate)}
                            dateFormat="MMMM d, yyyy"
                            className="bg-transparent border-0 text-white text-sm focus:outline-none focus:ring-0 w-36 text-center"
                            id="startDate"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="endDate" className="block text-xs font-medium text-slate-400 mb-1">Pay Period End</label>
                        <DatePicker
                            selected={payslipPeriod.endDate}
                            onChange={(date) => updateAllPayslipDates(payslipPeriod.startDate, date)}
                            dateFormat="MMMM d, yyyy"
                            className="bg-transparent border-0 text-white text-sm focus:outline-none focus:ring-0 w-36 text-center"
                            id="endDate"
                        />
                    </div>
                </div>

                {/* Spacer to balance the layout (Right side empty) */}
                <div className="flex-1"></div>
            </div>
          </header>

          <TabbedInterface
            employees={employees}
            payslipHistory={payslipHistory}
            currentEmployee={currentEmployee}
            setCurrentEmployee={setCurrentEmployee}
            payslip={generatedPayslip}
            setPayslip={setPayslip}
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
            getSssContribution={getSssContribution}
            getPhilhealthContribution={getPhilhealthContribution}
            getPagibigContribution={getPagibigContribution}
            getCeapContribution={getCeapContribution}
            startDate={payslipPeriod.startDate}
            endDate={payslipPeriod.endDate}
            handlePayslipDeductionChange={handlePayslipDeductionChange}
          />
          <PayslipModal
            payslip={payslip}
            onClose={() => setPayslip(null)}
            employees={employees}
            payslipDetails={payslipDetails}
            setPayslipDetails={setPayslipDetails}
            startDate={payslipPeriod.startDate} 
            endDate={payslipPeriod.endDate}
            handlePayslipDeductionChange={handlePayslipDeductionChange}     
            payslipHistory={payslipHistory}
          />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-16 h-16 border-8 border-dashed border-cyan-400 rounded-full animate-spin"></div>
            <p className="ml-4 text-slate-300">Authenticating...</p>
        </div>
      )}
    </div>
  );
};

export default App;