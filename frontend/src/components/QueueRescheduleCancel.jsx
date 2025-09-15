import React, { useState, useEffect, useRef } from 'react';
import { 
  ClockIcon, 
  CalendarIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  InformationCircleIcon,
  SignalIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';

const QueueRescheduleCancel = () => {
  const [step, setStep] = useState(1); // 1: Search, 2: Queue Details, 3: Action Selection, 4: Reschedule/Cancel, 5: Confirmation
  const [action, setAction] = useState(''); // 'reschedule' or 'cancel'
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // WebSocket reference for real-time updates [web:84][web:86]
  const wsRef = useRef(null);

  // Search states
  const [searchData, setSearchData] = useState({
    tokenNumber: '',
    patientId: '',
    mobileNumber: '',
    queueId: ''
  });

  // Current queue data
  const [queueData, setQueueData] = useState(null);
  const [realTimeQueueStatus, setRealTimeQueueStatus] = useState(null);

  // Reschedule states
  const [rescheduleData, setRescheduleData] = useState({
    newDoctor: null,
    newCenter: null,
    newDate: '',
    newTimeRange: '',
    reason: '',
    preferences: ''
  });

  // Cancel states
  const [cancelData, setCancelData] = useState({
    reason: '',
    feedback: '',
    refundRequested: false
  });

  // Available options for rescheduling
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableCenters, setAvailableCenters] = useState([]);

  // Mock current queue appointment data
  const mockQueueData = {
    tokenNumber: 'Q-2025-001',
    queueId: 'QUE-12345',
    patientId: 'AYR-2024-001',
    patientName: 'John Doe',
    mobileNumber: '+91 9876543210',
    joinedAt: '2025-09-15T10:30:00Z',
    currentPosition: 5,
    totalInQueue: 12,
    estimatedWaitTime: 35,
    status: 'waiting', // waiting, called, served, cancelled
    doctor: {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialization: 'General Medicine',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
    },
    center: {
      id: 1,
      name: 'AyurSutra General Clinic - Mumbai',
      address: 'Bandra West, Mumbai, Maharashtra'
    },
    visitReason: 'General Consultation',
    priority: 'normal',
    symptoms: 'Fever and headache',
    canReschedule: true,
    canCancel: true,
    rescheduleDeadline: null, // No deadline for queue reschedules
    cancellationPolicy: 'Can cancel until called for consultation'
  };

  const rescheduleReasons = [
    'Changed my mind about timing',
    'Doctor preference changed',
    'Location convenience',
    'Schedule conflict arose',
    'Health condition improved',
    'Need different specialist',
    'Other'
  ];

  const cancelReasons = [
    'Feeling better, no longer needed',
    'Emergency came up',
    'Found another doctor',
    'Too long wait time',
    'Changed location',
    'Financial constraints',
    'Other'
  ];

  // WebSocket connection for real-time updates [web:84][web:86]
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/queue-management';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Queue WebSocket connected');
      setConnectionStatus('connected');
      
      // Subscribe to specific queue updates
      if (queueData) {
        const subscribeMessage = {
          action: 'subscribe_queue_management',
          queueId: queueData.queueId,
          tokenNumber: queueData.tokenNumber,
          patientId: queueData.patientId
        };
        wsRef.current.send(JSON.stringify(subscribeMessage));
      }
    };

    wsRef.current.onmessage = (event) => {
      handleWebSocketMessage(JSON.parse(event.data));
    };

    wsRef.current.onclose = () => {
      console.log('Queue WebSocket disconnected');
      setConnectionStatus('disconnected');
      setTimeout(connectWebSocket, 3000); // Auto-reconnect [web:86]
    };

    wsRef.current.onerror = (error) => {
      console.error('Queue WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  // Handle real-time WebSocket messages [web:84]
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'queue_status_update':
        setRealTimeQueueStatus(data.queueStatus);
        // Update local queue data with real-time info
        if (queueData && data.tokenNumber === queueData.tokenNumber) {
          setQueueData(prev => ({
            ...prev,
            currentPosition: data.queueStatus.currentPosition,
            totalInQueue: data.queueStatus.totalInQueue,
            estimatedWaitTime: data.queueStatus.estimatedWaitTime,
            status: data.queueStatus.status
          }));
        }
        break;
        
      case 'queue_modification_success':
        if (data.action === 'reschedule') {
          showNotification('Queue successfully rescheduled!', 'success');
          setStep(5);
        } else if (data.action === 'cancel') {
          showNotification('Queue successfully cancelled!', 'success');
          setStep(5);
        }
        break;
        
      case 'queue_modification_error':
        showNotification(`Error: ${data.message}`, 'error');
        break;
        
      case 'patient_called':
        if (data.tokenNumber === queueData?.tokenNumber) {
          showNotification('You are being called! Please proceed to consultation.', 'urgent');
          setQueueData(prev => ({ ...prev, status: 'called' }));
        }
        break;
        
      default:
        console.log('Unknown queue message type:', data.type);
    }
  };

  // Show notifications [web:84]
  const showNotification = (message, type = 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AyurSutra Queue Update', {
        body: message,
        icon: '/assets/logo.jpg',
        tag: 'queue-modification'
      });
    }
    
    // In-app notification (you can implement a toast system)
    const alertType = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
    alert(`${alertType.toUpperCase()}: ${message}`);
  };

  // Search for queue appointment [web:82]
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/queue/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData)
      });

      if (response.ok) {
        // For demo, using mock data
        if (searchData.tokenNumber === 'Q-2025-001' || 
            searchData.patientId === 'AYR-2024-001' ||
            searchData.mobileNumber === '+91 9876543210') {
          setQueueData(mockQueueData);
          connectWebSocket(); // Connect for real-time updates
          setStep(2);
        } else {
          throw new Error('Queue appointment not found');
        }
      } else {
        throw new Error('Failed to search queue');
      }
    } catch (error) {
      console.error('Error searching queue:', error);
      alert('Queue appointment not found. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available options for rescheduling
  const fetchRescheduleOptions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      const [doctorsResponse, centersResponse] = await Promise.all([
        fetch('/api/doctors/available'),
        fetch('/api/centers/available')
      ]);

      // Mock data for demo
      setAvailableDoctors([
        {
          id: 2,
          name: 'Dr. Rajesh Kumar',
          specialization: 'Internal Medicine',
          currentQueue: 8,
          avgWaitTime: '18 min',
          avatar: 'https://randomuser.me/api/portraits/men/35.jpg'
        },
        {
          id: 3,
          name: 'Dr. Meera Patel',
          specialization: 'Family Medicine',
          currentQueue: 6,
          avgWaitTime: '15 min',
          avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
        }
      ]);

      setAvailableCenters([
        {
          id: 2,
          name: 'AyurSutra Medical Center - Pune',
          address: 'Koregaon Park, Pune, Maharashtra',
          currentWaiting: 15,
          estimatedDelay: '12 min'
        },
        {
          id: 3,
          name: 'AyurSutra Wellness Clinic - Delhi',
          address: 'Greater Kailash, New Delhi',
          currentWaiting: 10,
          estimatedDelay: '8 min'
        }
      ]);
    } catch (error) {
      console.error('Error fetching reschedule options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reschedule submission with real-time database sync [web:85]
  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reschedulePayload = {
        originalQueueId: queueData.queueId,
        tokenNumber: queueData.tokenNumber,
        patientId: queueData.patientId,
        modifications: {
          newDoctorId: rescheduleData.newDoctor?.id || queueData.doctor.id,
          newCenterId: rescheduleData.newCenter?.id || queueData.center.id,
          newDate: rescheduleData.newDate || new Date().toISOString().split('T')[0],
          newTimeRange: rescheduleData.newTimeRange || 'anytime',
          reason: rescheduleData.reason,
          preferences: rescheduleData.preferences
        },
        timestamp: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      const response = await fetch('/api/queue/reschedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reschedulePayload)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Send real-time update via WebSocket [web:86]
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'queue_rescheduled',
            queueId: queueData.queueId,
            newQueueId: result.newQueueId,
            tokenNumber: result.newTokenNumber,
            modifications: reschedulePayload.modifications
          }));
        }

        // Update local state
        setQueueData(prev => ({
          ...prev,
          queueId: result.newQueueId,
          tokenNumber: result.newTokenNumber,
          doctor: rescheduleData.newDoctor || prev.doctor,
          center: rescheduleData.newCenter || prev.center,
          currentPosition: result.newPosition,
          status: 'waiting'
        }));

        setStep(5);
      } else {
        throw new Error('Failed to reschedule queue');
      }
    } catch (error) {
      console.error('Error rescheduling queue:', error);
      alert('Failed to reschedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancellation with real-time database sync [web:85]
  const handleCancel = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cancelPayload = {
        queueId: queueData.queueId,
        tokenNumber: queueData.tokenNumber,
        patientId: queueData.patientId,
        cancellationData: {
          reason: cancelData.reason,
          feedback: cancelData.feedback,
          refundRequested: cancelData.refundRequested,
          cancelledAt: new Date().toISOString()
        }
      };

      // TODO: Replace with actual API call
      const response = await fetch('/api/queue/cancel', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelPayload)
      });

      if (response.ok) {
        // Send real-time update via WebSocket [web:85][web:86]
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'queue_cancelled',
            queueId: queueData.queueId,
            tokenNumber: queueData.tokenNumber,
            reason: cancelData.reason
          }));
        }

        // Update local state
        setQueueData(prev => ({ ...prev, status: 'cancelled' }));
        setStep(5);
      } else {
        throw new Error('Failed to cancel queue');
      }
    } catch (error) {
      console.error('Error cancelling queue:', error);
      alert('Failed to cancel queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    if (action === 'reschedule') {
      setRescheduleData(prev => ({ ...prev, [field]: value }));
    } else if (action === 'cancel') {
      setCancelData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatWaitTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'blue';
      case 'called': return 'green';
      case 'served': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-900 mb-4">
              Manage Queue Appointment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reschedule or cancel your queue-based appointment with real-time updates
            </p>
          </div>

          {/* Connection Status */}
          {step > 1 && (
            <div className={`flex items-center justify-center space-x-2 text-sm font-medium mb-6 ${
              connectionStatus === 'connected' ? 'text-green-600' : 
              connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {connectionStatus === 'connected' ? (
                <>
                  <SignalIcon className="w-4 h-4 animate-pulse" />
                  <span>Real-time sync active</span>
                </>
              ) : connectionStatus === 'error' ? (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Sync error - retrying...</span>
                </>
              ) : (
                <>
                  <WifiIcon className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNumber 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 5 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* Step 1: Search Queue */}
            {step === 1 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MagnifyingGlassIcon className="w-6 h-6 mr-3 text-purple-600" />
                  Find Your Queue Appointment
                </h2>
                <p className="text-gray-600 mb-8">
                  Enter any of the following details to locate your queue appointment
                </p>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token Number
                      </label>
                      <input
                        type="text"
                        value={searchData.tokenNumber}
                        onChange={(e) => setSearchData(prev => ({...prev, tokenNumber: e.target.value}))}
                        placeholder="Q-2025-001"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient ID
                      </label>
                      <input
                        type="text"
                        value={searchData.patientId}
                        onChange={(e) => setSearchData(prev => ({...prev, patientId: e.target.value}))}
                        placeholder="AYR-2024-001"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={searchData.mobileNumber}
                        onChange={(e) => setSearchData(prev => ({...prev, mobileNumber: e.target.value}))}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Queue ID
                      </label>
                      <input
                        type="text"
                        value={searchData.queueId}
                        onChange={(e) => setSearchData(prev => ({...prev, queueId: e.target.value}))}
                        placeholder="QUE-12345"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!searchData.tokenNumber && !searchData.patientId && !searchData.mobileNumber && !searchData.queueId}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                        Find Queue Appointment
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Queue Details with Real-time Status */}
            {step === 2 && queueData && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Queue Details</h2>
                
                {/* Live Status Banner */}
                <div className={`mb-6 p-4 rounded-lg flex items-center ${
                  queueData.status === 'waiting' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                  queueData.status === 'called' ? 'bg-green-50 border border-green-200 text-green-800' :
                  queueData.status === 'cancelled' ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-gray-50 border border-gray-200 text-gray-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-3 ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}
                       style={{ backgroundColor: queueData.status === 'waiting' ? '#3B82F6' : 
                                                queueData.status === 'called' ? '#10B981' : 
                                                queueData.status === 'cancelled' ? '#EF4444' : '#6B7280' }}>
                  </div>
                  <div>
                    <span className="font-semibold">
                      Status: {queueData.status.charAt(0).toUpperCase() + queueData.status.slice(1)}
                    </span>
                    {queueData.status === 'waiting' && (
                      <span className="ml-4 text-sm">
                        Position {queueData.currentPosition} of {queueData.totalInQueue} • ~{formatWaitTime(queueData.estimatedWaitTime)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Queue Info */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Queue Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 text-sm">Token Number:</span>
                        <p className="font-bold font-mono text-xl text-purple-600">{queueData.tokenNumber}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600 text-sm">Position:</span>
                          <p className="font-semibold text-2xl">{queueData.currentPosition}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm">Wait Time:</span>
                          <p className="font-semibold text-2xl">{formatWaitTime(queueData.estimatedWaitTime)}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Joined At:</span>
                        <p className="font-semibold">{new Date(queueData.joinedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 text-sm">Name:</span>
                        <p className="font-semibold">{queueData.patientName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Patient ID:</span>
                        <p className="font-mono font-semibold">{queueData.patientId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Mobile:</span>
                        <p className="font-semibold">{queueData.mobileNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Visit Reason:</span>
                        <p className="font-semibold">{queueData.visitReason}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor and Center Info */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Doctor</h3>
                    <div className="flex items-center space-x-3">
                      <img
                        src={queueData.doctor.avatar}
                        alt={queueData.doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{queueData.doctor.name}</p>
                        <p className="text-sm text-gray-600">{queueData.doctor.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Center</h3>
                    <p className="font-semibold">{queueData.center.name}</p>
                    <p className="text-sm text-gray-600">{queueData.center.address}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(3)}
                    disabled={queueData.status === 'called' || queueData.status === 'served'}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {queueData.status === 'called' || queueData.status === 'served' 
                      ? 'Cannot Modify - Already Called/Served' 
                      : 'Proceed to Modify'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Action Selection */}
            {step === 3 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">What would you like to do?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reschedule Option */}
                  <div 
                    onClick={() => {
                      setAction('reschedule');
                      setStep(4);
                      fetchRescheduleOptions();
                    }}
                    className="p-6 border-2 border-purple-300 rounded-xl cursor-pointer transition-all hover:border-purple-500 hover:bg-purple-50"
                  >
                    <div className="flex items-center mb-4">
                      <ArrowPathIcon className="w-8 h-8 mr-3 text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Reschedule Queue</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Switch to a different doctor, center, or time while maintaining your queue position priority.
                    </p>
                    <div className="text-sm text-green-600">
                      ✓ Available anytime before consultation
                    </div>
                  </div>

                  {/* Cancel Option */}
                  <div 
                    onClick={() => {
                      setAction('cancel');
                      setStep(4);
                    }}
                    className="p-6 border-2 border-red-300 rounded-xl cursor-pointer transition-all hover:border-red-500 hover:bg-red-50"
                  >
                    <div className="flex items-center mb-4">
                      <XCircleIcon className="w-8 h-8 mr-3 text-red-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Cancel Queue</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Remove yourself from the queue completely. This action cannot be undone.
                    </p>
                    <div className="text-sm text-green-600">
                      ✓ {queueData.cancellationPolicy}
                    </div>
                  </div>
                </div>

                {/* Real-time Queue Policy */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-2">Real-time Queue Management:</p>
                      <ul className="space-y-1">
                        <li>• All changes are synced instantly across all systems</li>
                        <li>• Queue positions update automatically after modifications</li>
                        <li>• You'll receive real-time notifications for any status changes</li>
                        <li>• Emergency modifications available until called for consultation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Back to Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 4a: Reschedule Form */}
            {step === 4 && action === 'reschedule' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <ArrowPathIcon className="w-6 h-6 mr-3 text-purple-600" />
                  Reschedule Queue Appointment
                </h2>

                <form onSubmit={handleReschedule} className="space-y-8">
                  {/* Current Queue Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Current Queue</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-mono bg-white px-2 py-1 rounded">{queueData.tokenNumber}</span>
                      <span className="mx-2">•</span>
                      <span>{queueData.doctor.name}</span>
                      <span className="mx-2">•</span>
                      <span>{queueData.center.name}</span>
                    </div>
                  </div>

                  {/* New Doctor Selection (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Change Doctor (Optional - Keep current if not selected)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => handleInputChange('newDoctor', null)}
                        className={`p-4 border-2 rounded-lg cursor-pointer ${
                          !rescheduleData.newDoctor ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={queueData.doctor.avatar}
                            alt={queueData.doctor.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{queueData.doctor.name}</p>
                            <p className="text-sm text-gray-600">Keep Current</p>
                          </div>
                        </div>
                      </div>
                      
                      {availableDoctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => handleInputChange('newDoctor', doctor)}
                          className={`p-4 border-2 rounded-lg cursor-pointer ${
                            rescheduleData.newDoctor?.id === doctor.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={doctor.avatar}
                              alt={doctor.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-gray-800">{doctor.name}</p>
                              <p className="text-sm text-gray-600">{doctor.specialization}</p>
                              <p className="text-xs text-purple-600">{doctor.currentQueue} in queue • ~{doctor.avgWaitTime}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* New Center Selection (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Change Center (Optional - Keep current if not selected)
                    </label>
                    <div className="space-y-3">
                      <div
                        onClick={() => handleInputChange('newCenter', null)}
                        className={`p-4 border-2 rounded-lg cursor-pointer ${
                          !rescheduleData.newCenter ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-800">{queueData.center.name}</h4>
                        <p className="text-sm text-gray-600">{queueData.center.address}</p>
                        <p className="text-xs text-purple-600">Keep Current Location</p>
                      </div>
                      
                      {availableCenters.map((center) => (
                        <div
                          key={center.id}
                          onClick={() => handleInputChange('newCenter', center)}
                          className={`p-4 border-2 rounded-lg cursor-pointer ${
                            rescheduleData.newCenter?.id === center.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <h4 className="font-semibold text-gray-800">{center.name}</h4>
                          <p className="text-sm text-gray-600">{center.address}</p>
                          <p className="text-xs text-purple-600">{center.currentWaiting} waiting • ~{center.estimatedDelay}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Preference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={rescheduleData.newDate}
                        onChange={(e) => handleInputChange('newDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for today</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Preference (Optional)
                      </label>
                      <select
                        value={rescheduleData.newTimeRange}
                        onChange={(e) => handleInputChange('newTimeRange', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Anytime</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Reschedule Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rescheduling <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rescheduleData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select reason...</option>
                      {rescheduleReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Preferences
                    </label>
                    <textarea
                      value={rescheduleData.preferences}
                      onChange={(e) => handleInputChange('preferences', e.target.value)}
                      rows={3}
                      placeholder="Any specific requests or preferences for the new appointment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!rescheduleData.reason || loading}
                      className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Rescheduling...
                        </>
                      ) : (
                        'Confirm Reschedule'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 4b: Cancel Form */}
            {step === 4 && action === 'cancel' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <XCircleIcon className="w-6 h-6 mr-3 text-red-600" />
                  Cancel Queue Appointment
                </h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">Important Notice</h3>
                      <p className="text-sm text-red-700">
                        Cancelling will remove you from the queue completely. You'll need to join again if you change your mind.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCancel} className="space-y-6">
                  {/* Queue Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Queue to Cancel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Token:</span>
                        <p className="font-bold font-mono">{queueData.tokenNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Position:</span>
                        <p className="font-semibold">{queueData.currentPosition} of {queueData.totalInQueue}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Doctor:</span>
                        <p className="font-semibold">{queueData.doctor.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Estimated Wait:</span>
                        <p className="font-semibold">{formatWaitTime(queueData.estimatedWaitTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Cancellation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cancelData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select reason...</option>
                      {cancelReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback (Optional)
                    </label>
                    <textarea
                      value={cancelData.feedback}
                      onChange={(e) => handleInputChange('feedback', e.target.value)}
                      rows={4}
                      placeholder="Help us improve by sharing your experience or suggestions..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Refund Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="refundRequested"
                      checked={cancelData.refundRequested}
                      onChange={(e) => handleInputChange('refundRequested', e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="refundRequested" className="ml-2 text-sm text-gray-700">
                      Request refund for any advance payments (if applicable)
                    </label>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!cancelData.reason || loading}
                      className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cancelling...
                        </>
                      ) : (
                        'Confirm Cancellation'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="p-8 text-center">
                <div className="mb-8">
                  {action === 'reschedule' ? (
                    <>
                      <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-green-800 mb-4">Queue Rescheduled Successfully!</h2>
                      <p className="text-lg text-gray-600 mb-8">
                        Your queue appointment has been updated with real-time database sync.
                      </p>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                        <h3 className="font-semibold text-green-800 mb-4">Updated Queue Details</h3>
                        <div className="text-left space-y-2">
                          <p><span className="text-gray-600">New Token:</span> <span className="font-bold font-mono">{queueData.tokenNumber}</span></p>
                          <p><span className="text-gray-600">Doctor:</span> <span className="font-semibold">{rescheduleData.newDoctor?.name || queueData.doctor.name}</span></p>
                          <p><span className="text-gray-600">Center:</span> <span className="font-semibold">{rescheduleData.newCenter?.name || queueData.center.name}</span></p>
                          <p><span className="text-gray-600">New Position:</span> <span className="font-semibold">{queueData.currentPosition}</span></p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-20 h-20 text-red-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-red-800 mb-4">Queue Cancelled Successfully</h2>
                      <p className="text-lg text-gray-600 mb-8">
                        Your queue appointment has been cancelled and removed from the system.
                      </p>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                        <h3 className="font-semibold text-red-800 mb-4">Cancelled Queue</h3>
                        <div className="text-left space-y-2">
                          <p><span className="text-gray-600">Token:</span> <span className="font-bold font-mono">{queueData.tokenNumber}</span></p>
                          <p><span className="text-gray-600">Cancelled At:</span> <span className="font-semibold">{new Date().toLocaleString()}</span></p>
                          <p><span className="text-gray-600">Reason:</span> <span className="font-semibold">{cancelData.reason}</span></p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {action === 'reschedule' 
                      ? 'Real-time updates have been sent to all connected systems. Check your new queue status anytime.'
                      : 'All systems have been updated in real-time. You can join a new queue anytime.'
                    }
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 flex items-center"
                    >
                      <ClockIcon className="w-5 h-5 mr-2" />
                      Print Confirmation
                    </button>
                    
                    <button
                      onClick={() => {
                        // Reset all states
                        setStep(1);
                        setAction('');
                        setQueueData(null);
                        setSearchData({tokenNumber: '', patientId: '', mobileNumber: '', queueId: ''});
                        setRescheduleData({newDoctor: null, newCenter: null, newDate: '', newTimeRange: '', reason: '', preferences: ''});
                        setCancelData({reason: '', feedback: '', refundRequested: false});
                        wsRef.current?.close();
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                    >
                      Manage Another Queue
                    </button>
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

export default QueueRescheduleCancel;