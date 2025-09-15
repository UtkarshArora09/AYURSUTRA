import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  HeartIcon,
  BellIcon,
  CogIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  StarIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PatientDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedReport, setSelectedReport] = useState(null);

  // Patient data
  const patientData = {
    patientId: 'AYR-2024-001',
    name: 'John Doe',
    age: 32,
    gender: 'Male',
    bloodGroup: 'O+',
    email: 'john.doe@email.com',
    mobile: '+91 9876543210',
    address: 'Bandra West, Mumbai, Maharashtra',
    emergencyContact: '+91 9876543211',
    registrationDate: '2024-01-15',
    profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
    primaryDosha: 'Vata',
    constitution: 'Vata-Pitta',
    allergies: ['Peanuts', 'Shellfish'],
    chronicConditions: ['Hypertension'],
    currentWeight: '75 kg',
    height: '175 cm',
    bmi: '24.5'
  };

  // Therapy roadmap data [web:105][web:111]
  const therapyRoadmap = {
    totalPhases: 4,
    currentPhase: 2,
    overallProgress: 45,
    phases: [
      {
        id: 1,
        title: 'Initial Assessment & Detox',
        status: 'completed',
        duration: '2 weeks',
        startDate: '2024-08-01',
        endDate: '2024-08-15',
        progress: 100,
        therapies: [
          { name: 'Panchakarma Consultation', status: 'completed', date: '2024-08-01' },
          { name: 'Abhyanga (Oil Massage)', status: 'completed', date: '2024-08-03' },
          { name: 'Swedana (Steam Therapy)', status: 'completed', date: '2024-08-05' },
          { name: 'Virechana (Purgation)', status: 'completed', date: '2024-08-08' }
        ],
        outcome: 'Toxins successfully eliminated, digestive fire improved'
      },
      {
        id: 2,
        title: 'Rejuvenation & Balance',
        status: 'in-progress',
        duration: '3 weeks',
        startDate: '2024-08-16',
        endDate: '2024-09-06',
        progress: 60,
        therapies: [
          { name: 'Basti (Medicated Enema)', status: 'completed', date: '2024-08-18' },
          { name: 'Shirodhara (Oil Pouring)', status: 'completed', date: '2024-08-22' },
          { name: 'Nasya (Nasal Therapy)', status: 'in-progress', date: '2024-08-28' },
          { name: 'Karna Purana (Ear Therapy)', status: 'scheduled', date: '2024-09-02' }
        ],
        outcome: 'Nervous system calming, stress levels reducing'
      },
      {
        id: 3,
        title: 'Strengthening & Immunity',
        status: 'scheduled',
        duration: '2 weeks',
        startDate: '2024-09-07',
        endDate: '2024-09-21',
        progress: 0,
        therapies: [
          { name: 'Rasayana Therapy', status: 'scheduled', date: '2024-09-07' },
          { name: 'Yoga & Pranayama', status: 'scheduled', date: '2024-09-09' },
          { name: 'Herbal Medicine Course', status: 'scheduled', date: '2024-09-12' },
          { name: 'Lifestyle Counseling', status: 'scheduled', date: '2024-09-18' }
        ],
        outcome: 'Enhanced immunity and vitality'
      },
      {
        id: 4,
        title: 'Maintenance & Follow-up',
        status: 'pending',
        duration: '4 weeks',
        startDate: '2024-09-22',
        endDate: '2024-10-20',
        progress: 0,
        therapies: [
          { name: 'Monthly Check-ups', status: 'pending', date: '2024-09-22' },
          { name: 'Diet Plan Refinement', status: 'pending', date: '2024-09-25' },
          { name: 'Home Remedies Training', status: 'pending', date: '2024-10-01' },
          { name: 'Final Assessment', status: 'pending', date: '2024-10-20' }
        ],
        outcome: 'Long-term health maintenance plan'
      }
    ]
  };

  // Medical reports data [web:106][web:109]
  const medicalReports = [
    {
      id: 1,
      title: 'Initial Ayurvedic Assessment',
      type: 'consultation',
      date: '2024-08-01',
      doctor: 'Dr. Priya Sharma',
      category: 'General Assessment',
      status: 'final',
      keyFindings: [
        'Primary Dosha: Vata with Pitta imbalance',
        'Digestive fire (Agni) weakened',
        'Stress-related symptoms present',
        'Sleep pattern disrupted'
      ],
      recommendations: [
        'Begin Panchakarma detox program',
        'Follow Vata-pacifying diet',
        'Regular oil massage therapy',
        'Meditation and yoga practice'
      ],
      attachments: ['assessment-report.pdf', 'dosha-analysis.pdf']
    },
    {
      id: 2,
      title: 'Blood Analysis Report',
      type: 'lab-test',
      date: '2024-08-05',
      doctor: 'Dr. Rajesh Kumar',
      category: 'Laboratory',
      status: 'final',
      keyFindings: [
        'Hemoglobin: 13.5 g/dL (Normal)',
        'Vitamin D: 18 ng/mL (Deficient)',
        'Cholesterol: 195 mg/dL (Borderline)',
        'Blood Sugar: 92 mg/dL (Normal)'
      ],
      recommendations: [
        'Vitamin D supplementation',
        'Cholesterol monitoring',
        'Continue current diet plan'
      ],
      attachments: ['blood-report.pdf', 'reference-ranges.pdf']
    },
    {
      id: 3,
      title: 'Pulse Diagnosis Report',
      type: 'diagnostic',
      date: '2024-08-10',
      doctor: 'Dr. Meera Patel',
      category: 'Ayurvedic Diagnosis',
      status: 'final',
      keyFindings: [
        'Vata pulse characteristics confirmed',
        'Kapha accumulation in respiratory system',
        'Pitta aggravation in digestive tract',
        'Overall vitality improving'
      ],
      recommendations: [
        'Continue Basti therapy',
        'Add respiratory cleansing herbs',
        'Cooling therapies for Pitta'
      ],
      attachments: ['pulse-analysis.pdf']
    }
  ];

  // Upcoming appointments [web:104]
  const upcomingAppointments = [
    {
      id: 1,
      type: 'panchakarma',
      title: 'Nasya Therapy Session',
      doctor: 'Dr. Priya Sharma',
      date: '2024-09-16',
      time: '10:00 AM',
      location: 'AyurSutra Center - Mumbai',
      status: 'confirmed',
      therapyDuration: '90 min',
      preparationNotes: 'Light breakfast recommended, avoid dairy 2 hours before'
    },
    {
      id: 2,
      type: 'consultation',
      title: 'Progress Review Consultation',
      doctor: 'Dr. Rajesh Kumar',
      date: '2024-09-18',
      time: '2:30 PM',
      location: 'Video Consultation',
      status: 'confirmed',
      therapyDuration: '30 min',
      preparationNotes: 'Prepare questions about current symptoms and progress'
    },
    {
      id: 3,
      type: 'queue',
      title: 'General Health Check',
      doctor: 'Dr. Meera Patel',
      date: '2024-09-20',
      time: 'Queue Position #5',
      location: 'AyurSutra Center - Pune',
      status: 'in-queue',
      estimatedTime: '~45 min wait'
    }
  ];

  // Health metrics [web:104][web:118]
  const healthMetrics = {
    vitalSigns: [
      { name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', trend: 'stable' },
      { name: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', trend: 'improving' },
      { name: 'Weight', value: '75', unit: 'kg', status: 'normal', trend: 'decreasing' },
      { name: 'BMI', value: '24.5', unit: '', status: 'normal', trend: 'stable' }
    ],
    doshaBalance: [
      { dosha: 'Vata', percentage: 45, status: 'balanced', color: 'blue' },
      { dosha: 'Pitta', percentage: 35, status: 'slightly-high', color: 'red' },
      { dosha: 'Kapha', percentage: 20, status: 'low', color: 'green' }
    ],
    progressMetrics: [
      { name: 'Sleep Quality', value: 7.5, max: 10, improvement: '+2.1' },
      { name: 'Energy Levels', value: 8.2, max: 10, improvement: '+3.4' },
      { name: 'Stress Levels', value: 3.8, max: 10, improvement: '-4.2' },
      { name: 'Digestive Health', value: 8.7, max: 10, improvement: '+5.1' }
    ]
  };

  // Notifications [web:104]
  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Appointment Tomorrow',
      message: 'Nasya Therapy session with Dr. Priya Sharma at 10:00 AM',
      time: '2 hours ago',
      priority: 'high',
      action: 'View Details'
    },
    {
      id: 2,
      type: 'medication',
      title: 'Medication Reminder',
      message: 'Take Triphala churna before bedtime',
      time: '6 hours ago',
      priority: 'medium',
      action: 'Mark Taken'
    },
    {
      id: 3,
      type: 'report',
      title: 'New Report Available',
      message: 'Your blood analysis report is ready for review',
      time: '1 day ago',
      priority: 'low',
      action: 'View Report'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'scheduled': return 'yellow';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return '↗️';
      case 'stable':
        return '➡️';
      case 'declining':
        return '↘️';
      default:
        return '➡️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={patientData.profileImage}
                    alt={patientData.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back, {patientData.name}! 👋</h1>
                    <p className="text-gray-600">Patient ID: {patientData.patientId} • {patientData.primaryDosha} Constitution</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <span>📧 {patientData.email}</span>
                      <span>📱 {patientData.mobile}</span>
                      <span>🩸 {patientData.bloodGroup}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
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
                  { id: 'roadmap', name: 'Therapy Roadmap', icon: ArrowRightIcon },
                  { id: 'reports', name: 'Medical Reports', icon: DocumentTextIcon },
                  { id: 'appointments', name: 'Appointments', icon: CalendarDaysIcon },
                  { id: 'health', name: 'Health Metrics', icon: HeartIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeSection === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Quick Stats */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Progress Overview */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Treatment Progress Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Overall Progress</p>
                            <p className="text-2xl font-bold text-green-600">{therapyRoadmap.overallProgress}%</p>
                          </div>
                          <CheckCircleIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="mt-3 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${therapyRoadmap.overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Current Phase</p>
                            <p className="text-2xl font-bold text-blue-600">{therapyRoadmap.currentPhase}/{therapyRoadmap.totalPhases}</p>
                          </div>
                          <PlayIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-blue-700 mt-2">Rejuvenation & Balance</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Completed Therapies</p>
                            <p className="text-2xl font-bold text-purple-600">8/16</p>
                          </div>
                          <StarIcon className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-sm text-purple-700 mt-2">Excellent compliance</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                        <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Shirodhara Session Completed</p>
                          <p className="text-gray-600 text-sm">August 22, 2024 • Stress levels significantly reduced</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                        <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">New Report Available</p>
                          <p className="text-gray-600 text-sm">August 20, 2024 • Blood analysis shows improvement</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
                        <ClockIcon className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Upcoming: Nasya Therapy</p>
                          <p className="text-gray-600 text-sm">September 16, 2024 • Nasal cleansing treatment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  
                  {/* Next Appointment */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Next Appointment</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                      <p className="font-semibold">{upcomingAppointments[0].title}</p>
                      <p className="text-blue-100 text-sm">Dr. {upcomingAppointments[0].doctor}</p>
                      <div className="flex items-center mt-3 space-x-4 text-sm">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          {new Date(upcomingAppointments[0].date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {upcomingAppointments[0].time}
                        </span>
                      </div>
                      <button className="w-full mt-4 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50">
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                        <PhoneIcon className="w-5 h-5" />
                        <span>Call Doctor</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                        <VideoCameraIcon className="w-5 h-5" />
                        <span>Video Consultation</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span>Book Appointment</span>
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

            {/* Therapy Roadmap Section - Byju's Style */}
            {activeSection === 'roadmap' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Your Ayurvedic Healing Journey</h2>
                    <p className="text-gray-600 mt-2">Track your progress through each phase of treatment</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-4">
                    <p className="text-sm">Overall Progress</p>
                    <p className="text-3xl font-bold">{therapyRoadmap.overallProgress}%</p>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400 rounded-full"></div>
                  
                  <div className="space-y-12">
                    {therapyRoadmap.phases.map((phase, index) => (
                      <div key={phase.id} className="relative flex items-start space-x-8">
                        
                        {/* Phase Indicator */}
                        <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          phase.status === 'completed' ? 'bg-green-500' :
                          phase.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                          phase.status === 'scheduled' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}>
                          {phase.status === 'completed' ? (
                            <CheckCircleIcon className="w-8 h-8" />
                          ) : phase.status === 'in-progress' ? (
                            <PlayIcon className="w-8 h-8" />
                          ) : (
                            phase.id
                          )}
                        </div>

                        {/* Phase Content */}
                        <div className="flex-1 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800">{phase.title}</h3>
                              <p className="text-gray-600">Duration: {phase.duration} • {phase.startDate} to {phase.endDate}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                              phase.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              phase.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {phase.status === 'in-progress' ? 'IN PROGRESS' :
                               phase.status === 'completed' ? 'COMPLETED' :
                               phase.status === 'scheduled' ? 'SCHEDULED' : 'PENDING'}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Phase Progress</span>
                              <span>{phase.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-1000 ${
                                  phase.status === 'completed' ? 'bg-green-500' :
                                  phase.status === 'in-progress' ? 'bg-blue-500' :
                                  'bg-gray-300'
                                }`}
                                style={{ width: `${phase.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Therapies Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {phase.therapies.map((therapy, therapyIndex) => (
                              <div key={therapyIndex} className={`p-4 rounded-lg border-2 ${
                                therapy.status === 'completed' ? 'bg-green-50 border-green-200' :
                                therapy.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                                therapy.status === 'scheduled' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-800">{therapy.name}</h4>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    therapy.status === 'completed' ? 'bg-green-500' :
                                    therapy.status === 'in-progress' ? 'bg-blue-500' :
                                    therapy.status === 'scheduled' ? 'bg-yellow-500' :
                                    'bg-gray-300'
                                  }`}>
                                    {therapy.status === 'completed' && (
                                      <CheckCircleIcon className="w-4 h-4 text-white" />
                                    )}
                                    {therapy.status === 'in-progress' && (
                                      <PlayIcon className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{therapy.date}</p>
                              </div>
                            ))}
                          </div>

                          {/* Outcome */}
                          {phase.outcome && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-400">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                {phase.status === 'completed' ? 'Achieved Outcome' : 'Expected Outcome'}
                              </h4>
                              <p className="text-gray-700">{phase.outcome}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Journey Insights */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Therapies Completed</h3>
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-green-100">50% of total journey</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Days in Treatment</h3>
                    <p className="text-3xl font-bold">45</p>
                    <p className="text-blue-100">Consistent progress</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Health Improvement</h3>
                    <p className="text-3xl font-bold">85%</p>
                    <p className="text-purple-100">Excellent results</p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Reports Section */}
            {activeSection === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical Reports & Documents</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {medicalReports.map((report) => (
                      <div 
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                            <p className="text-gray-600 text-sm">{report.category} • Dr. {report.doctor}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.status === 'final' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                          <p>📅 {new Date(report.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Key Findings:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.keyFindings.slice(0, 2).map((finding, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{report.attachments.length} attachment(s)</span>
                          <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                            View Full Report →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Report Modal/Detail View */}
                {selectedReport && (
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedReport.title}</h2>
                        <p className="text-gray-600">Dr. {selectedReport.doctor} • {selectedReport.category}</p>
                        <p className="text-gray-500 text-sm">{new Date(selectedReport.date).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedReport(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Findings</h3>
                        <ul className="space-y-2">
                          {selectedReport.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
                        <ul className="space-y-2">
                          {selectedReport.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <ArrowRightIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedReport.attachments.map((attachment, index) => (
                          <button key={index} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                            <DocumentTextIcon className="w-5 h-5" />
                            <span>{attachment}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Appointments Section */}
            {activeSection === 'appointments' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>
                
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{appointment.title}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              appointment.type === 'panchakarma' ? 'bg-green-100 text-green-800' :
                              appointment.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {appointment.type.toUpperCase()}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3">Dr. {appointment.doctor}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="w-4 h-4 text-gray-500" />
                              <span>{appointment.time}</span>
                              {appointment.therapyDuration && <span className="text-gray-400">({appointment.therapyDuration})</span>}
                            </div>
                            <div className="flex items-center space-x-2">
                              <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          
                          {appointment.preparationNotes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">Preparation Notes:</span> {appointment.preparationNotes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Reschedule
                          </button>
                          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Metrics Section */}
            {activeSection === 'health' && (
              <div className="space-y-8">
                
                {/* Vital Signs */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Vital Signs & Health Metrics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {healthMetrics.vitalSigns.map((vital, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{vital.name}</h3>
                          <span className="text-lg">{getTrendIcon(vital.trend)}</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{vital.value} <span className="text-sm font-normal text-gray-600">{vital.unit}</span></p>
                        <p className={`text-sm font-semibold ${
                          vital.status === 'normal' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {vital.status.toUpperCase()} • {vital.trend}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dosha Balance */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Dosha Balance Analysis</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {healthMetrics.doshaBalance.map((dosha, index) => (
                      <div key={index} className="text-center">
                        <div className={`relative w-32 h-32 mx-auto mb-4`}>
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-gray-200"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={`${dosha.percentage * 3.52} 351.86`}
                              className={`text-${dosha.color}-500`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">{dosha.percentage}%</p>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{dosha.dosha}</h3>
                        <p className={`text-sm font-semibold ${
                          dosha.status === 'balanced' ? 'text-green-600' :
                          dosha.status === 'slightly-high' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {dosha.status.replace('-', ' ').toUpperCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Metrics */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Progress Metrics</h2>
                  
                  <div className="space-y-6">
                    {healthMetrics.progressMetrics.map((metric, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{metric.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-blue-600">{metric.value}/{metric.max}</span>
                            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                              parseFloat(metric.improvement) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {metric.improvement}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                            style={{ width: `${(metric.value / metric.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PatientDashboard;