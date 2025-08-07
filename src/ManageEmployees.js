// src/ManageEmployees.js
import React from 'react';

const ManageEmployees = ({ employees, handleDeleteEmployee }) => {
  return (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Employees</h2>
        {employees.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {employees.map(employee => (
              <li key={employee.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-500">ID: {employee.employeeId || 'N/A'}</p>
                </div>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition duration-200"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No employees found. Add an employee in the Payslip Generation tab.</p>
        )}
      </div>
    </div>
  );
};

export default ManageEmployees;