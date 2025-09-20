
import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppointmentReceipt from "../components/AppointmentReceipt";
import AyurVaidya from "../components/AyurSutraBot"; // Import Sahayak chatbot

const PanchakarmaBooking = () => {
  // Patient data (auto-fetched from backend/database)
  const [patientData, setPatientData] = useState({
    patientId: "",
    name: "",
    aadharNumber: "",
  });
  // Form states
  const [formData, setFormData] = useState({
    mobileNumber: "",
    selectedDoctor: null,
    selectedCenter: null,
    selectedDate: "",
    selectedTimeSlot: null,
    doshaType: "",
    symptoms: "",
    preferences: "",
  });

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [centers, setCenters] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [recommendedTreatment, setRecommendedTreatment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Booking confirmation data
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Mock data - Replace with actual API calls
  const doctorAvatars = {
    1: "https://randomuser.me/api/portraits/women/45.jpg", // Dr. Priya Sharma
    2: "https://randomuser.me/api/portraits/men/35.jpg", // Dr. Rajesh Kumar
    3: "https://randomuser.me/api/portraits/women/32.jpg", // Dr. Meera Patel
  };

  useEffect(() => {
    fetchPatientData();
    fetchDoctors();
    setCenters(mockCenters);
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("https://ayursutra-qhp0.onrender.com/api/doctors");
      if (!res.ok) throw new Error("Failed to fetch doctors");
      const data = await res.json();

      // Attach avatars to doctors
      const doctorsWithAvatars = data.map((doc) => ({
        ...doc,
        avatar: doctorAvatars[doc.id] || "https://via.placeholder.com/100",
      }));

      setDoctors(doctorsWithAvatars);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const mockCenters = [
    {
      id: 1,
      name: "AyurSutra Wellness Center - Mumbai",
      address: "Bandra West, Mumbai, Maharashtra",
      facilities: ["Panchakarma Suite", "Meditation Room", "Herbal Garden"],
      rating: 4.6,
    },
    {
      id: 2,
      name: "Vedic Healing Center - Pune",
      address: "Koregaon Park, Pune, Maharashtra",
      facilities: [
        "Traditional Therapy Rooms",
        "Yoga Studio",
        "Organic Kitchen",
      ],
      rating: 4.8,
    },
    {
      id: 3,
      name: "Holistic Ayurveda Clinic - Delhi",
      address: "Greater Kailash, New Delhi",
      facilities: [
        "Modern Equipment",
        "Expert Therapists",
        "Consultation Rooms",
      ],
      rating: 4.5,
    },
  ];

  const doshaTypes = [
    { id: "vata", name: "Vata", description: "Air & Space elements" },
    { id: "pitta", name: "Pitta", description: "Fire & Water elements" },
    { id: "kapha", name: "Kapha", description: "Earth & Water elements" },
    {
      id: "mixed",
      name: "Mixed Constitution",
      description: "Combination of doshas",
    },
  ];

  // Fetch patient data on component mount
  useEffect(() => {
    fetchPatientData();
    setCenters(mockCenters);
  }, []);

  // Effect to load dates when step changes to 3
  useEffect(() => {
    if (
      step === 3 &&
      formData.selectedDoctor &&
      formData.selectedCenter &&
      availableDates.length === 0
    ) {
      fetchAvailableDates(
        formData.selectedDoctor.id,
        formData.selectedCenter.id
      );
    }
  }, [step, formData.selectedDoctor, formData.selectedCenter]);

  const fetchPatientData = async () => {
    // TODO: Replace with actual API call
  };

  const fetchAvailableDates = async (doctorId, centerId) => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      const dates = [];
      const today = new Date();
      for (let i = 1; i <= 30; i++) {
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

  const fetchTimeSlots = async (date, doctorId, centerId, doshaType) => {
    setLoading(true);
    // TODO: Replace with actual dosha-based scheduling API
    setTimeout(() => {
      const slots = [];
      const baseSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

      // Mock dosha-based filtering
      const doshaOptimalTimes = {
        vata: ["10:30", "12:00", "14:00"],
        pitta: ["09:00", "17:00"],
        kapha: ["09:00", "10:30", "15:30"],
        mixed: baseSlots,
      };

      const optimalSlots = doshaOptimalTimes[doshaType] || baseSlots;

      optimalSlots.forEach((time) => {
        slots.push({
          time,
          available: Math.random() > 0.3, // 70% availability
          optimal: doshaOptimalTimes[doshaType]?.includes(time),
          therapyDuration: "90 minutes",
        });
      });

      setAvailableSlots(slots);

      // Generate treatment recommendation
      setRecommendedTreatment({
        therapy: getRecommendedTherapy(doshaType),
        duration: "7-14 days",
        sessions: "3-5 sessions",
        preparationDays: "2-3 days",
      });

      setLoading(false);
    }, 1000);
  };

  const getRecommendedTherapy = (dosha) => {
    const recommendations = {
      vata: {
        name: "Basti (Medicated Enema)",
        description: "Balances Vata dosha and strengthens nervous system",
      },
      pitta: {
        name: "Virechana (Purgation)",
        description: "Cleanses liver and balances Pitta dosha",
      },
      kapha: {
        name: "Vamana (Therapeutic Vomiting)",
        description: "Removes excess Kapha and respiratory toxins",
      },
      mixed: {
        name: "Comprehensive Panchakarma",
        description: "Customized multi-therapy approach",
      },
    };
    return recommendations[dosha] || recommendations.mixed;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Trigger availability fetch when doctor, center, or dosha changes
    if (field === "selectedDoctor" || field === "selectedCenter") {
      const doctorId =
        field === "selectedDoctor" ? value.id : formData.selectedDoctor?.id;
      const centerId =
        field === "selectedCenter" ? value.id : formData.selectedCenter?.id;

      if (doctorId && centerId) {
        fetchAvailableDates(doctorId, centerId);
      }
    }

    if (field === "selectedDate" && formData.doshaType) {
      fetchTimeSlots(
        value,
        formData.selectedDoctor.id,
        formData.selectedCenter.id,
        formData.doshaType
      );
    }

    if (field === "doshaType" && formData.selectedDate) {
      fetchTimeSlots(
        formData.selectedDate,
        formData.selectedDoctor.id,
        formData.selectedCenter.id,
        value
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        patient_id: patientData.id, // integer from DB (e.g. 1, 2, 3)
        patient_code: patientData.patientId, // string code ("AYR-2024-001")
        therapy_type: recommendedTreatment?.therapy?.name || "Vamana",
        scheduled_date: formData.selectedDate,
        scheduled_time: formData.selectedTimeSlot?.time,
        doctor_id: formData.selectedDoctor?.id, // integer
        doctor_code: formData.selectedDoctor?.code, // e.g. "Ayur_doc2"
        status: "Pending",
        dosha_type: formData.doshaType || "Vata",
      };

      console.log("Submitting booking:", bookingData);

      const response = await fetch("https://ayursutra-qhp0.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create booking. Status: ${response.status}`);
      }

      const data = await response.json();
      setConfirmedBookingData(data); // show receipt with DB response
      setStep(4);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Receipt handlers
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  // Function to move to next step with validation
  const goToStep3 = () => {
    if (formData.selectedDoctor && formData.selectedCenter) {
      setStep(3);
      // Trigger date fetch if not already loaded
      if (availableDates.length === 0) {
        fetchAvailableDates(
          formData.selectedDoctor.id,
          formData.selectedCenter.id
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-900 mb-4">
              Panchakarma Appointment Booking
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Book your personalized Panchakarma therapy session with our expert
              practitioners
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= stepNumber
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      step >= stepNumber ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {stepNumber === 1 && "Patient Info"}
                    {stepNumber === 2 && "Selection"}
                    {stepNumber === 3 && "Schedule"}
                    {stepNumber === 4 && "Confirmation"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Step 1: Patient Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Patient Information
                </h2>

                {/* Auto-fetched readonly fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient ID
                    </label>
                    <input
                      type="number"
                      value={patientData.patientId}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          patientId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={patientData.name}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Number
                    </label>
                    <input
                      type="number"
                      value={patientData.aadharNumber}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          aadharNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* Editable mobile number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      handleInputChange("mobileNumber", e.target.value)
                    }
                    required
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Dosha Assessment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Dosha Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {doshaTypes.map((dosha) => (
                      <div
                        key={dosha.id}
                        onClick={() => handleInputChange("doshaType", dosha.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.doshaType === dosha.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <h3 className="font-semibold text-gray-800">
                          {dosha.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {dosha.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.mobileNumber || !formData.doshaType}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Doctor and Center Selection */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Select Doctor & Center
                </h2>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose Your Doctor <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() =>
                          handleInputChange("selectedDoctor", doctor)
                        }
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.selectedDoctor?.id === doctor.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={doctor.avatar}
                            alt={doctor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-green-600">
                              {doctor.specialization}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doctor.experience} • ⭐ {doctor.rating}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose Treatment Center{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    {centers.map((center) => (
                      <div
                        key={center.id}
                        onClick={() =>
                          handleInputChange("selectedCenter", center)
                        }
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.selectedCenter?.id === center.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 flex items-center">
                              <BuildingOffice2Icon className="w-5 h-5 mr-2" />
                              {center.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {center.address}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {center.facilities.map((facility) => (
                                <span
                                  key={facility}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              ⭐ {center.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={goToStep3}
                    disabled={
                      !formData.selectedDoctor || !formData.selectedCenter
                    }
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date and Time Selection */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Schedule Your Session
                </h2>

                {/* Recommended Treatment */}
                {recommendedTreatment && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="w-6 h-6 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-800">
                          Recommended for your Dosha
                        </h3>
                        <p className="text-green-700 mt-1">
                          <span className="font-medium">
                            {recommendedTreatment.therapy.name}
                          </span>{" "}
                          - {recommendedTreatment.therapy.description}
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Duration: {recommendedTreatment.duration} • Sessions:{" "}
                          {recommendedTreatment.sessions}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Date <span className="text-red-500">*</span>
                  </label>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-gray-600">
                        Loading available dates...
                      </span>
                    </div>
                  ) : availableDates.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3">
                      {availableDates.map((date) => {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                        });
                        const dayNumber = dateObj.getDate();
                        const monthName = dateObj.toLocaleDateString("en-US", {
                          month: "short",
                        });

                        return (
                          <div
                            key={date}
                            onClick={() =>
                              handleInputChange("selectedDate", date)
                            }
                            className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                              formData.selectedDate === date
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-green-300"
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
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Loading dates or no available dates found.
                      </p>
                    </div>
                  )}
                </div>

                {/* Time Slot Selection */}
                {formData.selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Time Slot <span className="text-red-500">*</span>
                    </label>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600">
                          Finding optimal time slots...
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => (
                          <div
                            key={slot.time}
                            onClick={() =>
                              slot.available &&
                              handleInputChange("selectedTimeSlot", slot)
                            }
                            className={`p-4 border-2 rounded-lg transition-all ${
                              !slot.available
                                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                                : formData.selectedTimeSlot?.time === slot.time
                                ? "border-green-500 bg-green-50 cursor-pointer"
                                : slot.optimal
                                ? "border-green-300 bg-green-25 cursor-pointer hover:border-green-400"
                                : "border-gray-200 cursor-pointer hover:border-green-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-800 flex items-center">
                                  <ClockIcon className="w-4 h-4 mr-1" />
                                  {slot.time}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {slot.therapyDuration}
                                </div>
                              </div>
                              {slot.optimal && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Optimal
                                </span>
                              )}
                            </div>
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

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms or Health Concerns
                    </label>
                    <textarea
                      value={formData.symptoms}
                      onChange={(e) =>
                        handleInputChange("symptoms", e.target.value)
                      }
                      rows={3}
                      placeholder="Please describe your current symptoms or health concerns..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Preferences or Requirements
                    </label>
                    <textarea
                      value={formData.preferences}
                      onChange={(e) =>
                        handleInputChange("preferences", e.target.value)
                      }
                      rows={2}
                      placeholder="Any dietary restrictions, allergies, or special requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !formData.selectedDate ||
                      !formData.selectedTimeSlot ||
                      loading
                    }
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation with Receipt */}
            {step === 4 && confirmedBookingData && (
              <AppointmentReceipt
                bookingData={confirmedBookingData}
                onPrint={handlePrint}
                onDownload={handleDownload}
              />
            )}
          </form>
        </div>
      </div>

      <Footer />

      {/* Sahayak Chatbot - Floating Assistant */}
      <AyurVaidya />
    </div>
  );
};

export default PanchakarmaBooking;
