import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CloudArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DoctorDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportUploadData, setReportUploadData] = useState({
    patientId: '',
    reportType: '',
    description: '',
    files: []
  });

  // Doctor data [8]
  const doctorData = {
    doctorId: 'DR-2024-001',
    name: 'Dr. Priya Sharma',
    specialization: 'Panchakarma Specialist & Ayurvedic Physician',
    experience: '15 years',
    license: 'AYUSH-MH-12345',
    qualification: 'BAMS, MD (Ayurveda)',
    profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
    currentShift: 'Morning (9:00 AM - 2:00 PM)',
    nextShift: 'Evening (4:00 PM - 8:00 PM)',
    center: 'AyurSutra Wellness Center - Mumbai'
  };

  // Today's metrics [1][5]
  const todayMetrics = {
    totalAppointments: 24,
    completedConsultations: 18,
    pendingConsultations: 6,
    queuePatients: 8,
    avgConsultationTime: 22,
    patientSatisfaction: 4.8,
    revenueToday: 15750,
    prescriptionsWritten: 16
  };

  // Recent appointments [8]
  const recentAppointments = [
    {
      id: 'A-001',
      patientName: 'Rajesh Kumar',
      patientId: 'AYR-2024-101',
      time: '10:00 AM',
      type: 'Panchakarma Consultation',
      status: 'completed',
      dosha: 'Vata',
      duration: 25,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'A-002',
      patientName: 'Sunita Devi',
      patientId: 'AYR-2024-102',
      time: '10:30 AM',
      type: 'Follow-up Visit',
      status: 'completed',
      dosha: 'Pitta',
      duration: 20,
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    {
      id: 'A-003',
      patientName: 'Amit Patel',
      patientId: 'AYR-2024-103',
      time: '11:00 AM',
      type: 'General Consultation',
      status: 'in-progress',
      dosha: 'Kapha',
      duration: 0,
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 'A-004',
      patientName: 'Priya Mehta',
      patientId: 'AYR-2024-104',
      time: '11:30 AM',
      type: 'Basti Therapy',
      status: 'scheduled',
      dosha: 'Vata-Pitta',
      duration: 0,
      avatar: 'https://randomuser.me/api/portraits/women/35.jpg'
    }
  ];

  // Queue patients [5]
  const queuePatients = [
    {
      tokenNumber: 'Q-001',
      patientName: 'Mahesh Singh',
      patientId: 'AYR-2024-105',
      waitTime: 15,
      visitReason: 'General Consultation',
      priority: 'normal',
      symptoms: 'Digestive issues, fatigue'
    },
    {
      tokenNumber: 'Q-002',
      patientName: 'Kavita Sharma',
      patientId: 'AYR-2024-106',
      waitTime: 25,
      visitReason: 'Follow-up Visit',
      priority: 'normal',
      symptoms: 'Joint pain follow-up'
    },
    {
      tokenNumber: 'Q-003',
      patientName: 'Deepak Gupta',
      patientId: 'AYR-2024-107',
      waitTime: 8,
      visitReason: 'Symptom Check',
      priority: 'urgent',
      symptoms: 'Severe headache, nausea'
    }
  ];

  // Patient records for reports [7]
  const patientRecords = [
    {
      patientId: 'AYR-2024-101',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      constitution: 'Vata-Pitta',
      lastVisit: '2025-09-15',
      condition: 'Digestive disorders',
      reports: [
        {
          id: 'R-001',
          type: 'Blood Analysis',
          date: '2025-09-10',
          status: 'completed',
          uploadedBy: 'Dr. Priya Sharma'
        },
        {
          id: 'R-002',
          type: 'Pulse Diagnosis Report',
          date: '2025-09-12',
          status: 'completed',
          uploadedBy: 'Dr. Priya Sharma'
        }
      ]
    },
    {
      patientId: 'AYR-2024-102',
      name: 'Sunita Devi',
      age: 38,
      gender: 'Female',
      constitution: 'Pitta',
      lastVisit: '2025-09-14',
      condition: 'Stress-related symptoms',
      reports: [
        {
          id: 'R-003',
          type: 'Ayurvedic Assessment',
          date: '2025-09-08',
          status: 'completed',
          uploadedBy: 'Dr. Priya Sharma'
        }
      ]
    }
  ];

  // Report types for upload [15][18]
  const reportTypes = [
    'Ayurvedic Assessment Report',
    'Blood Analysis',
    'Pulse Diagnosis Report',
    'Treatment Progress Report',
    'Panchakarma Evaluation',
    'Dosha Analysis',
    'Herbal Prescription Report',
    'Lifestyle Recommendation Report',
    'Follow-up Assessment',
    'Laboratory Test Results',
    'Imaging Reports',
    'Consultation Notes',
    'Other'
  ];

  // Notifications [5]
  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'Urgent Appointment Request',
      message: 'Patient Deepak Gupta requesting urgent consultation',
      time: '5 minutes ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'report',
      title: 'Lab Results Available',
      message: 'Blood analysis results for Rajesh Kumar are ready',
      time: '15 minutes ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'schedule',
      title: 'Schedule Change',
      message: 'Appointment with Priya Mehta rescheduled to 2:00 PM',
      time: '30 minutes ago',
      priority: 'low'
    }
  ];

  // Handle file upload for reports [15][18]
  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    setReportUploadData(prev => ({
      ...prev,
      files: [...prev.files, ...fileArray]
    }));
  };

  const removeFile = (index) => {
    setReportUploadData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    
    // TODO: Implement actual file upload to server
    console.log('Uploading report:', reportUploadData);
    
    // Mock upload simulation
    const formData = new FormData();
    formData.append('patientId', reportUploadData.patientId);
    formData.append('reportType', reportUploadData.reportType);
    formData.append('description', reportUploadData.description);
    
    reportUploadData.files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/reports/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      
      alert('Report uploaded successfully!');
      setUploadModalOpen(false);
      setReportUploadData({
        patientId: '',
        reportType: '',
        description: '',
        files: []
      });
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to upload report. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'scheduled': return 'yellow';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'urgent': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      case 'normal': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={doctorData.profileImage}
                    alt={doctorData.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{doctorData.name}</h1>
                    <p className="text-green-600 font-medium">{doctorData.specialization}</p>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span>🏥 {doctorData.center}</span>
                      <span>⏰ {doctorData.currentShift}</span>
                      <span>📋 License: {doctorData.license}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Upload Report</span>
                  </button>
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                    <BellIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <CogIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-2">
              <nav className="flex space-x-2">
                {[
                  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                  { id: 'appointments', name: 'Appointments', icon: CalendarDaysIcon },
                  { id: 'queue', name: 'Live Queue', icon: UserGroupIcon },
                  { id: 'patients', name: 'Patient Records', icon: ClipboardDocumentListIcon },
                  { id: 'reports', name: 'Reports & Documents', icon: DocumentTextIcon },
                  { id: 'analytics', name: 'Analytics', icon: ArrowTrendingUpIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeSection === tab.id
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Metrics Cards */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Today's Metrics */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Today's Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Appointments</p>
                            <p className="text-2xl font-bold text-green-600">{todayMetrics.totalAppointments}</p>
                          </div>
                          <CalendarDaysIcon className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-blue-600">{todayMetrics.completedConsultations}</p>
                          </div>
                          <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">In Queue</p>
                            <p className="text-2xl font-bold text-yellow-600">{todayMetrics.queuePatients}</p>
                          </div>
                          <ClockIcon className="w-8 h-8 text-yellow-600" />
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Avg Time (min)</p>
                            <p className="text-2xl font-bold text-purple-600">{todayMetrics.avgConsultationTime}</p>
                          </div>
                          <ClockIcon className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
                      <button className="text-green-600 hover:text-green-700 font-medium">
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {recentAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <img
                            src={appointment.avatar}
                            alt={appointment.patientName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-800">{appointment.patientName}</p>
                                <p className="text-sm text-gray-600">{appointment.patientId} • {appointment.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-800">{appointment.time}</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(appointment.status)}-100 text-${getStatusColor(appointment.status)}-800`}>
                                  {appointment.status.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                              <span>Dosha: {appointment.dosha}</span>
                              {appointment.duration > 0 && <span>Duration: {appointment.duration} min</span>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                        <VideoCameraIcon className="w-5 h-5" />
                        <span>Start Video Call</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New Patient</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Write Prescription</span>
                      </button>
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="w-full flex items-center space-x-3 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100"
                      >
                        <CloudArrowUpIcon className="w-5 h-5" />
                        <span>Upload Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h3>
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                          notification.priority === 'high' ? 'bg-red-50 border-red-400' :
                          notification.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                          'bg-blue-50 border-blue-400'
                        }`}>
                          <p className="font-semibold text-sm text-gray-800">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Section */}
            {activeSection === 'appointments' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search appointments..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <PlusIcon className="w-5 h-5" />
                      <span>New Appointment</span>
                    </button>
                  </div>
                </div>

                {/* Appointment Calendar/List View */}
                <div className="grid grid-cols-1 gap-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={appointment.avatar}
                            alt={appointment.patientName}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{appointment.patientName}</h3>
                            <p className="text-gray-600">{appointment.patientId}</p>
                            <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {appointment.time}
                              </span>
                              <span>Dosha: {appointment.dosha}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-800 mb-2">{appointment.type}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(appointment.status)}-100 text-${getStatusColor(appointment.status)}-800`}>
                            {appointment.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 tooltip" title="Start Consultation">
                            <VideoCameraIcon className="w-5 h-5" />
                          </button>
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 tooltip" title="Call Patient">
                            <PhoneIcon className="w-5 h-5" />
                          </button>
                          <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 tooltip" title="View Records">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 tooltip" title="Edit">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Queue Section */}
            {activeSection === 'queue' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Live Patient Queue</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Updates</span>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {queuePatients.length} patients waiting
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {queuePatients.map((patient, index) => (
                    <div key={patient.tokenNumber} className={`border-2 rounded-lg p-6 ${
                      patient.priority === 'urgent' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                            patient.priority === 'urgent' ? 'bg-red-600' : 'bg-green-600'
                          }`}>
                            #{patient.tokenNumber.split('-')[21]}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{patient.patientName}</h3>
                            <p className="text-gray-600">{patient.patientId}</p>
                            <p className="text-sm text-gray-500 mt-1">Reason: {patient.visitReason}</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-800">{patient.waitTime} min</p>
                          <p className="text-sm text-gray-500">Wait Time</p>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            patient.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {patient.priority.toUpperCase()}
                          </span>
                          <p className="text-sm text-gray-600 mt-2">Position: {index + 1}</p>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            Call Patient
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            View Details
                          </button>
                        </div>
                      </div>

                      {patient.symptoms && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Symptoms:</span> {patient.symptoms}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Records Section */}
            {activeSection === 'patients' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Patient Records</h2>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <FunnelIcon className="w-5 h-5" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {patientRecords.map((patient) => (
                    <div key={patient.patientId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                              {patient.name.split(' ').map(n => n).join('')}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                              <p className="text-gray-600">{patient.patientId}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-600">Age:</span>
                              <p className="font-medium">{patient.age} years</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Gender:</span>
                              <p className="font-medium">{patient.gender}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Constitution:</span>
                              <p className="font-medium">{patient.constitution}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Last Visit:</span>
                              <p className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm text-gray-600">Current Condition:</span>
                            <p className="font-medium text-blue-600">{patient.condition}</p>
                          </div>

                          <div>
                            <span className="text-sm text-gray-600 mb-2 block">Recent Reports:</span>
                            <div className="flex flex-wrap gap-2">
                              {patient.reports.map((report) => (
                                <span key={report.id} className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  {report.type} - {new Date(report.date).toLocaleDateString()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            View Full Record
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Add Note
                          </button>
                          <button 
                            onClick={() => {
                              setReportUploadData(prev => ({ ...prev, patientId: patient.patientId }));
                              setUploadModalOpen(true);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                          >
                            Upload Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports & Documents Section */}
            {activeSection === 'reports' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Reports & Documents</h2>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Upload New Report</span>
                  </button>
                </div>

                {/* Report Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Lab Reports</h3>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Assessment Reports</h3>
                    <p className="text-3xl font-bold text-green-600">18</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Prescription Reports</h3>
                    <p className="text-3xl font-bold text-purple-600">32</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>

                {/* Recent Reports */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h3>
                  <div className="space-y-4">
                    {patientRecords.flatMap(patient => 
                      patient.reports.map(report => (
                        <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                              <DocumentTextIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{report.type}</h4>
                              <p className="text-sm text-gray-600">Patient: {patient.name} ({patient.patientId})</p>
                              <p className="text-xs text-gray-500">Uploaded: {new Date(report.date).toLocaleDateString()} by {report.uploadedBy}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                              View
                            </button>
                            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                              Download
                            </button>
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                              Share
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <div className="space-y-8">
                {/* Performance Metrics */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Analytics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-2">Patient Satisfaction</h3>
                      <p className="text-3xl font-bold">{todayMetrics.patientSatisfaction}/5.0</p>
                      <p className="text-green-100">+0.3 from last month</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
                      <p className="text-3xl font-bold">₹{todayMetrics.revenueToday.toLocaleString()}</p>
                      <p className="text-blue-100">+12% from last month</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-2">Avg Consultation</h3>
                      <p className="text-3xl font-bold">{todayMetrics.avgConsultationTime} min</p>
                      <p className="text-purple-100">-2 min from target</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                      <p className="text-3xl font-bold">94%</p>
                      <p className="text-orange-100">+5% improvement</p>
                    </div>
                  </div>
                </div>

                {/* Treatment Statistics */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Treatment Statistics</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Most Common Treatments */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Treatments</h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Panchakarma Consultation', count: 45, percentage: 35 },
                          { name: 'Basti Therapy', count: 32, percentage: 25 },
                          { name: 'Abhyanga', count: 28, percentage: 22 },
                          { name: 'Shirodhara', count: 23, percentage: 18 }
                        ].map((treatment, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-700">{treatment.name}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${treatment.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{treatment.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dosha Distribution */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Constitution</h3>
                      <div className="space-y-3">
                        {[
                          { dosha: 'Vata', count: 42, percentage: 35, color: 'blue' },
                          { dosha: 'Pitta', count: 38, percentage: 32, color: 'red' },
                          { dosha: 'Kapha', count: 25, percentage: 21, color: 'green' },
                          { dosha: 'Mixed Constitution', count: 15, percentage: 12, color: 'purple' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-700">{item.dosha}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`bg-${item.color}-600 h-2 rounded-full`}
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload Patient Report</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportUploadData.patientId}
                    onChange={(e) => setReportUploadData(prev => ({...prev, patientId: e.target.value}))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Patient</option>
                    {patientRecords.map(patient => (
                      <option key={patient.patientId} value={patient.patientId}>
                        {patient.name} ({patient.patientId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportUploadData.reportType}
                    onChange={(e) => setReportUploadData(prev => ({...prev, reportType: e.target.value}))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Report Type</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={reportUploadData.description}
                  onChange={(e) => setReportUploadData(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                  placeholder="Brief description of the report..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files <span className="text-red-500">*</span>
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="fileUpload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                  >
                    Choose Files
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                  </p>
                </div>

                {/* File List */}
                {reportUploadData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {reportUploadData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm text-gray-800">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportUploadData.patientId || !reportUploadData.reportType || reportUploadData.files.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                  Upload Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default DoctorDashboard;