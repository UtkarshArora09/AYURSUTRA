import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  UsersIcon,
  HeartIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const DoctorDashboard = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [stats, setStats] = useState({
    todaysPatients: 0,
    weeklyPatients: 0,
    totalPatients: 0,
    pendingReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded clinic/hospital information
  const clinicInfo = {
    name: "AyurSutra Wellness Center",
    address: "123 Health Street, Medical District, Mumbai 400001",
    phone: "+91 98765 43210",
    email: "admin@ayursutra.com",
    website: "www.ayursutra.com",
  };

  useEffect(() => {
    fetchDoctorData();
    fetchDashboardStats();
    fetchRecentActivity();
    fetchUpcomingAppointments();
  }, []);

  // 🔹 Fetch logged-in doctor data
  const fetchDoctorData = async () => {
    try {
      const response = await fetch(
        `https://ayursutra-qhp0.onrender.com/api/doctors/Ayur_doc3`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctor data");
      }

      const data = await response.json();
      setDoctorData(data);
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };
  const fetchDashboardStats = async () => {
    try {
      // Mock API call - replace with actual endpoint
      const response = await axios.get(`/api/doctors/${doctorId}/stats`);
      setStats(response.data);
    } catch (error) {
      // Hardcoded fallback data
      setStats({
        todaysPatients: 1,
        weeklyPatients: 1,
        totalPatients: 1,
        pendingReports: 1,
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get(`/api/doctors/${doctorId}/activity`);

      const data = response.data;

      // Ensure it's always an array
      setRecentActivity(Array.isArray(data) ? data : data.recentActivity || []);
    } catch (error) {
      setRecentActivity([
        {
          id: 1,
          type: "appointment",
          description: "Consultation with John Doe completed",
          time: "2 hours ago",
          status: "completed",
        },
        {
          id: 2,
          type: "report",
          description: "Lab report reviewed for Patient ID: PAT-2024-156",
          time: "4 hours ago",
          status: "reviewed",
        },
        {
          id: 3,
          type: "prescription",
          description: "Prescription updated for Sarah Wilson",
          time: "6 hours ago",
          status: "updated",
        },
        {
          id: 4,
          type: "appointment",
          description: "Emergency consultation scheduled",
          time: "1 day ago",
          status: "scheduled",
        },
      ]);
    }
    setLoading(false);
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await axios.get(
        `/api/doctors/${doctorId}/appointments/upcoming`
      );

      const data = response.data;

      // Normalize to an array
      setUpcomingAppointments(
        Array.isArray(data) ? data : data.appointments || []
      );
    } catch (error) {
      setUpcomingAppointments([
        {
          id: 1,
          patientName: "Emily Johnson",
          time: "09:00 AM",
          type: "Consultation",
          duration: "30 min",
          status: "confirmed",
        },
        {
          id: 2,
          patientName: "Michael Brown",
          time: "10:30 AM",
          type: "Follow-up",
          duration: "20 min",
          status: "confirmed",
        },
        {
          id: 3,
          patientName: "Lisa Davis",
          time: "02:00 PM",
          type: "Therapy Session",
          duration: "45 min",
          status: "pending",
        },
        {
          id: 4,
          patientName: "Robert Miller",
          time: "03:30 PM",
          type: "Consultation",
          duration: "30 min",
          status: "confirmed",
        },
      ]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (loading || !doctorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentDateTime = getCurrentDateTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, Dr. {doctorData.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {doctorData.specialization}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentDateTime.date}
                </p>
                <p className="text-sm text-gray-500">{currentDateTime.time}</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <BellIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Doctor Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-center">
                  {doctorData.name}
                </h2>
                <p className="text-blue-100 text-center text-sm">
                  {doctorData.specialization}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 mr-3" />
                  <span className="text-sm">{doctorData.email}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="w-4 h-4 mr-3" />
                  <span className="text-sm">{doctorData.phone}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <AcademicCapIcon className="w-4 h-4 mr-3" />
                  <span className="text-sm">{doctorData.qualification}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-3" />
                  <span className="text-sm">
                    {doctorData.experience_years} years experience
                  </span>
                </div>

                <div className="flex items-start text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-3 mt-0.5" />
                  <span className="text-sm">{doctorData.clinic_address}</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-lg transition-colors">
                  <PlusIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium">New Appointment</span>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-green-50 rounded-lg transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">
                    Write Prescription
                  </span>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-purple-50 rounded-lg transition-colors">
                  <EyeIcon className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium">View Lab Reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Today's Patients
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.todaysPatients}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-600 text-sm font-medium">
                    +12% from yesterday
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      This Week
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.weeklyPatients}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-600 text-sm font-medium">
                    +8% from last week
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Patients
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalPatients}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    Lifetime count
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Reports
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.pendingReports}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-orange-600 text-sm font-medium">
                    Requires attention
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today's Appointments
                    </h3>
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.type} • {appointment.duration}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {appointment.time}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full \${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 \${
                          activity.type === 'appointment' ? 'bg-blue-100' :
                          activity.type === 'report' ? 'bg-green-100' :
                          activity.type === 'prescription' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}
                        >
                          {activity.type === "appointment" && (
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                          )}
                          {activity.type === "report" && (
                            <DocumentTextIcon className="w-4 h-4 text-green-600" />
                          )}
                          {activity.type === "prescription" && (
                            <HeartIcon className="w-4 h-4 text-purple-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>

                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full \${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'updated' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Practice Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Clinic Details
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {clinicInfo.name}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {clinicInfo.address}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {clinicInfo.phone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {clinicInfo.email}
                    </p>
                    <p>
                      <span className="font-medium">Website:</span>{" "}
                      {clinicInfo.website}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Professional Status
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">License Status:</span>{" "}
                      <span className="text-green-600">Active</span>
                    </p>
                    <p>
                      <span className="font-medium">Board Certification:</span>{" "}
                      <span className="text-green-600">Certified</span>
                    </p>
                    <p>
                      <span className="font-medium">Practice Since:</span>{" "}
                      {new Date().getFullYear() - doctorData.experience_years}
                    </p>
                    <p>
                      <span className="font-medium">Specialization:</span>{" "}
                      {doctorData.specialization}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Video Call Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() =>
            (window.location.href =
              "https://videocall-6nuu.onrender.com/doctor.html")
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          Video Call
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;
