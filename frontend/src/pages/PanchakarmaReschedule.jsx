import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PanchakarmaReschedule = () => {
  const [step, setStep] = useState(1); // 1: Search, 2: Appointment Details, 3: Action Selection, 4: Reschedule, 5: Confirmation
  const [action, setAction] = useState(""); // 'reschedule' or 'cancel'
  const [loading, setLoading] = useState(false);

  // Search states
  const [searchData, setSearchData] = useState({
    bookingId: "",
    patientId: "",
    mobileNumber: "",
    aadharNumber: "",
  });

  // Current appointment data
  const [appointmentData, setAppointmentData] = useState(null);

  // Reschedule states
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    newTimeSlot: null,
    reason: "",
    preferences: "",
  });

  // Cancel states
  const [cancelData, setCancelData] = useState({
    reason: "",
    feedback: "",
  });

  // Available data for rescheduling
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Mock data for demonstration
  const mockAppointment = {
    bookingId: "PCK-1726308000000",
    patientId: "AYR-2024-001",
    patientId: "AYR-2024-001",
    aadharNumber: "1234-5678-9012",
    mobileNumber: "+91 9876543210",
    currentDate: "2025-09-20",
    currentTime: "10:30",
    doshaType: "vata",
    doctor: {
      id: 1,
      id: "DOC-001",
      specialization: "Panchakarma Specialist",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    center: {
      name: "AyurSutra Wellness Center - Mumbai",
      address: "Bandra West, Mumbai, Maharashtra",
    },
    treatment: {
      name: "Basti (Medicated Enema)",
      duration: "90 minutes",
    },
    status: "confirmed",
    bookingDate: "2025-09-15",
    canReschedule: true,
    canCancel: true,
    rescheduleDeadline: "2025-09-18", // 2 days before appointment
    cancellationDeadline: "2025-09-19", // 1 day before appointment
  };

  const cancelReasons = [
    "Personal emergency",
    "Health condition changed",
    "Schedule conflict",
    "Travel issues",
    "Family emergency",
    "Doctor unavailable",
    "Weather conditions",
    "Other",
  ];

  const rescheduleReasons = [
    "Schedule conflict",
    "Personal commitment",
    "Travel delay",
    "Health condition needs more time",
    "Work emergency",
    "Family situation",
    "Other",
  ];

  // Search for appointment
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://ayursutra-qhp0.onrender.com/api/bookings/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(searchData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAppointmentData(data);
        setStep(2);
      } else {
        alert(
          data.message || "Appointment not found. Please check your details."
        );
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available dates for rescheduling
  const fetchRescheduleDates = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      const dates = [];
      const today = new Date();
      for (let i = 3; i <= 30; i++) {
        // Start from 3 days ahead
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        if (date.getDay() !== 0) {
          // Exclude Sundays
          dates.push(date.toISOString().split("T")[0]);
        }
      }
      setAvailableDates(dates);
      setLoading(false);
    }, 1000);
  };

  // Fetch available time slots
  const fetchTimeSlots = async (date) => {
    setLoading(true);
    setTimeout(() => {
      const slots = [];
      const baseSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

      // Mock dosha-based filtering
      const doshaOptimalTimes = {
        vata: ["10:30", "12:00", "14:00"],
        pitta: ["09:00", "17:00"],
        kapha: ["09:00", "10:30", "15:30"],
      };

      const optimalSlots =
        doshaOptimalTimes[appointmentData.doshaType] || baseSlots;

      optimalSlots.forEach((time) => {
        slots.push({
          time,
          available: Math.random() > 0.3,
          optimal: doshaOptimalTimes[appointmentData.doshaType]?.includes(time),
          therapyDuration: "90 minutes",
        });
      });

      setAvailableSlots(slots);
      setLoading(false);
    }, 1000);
  };

  // Handle reschedule submission
  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Submit reschedule request to backend
    setTimeout(() => {
      setStep(5);
      setLoading(false);
    }, 2000);
  };

  // Handle cancellation submission
  const handleCancel = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Submit cancellation request to backend
    setTimeout(() => {
      setStep(5);
      setLoading(false);
    }, 2000);
  };

  // Check if action is still possible
  const canPerformAction = (actionType, appointment) => {
    if (!appointment) return false;

    const today = new Date().toISOString().split("T")[0];
    const deadline =
      actionType === "reschedule"
        ? appointment.rescheduleDeadline
        : appointment.cancellationDeadline;

    return today <= deadline;
  };

  const getDaysUntilAppointment = (appointmentDate) => {
    const today = new Date();
    const appointment = new Date(appointmentDate);
    const diffTime = appointment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Manage Your Panchakarma Appointment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reschedule or cancel your existing appointment with ease
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 5 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-sm text-gray-600">
                {step === 1 && "Search Appointment"}
                {step === 2 && "Appointment Details"}
                {step === 3 && "Select Action"}
                {step === 4 && action === "reschedule" && "Reschedule"}
                {step === 4 && action === "cancel" && "Cancel"}
                {step === 5 && "Confirmation"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Step 1: Search Appointment */}
            {step === 1 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MagnifyingGlassIcon className="w-6 h-6 mr-3 text-blue-600" />
                  Find Your Appointment
                </h2>
                <p className="text-gray-600 mb-8">
                  Enter any one of the following details to locate your
                  appointment
                </p>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking ID
                      </label>
                      <input
                        type="text"
                        value={searchData.bookingId}
                        onChange={(e) =>
                          setSearchData((prev) => ({
                            ...prev,
                            bookingId: e.target.value,
                          }))
                        }
                        placeholder="PCK-1726308000000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient ID
                      </label>
                      <input
                        type="text"
                        value={searchData.patientId}
                        onChange={(e) =>
                          setSearchData((prev) => ({
                            ...prev,
                            patientId: e.target.value,
                          }))
                        }
                        placeholder="AYR-2024-001"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={searchData.mobileNumber}
                        onChange={(e) =>
                          setSearchData((prev) => ({
                            ...prev,
                            mobileNumber: e.target.value,
                          }))
                        }
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={searchData.aadharNumber}
                        onChange={(e) =>
                          setSearchData((prev) => ({
                            ...prev,
                            aadharNumber: e.target.value,
                          }))
                        }
                        placeholder="1234-5678-9012"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      !searchData.bookingId &&
                      !searchData.patientId &&
                      !searchData.mobileNumber &&
                      !searchData.aadharNumber
                    }
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                        Find Appointment
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Appointment Details */}
            {step === 2 && appointmentData && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Appointment Details
                </h2>

                {/* Status Banner */}
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center ${
                    appointmentData.status === "confirmed"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-yellow-50 border border-yellow-200 text-yellow-800"
                  }`}
                >
                  {appointmentData.status === "confirmed" ? (
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  )}
                  <span className="font-semibold">
                    Status:{" "}
                    {appointment?.therapy_type
                      ? appointment.therapy_type.charAt(0).toUpperCase() +
                        appointment.therapy_type.slice(1)
                      : "N/A"}
                  </span>
                  <span className="ml-4 text-sm">
                    {getDaysUntilAppointment(appointmentData.currentDate)} days
                    until appointment
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Patient Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Patient Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 text-sm">
                          Booking ID:
                        </span>
                        <p className="font-mono font-semibold">
                          {appointmentData.bookingId}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">
                          Patient Name:
                        </span>
                        <p className="font-semibold">
                          {appointmentData.patientId}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Mobile:</span>
                        <p className="font-semibold">
                          {appointmentData.mobileNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Appointment Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                        <div>
                          <span className="text-gray-600 text-sm">Date:</span>
                          <p className="font-semibold">
                            {new Date(
                              appointmentData.currentDate
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
                        <div>
                          <span className="text-gray-600 text-sm">Time:</span>
                          <p className="font-semibold">
                            {appointmentData.currentTime}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">
                          Treatment:
                        </span>
                        <p className="font-semibold">
                          {appointmentData.treatment.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointmentData.treatment.duration}
                        </p>
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
                        src={appointmentData.doctor.avatar}
                        alt={appointmentData.doctor.id}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">
                          {appointmentData.doctor.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointmentData.doctor.specialization}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Treatment Center
                    </h3>
                    <p className="font-semibold">{appointmentData.center.id}</p>
                    <p className="text-sm text-gray-600">
                      {appointmentData.center.address}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Proceed to Modify
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Action Selection */}
            {step === 3 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  What would you like to do?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reschedule Option */}
                  <div
                    onClick={() => {
                      if (canPerformAction("reschedule", appointmentData)) {
                        setAction("reschedule");
                        setStep(4);
                        fetchRescheduleDates();
                      }
                    }}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      canPerformAction("reschedule", appointmentData)
                        ? "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                        : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <ArrowPathIcon
                        className={`w-8 h-8 mr-3 ${
                          canPerformAction("reschedule", appointmentData)
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Reschedule Appointment
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Change your appointment date and time while keeping the
                      same doctor and treatment.
                    </p>
                    {canPerformAction("reschedule", appointmentData) ? (
                      <div className="text-sm text-green-600">
                        ✓ Available until{" "}
                        {new Date(
                          appointmentData.rescheduleDeadline
                        ).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        ✗ Reschedule deadline passed (
                        {new Date(
                          appointmentData.rescheduleDeadline
                        ).toLocaleDateString()}
                        )
                      </div>
                    )}
                  </div>

                  {/* Cancel Option */}
                  <div
                    onClick={() => {
                      if (canPerformAction("cancel", appointmentData)) {
                        setAction("cancel");
                        setStep(4);
                      }
                    }}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      canPerformAction("cancel", appointmentData)
                        ? "border-red-300 hover:border-red-500 hover:bg-red-50"
                        : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <XCircleIcon
                        className={`w-8 h-8 mr-3 ${
                          canPerformAction("cancel", appointmentData)
                            ? "text-red-600"
                            : "text-gray-400"
                        }`}
                      />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Cancel Appointment
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Cancel your appointment completely. This action cannot be
                      undone.
                    </p>
                    {canPerformAction("cancel", appointmentData) ? (
                      <div className="text-sm text-green-600">
                        ✓ Available until{" "}
                        {new Date(
                          appointmentData.cancellationDeadline
                        ).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        ✗ Cancellation deadline passed (
                        {new Date(
                          appointmentData.cancellationDeadline
                        ).toLocaleDateString()}
                        )
                      </div>
                    )}
                  </div>
                </div>

                {/* Policy Information */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-1 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-2">
                        Important Policy Information:
                      </p>
                      <ul className="space-y-1">
                        <li>
                          • Reschedule: Available up to 2 days before
                          appointment
                        </li>
                        <li>
                          • Cancellation: Available up to 1 day before
                          appointment
                        </li>
                        <li>• Same-day changes may incur additional charges</li>
                        <li>
                          • Emergency cancellations are handled case-by-case
                        </li>
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
            {step === 4 && action === "reschedule" && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <ArrowPathIcon className="w-6 h-6 mr-3 text-blue-600" />
                  Reschedule Appointment
                </h2>

                <form onSubmit={handleReschedule} className="space-y-8">
                  {/* Current Appointment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Current Appointment
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(
                          appointmentData.currentDate
                        ).toLocaleDateString()}
                      </span>
                      <ClockIcon className="w-4 h-4 ml-4 mr-1" />
                      <span>{appointmentData.currentTime}</span>
                    </div>
                  </div>

                  {/* New Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select New Date <span className="text-red-500">*</span>
                    </label>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading available dates...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                        {availableDates.map((date) => {
                          const dateObj = new Date(date);
                          const dayName = dateObj.toLocaleDateString("en-US", {
                            weekday: "short",
                          });
                          const dayNumber = dateObj.getDate();
                          const monthName = dateObj.toLocaleDateString(
                            "en-US",
                            { month: "short" }
                          );

                          return (
                            <div
                              key={date}
                              onClick={() => {
                                setRescheduleData((prev) => ({
                                  ...prev,
                                  newDate: date,
                                }));
                                fetchTimeSlots(date);
                              }}
                              className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                rescheduleData.newDate === date
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="text-xs text-gray-500">
                                {dayName}
                              </div>
                              <div className="text-lg font-semibold">
                                {dayNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {monthName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* New Time Selection */}
                  {rescheduleData.newDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Select New Time Slot{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-3">Loading time slots...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableSlots.map((slot) => (
                            <div
                              key={slot.time}
                              onClick={() =>
                                slot.available &&
                                setRescheduleData((prev) => ({
                                  ...prev,
                                  newTimeSlot: slot,
                                }))
                              }
                              className={`p-4 border-2 rounded-lg transition-all ${
                                !slot.available
                                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                                  : rescheduleData.newTimeSlot?.time ===
                                    slot.time
                                  ? "border-blue-500 bg-blue-50 cursor-pointer"
                                  : slot.optimal
                                  ? "border-green-300 bg-green-25 cursor-pointer hover:border-green-400"
                                  : "border-gray-200 cursor-pointer hover:border-blue-300"
                              }`}
                            >
                              <div className="font-semibold text-gray-800 flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {slot.time}
                              </div>
                              <div className="text-xs text-gray-500">
                                {slot.therapyDuration}
                              </div>
                              {slot.optimal && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
                                  Optimal
                                </span>
                              )}
                              {!slot.available && (
                                <div className="text-xs text-red-500 mt-1">
                                  Unavailable
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reschedule Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rescheduling{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rescheduleData.reason}
                      onChange={(e) =>
                        setRescheduleData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select reason...</option>
                      {rescheduleReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={rescheduleData.preferences}
                      onChange={(e) =>
                        setRescheduleData((prev) => ({
                          ...prev,
                          preferences: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Any additional information or special requests..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      disabled={
                        !rescheduleData.newDate ||
                        !rescheduleData.newTimeSlot ||
                        !rescheduleData.reason ||
                        loading
                      }
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Confirm Reschedule"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 4b: Cancel Form */}
            {step === 4 && action === "cancel" && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <XCircleIcon className="w-6 h-6 mr-3 text-red-600" />
                  Cancel Appointment
                </h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">
                        Important Notice
                      </h3>
                      <p className="text-sm text-red-700">
                        This action will permanently cancel your appointment.
                        Please ensure this is what you want to do.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCancel} className="space-y-6">
                  {/* Appointment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Appointment to Cancel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-semibold">
                          {new Date(
                            appointmentData.currentDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-semibold">
                          {appointmentData.currentTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Doctor:</span>
                        <p className="font-semibold">
                          {appointmentData.doctor.id}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Treatment:</span>
                        <p className="font-semibold">
                          {appointmentData.treatment.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Cancellation{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cancelData.reason}
                      onChange={(e) =>
                        setCancelData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select reason...</option>
                      {cancelReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Feedback
                    </label>
                    <textarea
                      value={cancelData.feedback}
                      onChange={(e) =>
                        setCancelData((prev) => ({
                          ...prev,
                          feedback: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Please share any feedback to help us improve our service..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      disabled={!cancelData.reason || loading}
                      className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Confirm Cancellation"
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
                  {action === "reschedule" ? (
                    <>
                      <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-green-800 mb-4">
                        Appointment Rescheduled!
                      </h2>
                      <p className="text-lg text-gray-600 mb-8">
                        Your appointment has been successfully rescheduled.
                      </p>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                        <h3 className="font-semibold text-green-800 mb-4">
                          New Appointment Details
                        </h3>
                        <div className="text-left space-y-2">
                          <p>
                            <span className="text-gray-600">New Date:</span>{" "}
                            <span className="font-semibold">
                              {new Date(
                                rescheduleData.newDate
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">New Time:</span>{" "}
                            <span className="font-semibold">
                              {rescheduleData.newTimeSlot?.time}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Doctor:</span>{" "}
                            <span className="font-semibold">
                              {appointmentData.doctor.id}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Treatment:</span>{" "}
                            <span className="font-semibold">
                              {appointmentData.treatment.name}
                            </span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-20 h-20 text-red-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-red-800 mb-4">
                        Appointment Cancelled
                      </h2>
                      <p className="text-lg text-gray-600 mb-8">
                        Your appointment has been cancelled successfully.
                      </p>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                        <h3 className="font-semibold text-red-800 mb-4">
                          Cancelled Appointment
                        </h3>
                        <div className="text-left space-y-2">
                          <p>
                            <span className="text-gray-600">
                              Original Date:
                            </span>{" "}
                            <span className="font-semibold">
                              {new Date(
                                appointmentData.currentDate
                              ).toLocaleDateString()}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">
                              Original Time:
                            </span>{" "}
                            <span className="font-semibold">
                              {appointmentData.currentTime}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Booking ID:</span>{" "}
                            <span className="font-mono font-semibold">
                              {appointmentData.bookingId}
                            </span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {action === "reschedule"
                      ? "A confirmation SMS will be sent to your registered mobile number."
                      : "A cancellation confirmation has been sent to your registered mobile number."}
                  </p>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 flex items-center"
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Print Confirmation
                    </button>

                    <button
                      onClick={() => {
                        setStep(1);
                        setAction("");
                        setAppointmentData(null);
                        setSearchData({
                          bookingId: "",
                          patientId: "",
                          mobileNumber: "",
                          aadharNumber: "",
                        });
                        setRescheduleData({
                          newDate: "",
                          newTimeSlot: null,
                          reason: "",
                          preferences: "",
                        });
                        setCancelData({ reason: "", feedback: "" });
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Manage Another Appointment
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

export default PanchakarmaReschedule;
