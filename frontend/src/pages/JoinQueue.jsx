import React, { useState, useEffect, useRef } from 'react';
import { 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';

const JoinQueue = () => {
  const [step, setStep] = useState(1); // 1: Join Queue, 2: Live Queue Status
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // WebSocket reference
  const wsRef = useRef(null);
  
  // Patient data (auto-fetched from backend/database)
  const [patientData, setPatientData] = useState({
    patientId: 'AYR-2024-001',
    name: 'John Doe',
    aadharNumber: '1234-5678-9012'
  });

  // Form states
  const [formData, setFormData] = useState({
    mobileNumber: '',
    selectedDoctor: null,
    selectedCenter: null,
    visitReason: '',
    priority: 'normal',
    symptoms: ''
  });

  // Queue data
  const [queueData, setQueueData] = useState({
    tokenNumber: null,
    currentPosition: 0,
    totalInQueue: 0,
    estimatedWaitTime: 0,
    averageConsultationTime: 15,
    lastUpdated: null,
    queueStatus: 'waiting'
  });

  // Live queue updates
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [currentlyServing, setCurrentlyServing] = useState(null);
  const [nextPatients, setNextPatients] = useState([]);

  // Mock data
  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialization: 'General Medicine',
      experience: '15 years',
      currentQueue: 12,
      avgWaitTime: '25 min',
      status: 'available',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialization: 'Internal Medicine',
      experience: '20 years',
      currentQueue: 8,
      avgWaitTime: '18 min',
      status: 'available',
      avatar: 'https://randomuser.me/api/portraits/men/35.jpg'
    },
    {
      id: 3,
      name: 'Dr. Meera Patel',
      specialization: 'Family Medicine',
      experience: '12 years',
      currentQueue: 15,
      avgWaitTime: '30 min',
      status: 'available',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
    }
  ];

  const mockCenters = [
    {
      id: 1,
      name: 'AyurSutra General Clinic - Mumbai',
      address: 'Bandra West, Mumbai, Maharashtra',
      waitingCapacity: 50,
      currentWaiting: 23,
      estimatedDelay: '10 min',
      status: 'normal'
    },
    {
      id: 2,
      name: 'AyurSutra Medical Center - Pune',
      address: 'Koregaon Park, Pune, Maharashtra',
      waitingCapacity: 40,
      currentWaiting: 35,
      estimatedDelay: '15 min',
      status: 'busy'
    },
    {
      id: 3,
      name: 'AyurSutra Wellness Clinic - Delhi',
      address: 'Greater Kailash, New Delhi',
      waitingCapacity: 60,
      currentWaiting: 18,
      estimatedDelay: '5 min',
      status: 'normal'
    }
  ];

  const visitReasons = [
    'General Consultation',
    'Follow-up Visit',
    'Symptom Check',
    'Routine Check-up',
    'Prescription Renewal',
    'Second Opinion',
    'Health Screening',
    'Other'
  ];

  // WebSocket connection setup [web:75][web:78]
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/queue';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      
      // Subscribe to queue updates for specific doctor/center
      if (formData.selectedDoctor && formData.selectedCenter) {
        const subscribeMessage = {
          action: 'subscribe',
          doctorId: formData.selectedDoctor.id,
          centerId: formData.selectedCenter.id,
          patientId: patientData.patientId
        };
        wsRef.current.send(JSON.stringify(subscribeMessage));
      }
    };

    wsRef.current.onmessage = (event) => {
      handleWebSocketMessage(JSON.parse(event.data)); [web,61]
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  // Handle real-time WebSocket messages [web:61][web:65]
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'queue_update':
        setQueueData(prev => ({
          ...prev,
          ...data.queueData,
          lastUpdated: new Date()
        }));
        break;
        
      case 'position_update':
        setQueueData(prev => ({
          ...prev,
          currentPosition: data.position,
          estimatedWaitTime: data.estimatedWaitTime,
          lastUpdated: new Date()
        }));
        break;
        
      case 'currently_serving':
        setCurrentlyServing(data.patient);
        break;
        
      case 'next_patients':
        setNextPatients(data.patients);
        break;
        
      case 'live_update':
        setLiveUpdates(prev => [data.update, ...prev.slice(0, 9)]); // Keep last 10 updates
        break;
        
      case 'call_patient':
        if (data.patientId === patientData.patientId) {
          // Patient is being called
          setQueueData(prev => ({
            ...prev,
            queueStatus: 'called'
          }));
          // Show notification or alert
          showNotification('Your turn! Please proceed to the consultation room.', 'success');
        }
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Show browser notification [web:61]
  const showNotification = (message, type = 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AyurSutra Queue Update', {
        body: message,
        icon: '/assets/logo.jpg',
        tag: 'queue-update'
      });
    }
    
    // Also show in-app notification (you can implement a toast system)
    alert(message);
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle form submission to join queue
  const handleJoinQueue = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patientData,
          ...formData,
          joinTime: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update queue data with server response
        setQueueData({
          tokenNumber: result.tokenNumber,
          currentPosition: result.position,
          totalInQueue: result.totalInQueue,
          estimatedWaitTime: result.estimatedWaitTime,
          averageConsultationTime: result.avgConsultationTime,
          lastUpdated: new Date(),
          queueStatus: 'waiting'
        });

        // Connect to WebSocket for real-time updates
        connectWebSocket();
        
        setStep(2);
      } else {
        throw new Error('Failed to join queue');
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format time display
  const formatWaitTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  // Get queue status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'blue';
      case 'called': return 'green';
      case 'delayed': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              {step === 1 ? 'Join Doctor Queue' : 'Live Queue Status'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {step === 1 
                ? 'Select your doctor and join the real-time queue for general consultation'
                : 'Track your position and get real-time updates without refreshing the page'
              }
            </p>
          </div>

          {step === 1 && (
            /* Step 1: Join Queue Form */
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleJoinQueue} className="space-y-8">
                
                {/* Patient Information (Auto-fetched) */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient ID
                      </label>
                      <input
                        type="text"
                        value={patientData.patientId}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={patientData.name}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={patientData.aadharNumber}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      required
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Doctor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleInputChange('selectedDoctor', doctor)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.selectedDoctor?.id === doctor.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={doctor.avatar}
                            alt={doctor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                            <p className="text-sm text-blue-600">{doctor.specialization}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center">
                            <UserGroupIcon className="w-3 h-3 mr-1" />
                            <span>{doctor.currentQueue} in queue</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            <span>~{doctor.avgWaitTime}</span>
                          </div>
                        </div>
                        
                        <div className={`mt-2 px-2 py-1 rounded-full text-xs text-center ${
                          doctor.status === 'available' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doctor.status === 'available' ? '✓ Available' : '⚠ Busy'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Center</h3>
                  <div className="space-y-4">
                    {mockCenters.map((center) => (
                      <div
                        key={center.id}
                        onClick={() => handleInputChange('selectedCenter', center)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.selectedCenter?.id === center.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 flex items-center">
                              <BuildingOffice2Icon className="w-5 h-5 mr-2 text-blue-600" />
                              {center.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{center.address}</p>
                            
                            <div className="flex items-center space-x-4 mt-3 text-sm">
                              <span className="text-gray-600">
                                Waiting: {center.currentWaiting}/{center.waitingCapacity}
                              </span>
                              <span className="text-gray-600">
                                Delay: {center.estimatedDelay}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            center.status === 'normal' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {center.status === 'normal' ? 'Normal' : 'Busy'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visit Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.visitReason}
                      onChange={(e) => handleInputChange('visitReason', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select reason...</option>
                      {visitReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brief Symptoms (Optional)
                  </label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    rows={3}
                    placeholder="Briefly describe your symptoms to help the doctor prepare..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formData.mobileNumber || !formData.selectedDoctor || !formData.selectedCenter || !formData.visitReason || loading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Joining Queue...
                    </>
                  ) : (
                    <>
                      <UserGroupIcon className="w-5 h-5 mr-3" />
                      Join Queue
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            /* Step 2: Live Queue Status */
            <div className="space-y-6">
              
              {/* Connection Status */}
              <div className={`flex items-center justify-center space-x-2 text-sm font-medium ${
                connectionStatus === 'connected' ? 'text-green-600' : 
                connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {connectionStatus === 'connected' ? (
                  <>
                    <SignalIcon className="w-4 h-4 animate-pulse" />
                    <span>Live updates connected</span>
                  </>
                ) : connectionStatus === 'error' ? (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>Connection error - retrying...</span>
                  </>
                ) : (
                  <>
                    <WifiIcon className="w-4 h-4 animate-spin" />
                    <span>Connecting to live updates...</span>
                  </>
                )}
              </div>

              {/* Patient's Queue Status Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`p-6 text-white bg-gradient-to-r ${
                  queueData.queueStatus === 'called' ? 'from-green-500 to-emerald-600' :
                  queueData.queueStatus === 'waiting' ? 'from-blue-500 to-cyan-600' :
                  'from-gray-500 to-slate-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {queueData.queueStatus === 'called' ? 'Your Turn!' : 'Queue Status'}
                      </h2>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg">Token: <span className="font-bold">#{queueData.tokenNumber}</span></span>
                        <span>Position: <span className="font-bold">{queueData.currentPosition}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{formatWaitTime(queueData.estimatedWaitTime)}</div>
                      <div className="text-sm opacity-90">Estimated Wait</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* Queue Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Queue Progress</span>
                      <span>{queueData.totalInQueue - queueData.currentPosition} of {queueData.totalInQueue} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${((queueData.totalInQueue - queueData.currentPosition) / queueData.totalInQueue) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Queue Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{queueData.currentPosition}</div>
                      <div className="text-sm text-gray-600">Your Position</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{queueData.totalInQueue}</div>
                      <div className="text-sm text-gray-600">Total in Queue</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{queueData.averageConsultationTime}</div>
                      <div className="text-sm text-gray-600">Avg Time (min)</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {queueData.lastUpdated ? new Date(queueData.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                      </div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                    </div>
                  </div>

                  {/* Doctor & Center Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={formData.selectedDoctor?.avatar}
                        alt={formData.selectedDoctor?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800">{formData.selectedDoctor?.name}</h4>
                        <p className="text-sm text-gray-600">{formData.selectedDoctor?.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <BuildingOffice2Icon className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-800">{formData.selectedCenter?.name}</h4>
                        <p className="text-sm text-gray-600">{formData.selectedCenter?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Currently Serving & Next Patients */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Currently Serving */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                    Currently Serving
                  </h3>
                  {currentlyServing ? (
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        #{currentlyServing.tokenNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{currentlyServing.name}</p>
                        <p className="text-sm text-gray-600">Started: {new Date(currentlyServing.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No patient currently being served</p>
                    </div>
                  )}
                </div>

                {/* Next in Queue */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Next in Queue
                  </h3>
                  <div className="space-y-2">
                    {nextPatients.length > 0 ? (
                      nextPatients.slice(0, 3).map((patient, index) => (
                        <div key={patient.tokenNumber} className={`flex items-center space-x-3 p-3 rounded-lg ${
                          patient.tokenNumber === queueData.tokenNumber ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            patient.tokenNumber === queueData.tokenNumber ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            #{patient.tokenNumber}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {patient.tokenNumber === queueData.tokenNumber ? 'You' : patient.name}
                            </p>
                            <p className="text-xs text-gray-600">{patient.reason}</p>
                          </div>
                          {index === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Next
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <UserGroupIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Queue information loading...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Updates Feed */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Live Updates
                  <span className={`ml-2 w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {liveUpdates.length > 0 ? (
                    liveUpdates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{update.message}</p>
                          <p className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent updates</p>
                      <p className="text-sm">Live updates will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
                >
                  Print Token
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to leave the queue?')) {
                      // TODO: API call to leave queue
                      wsRef.current?.close();
                      setStep(1);
                    }
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Leave Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default JoinQueue;