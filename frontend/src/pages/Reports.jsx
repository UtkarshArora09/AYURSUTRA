import React, { useState } from "react";
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const mockReports = [
  {
    id: "REP-2024-001",
    patientName: "Rahul Sharma",
    type: "Blood Test",
    date: "2024-04-18",
    status: "Ready",
    doctor: "Dr. Priya Singh",
    size: "1.2 MB",
  },
  {
    id: "REP-2024-002",
    patientName: "Aarti Verma",
    type: "Dosha Analysis",
    date: "2024-04-17",
    status: "Processing",
    doctor: "Dr. Anil Kumar",
    size: "--",
  },
  {
    id: "REP-2024-003",
    patientName: "Sneha Patel",
    type: "MRI Scan",
    date: "2024-04-15",
    status: "Ready",
    doctor: "Dr. Priya Singh",
    size: "15.4 MB",
  },
  {
    id: "REP-2024-004",
    patientName: "Vikram Singh",
    type: "Full Body Checkup",
    date: "2024-04-14",
    status: "Ready",
    doctor: "Dr. Ramesh Gupta",
    size: "3.5 MB",
  },
  {
    id: "REP-2024-005",
    patientName: "Meera Reddy",
    type: "Allergy Panel",
    date: "2024-04-12",
    status: "Ready",
    doctor: "Dr. Anil Kumar",
    size: "0.8 MB",
  }
];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = mockReports.filter(report => 
    report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full flex-grow">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-900 flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
              Medical Reports & Summaries
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage, view, and download encrypted patient laboratory and clinical reports.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg transition-transform hover:scale-105 duration-300">
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Sync Latest Data
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-t-2xl border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Patient Name, ID, or Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center w-full sm:w-auto">
            <button className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
              <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
              Filter Options
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Report ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{report.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center text-blue-800 font-bold text-xs mr-3">
                          {report.patientName.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{report.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{report.type}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{report.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      {report.status === "Ready" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircleIcon className="w-4 h-4 mr-1" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <ClockIcon className="w-4 h-4 mr-1" /> Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        disabled={report.status !== 'Ready'}
                        className={`inline-flex items-center p-2 rounded-lg transition-colors ${report.status === 'Ready' ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-300 cursor-not-allowed'}`}
                        title="View Report"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button 
                        disabled={report.status !== 'Ready'}
                        className={`inline-flex items-center p-2 rounded-lg transition-colors ${report.status === 'Ready' ? 'text-green-600 hover:bg-green-100' : 'text-gray-300 cursor-not-allowed'}`}
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-600">No reports found.</p>
                      <p className="text-sm">Try adjusting your search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
