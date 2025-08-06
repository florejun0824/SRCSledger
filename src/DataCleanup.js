import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const DataCleanup = ({ appId }) => {
  const [legacyEmployees, setLegacyEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTool, setShowTool] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const findLegacyData = useCallback(async () => {
    if (!userId) {
      setError("You must be logged in to perform this action.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const employeesCol = collection(db, `artifacts/${appId}/users/${userId}/employees`);
      const snapshot = await getDocs(employeesCol);
      const allEmployees = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));

      // A legacy employee is one where the document ID is the auto-generated one,
      // NOT the one from the 'employeeId' field. This filter finds them.
      const legacy = allEmployees.filter(emp => emp.docId !== emp.employeeId);
      setLegacyEmployees(legacy);

    } catch (e) {
      console.error("Error finding legacy data:", e);
      setError("Failed to load employee data for cleanup.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, appId, db]);

  useEffect(() => {
    if (showTool) {
      findLegacyData();
    }
  }, [showTool, findLegacyData]);

  const handleDelete = async (docIdToDelete) => {
    if (!userId || !docIdToDelete) return;

    if (!window.confirm(`Are you sure you want to permanently delete this legacy record? This action cannot be undone.`)) {
        return;
    }

    try {
      const employeeRef = doc(db, `artifacts/${appId}/users/${userId}/employees`, docIdToDelete);
      await deleteDoc(employeeRef);
      // Refresh the list after deletion to show it's gone
      findLegacyData();
    } catch (e) {
      console.error("Error deleting legacy document:", e);
      setError(`Failed to delete record ${docIdToDelete}. Please try again.`);
    }
  };

  if (!showTool) {
    return (
        <div className="text-center my-6 p-4 border-dashed border-2 border-red-400 rounded-lg bg-red-50">
            <h3 className="font-bold text-red-800">Legacy Data Found</h3>
            <p className="text-sm text-red-700 my-2">It looks like there might be old employee records. Use this tool to view and delete them.</p>
            <button
                onClick={() => setShowTool(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
                Open Cleanup Tool
            </button>
        </div>
    );
  }

  return (
    <div className="my-6 p-6 bg-white rounded-lg shadow-lg border border-yellow-400">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Legacy Data Cleanup Tool</h2>
        <button onClick={() => setShowTool(false)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        The records below were saved with an old format. You can permanently delete them here to clean up your database.
      </p>
      {error && <p className="bg-red-200 text-red-800 p-3 rounded-lg my-4">{error}</p>}
      {isLoading ? (
        <p className="text-center p-4">Loading legacy records...</p>
      ) : (
        <div className="mt-4 max-h-60 overflow-y-auto space-y-3">
          {legacyEmployees.length > 0 ? (
            legacyEmployees.map(emp => (
              <div key={emp.docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-semibold">{emp.name || 'No Name Provided'}</p>
                  <p className="text-xs text-gray-500">Old Document ID: {emp.docId}</p>
                </div>
                <button
                  onClick={() => handleDelete(emp.docId)}
                  className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-red-700 transition flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 p-4">
              <p className="font-semibold">No legacy data found.</p>
              <p className="text-sm">Your database is all cleaned up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataCleanup;