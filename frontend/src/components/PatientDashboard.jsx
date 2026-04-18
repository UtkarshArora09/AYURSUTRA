import React, { useEffect, useState } from "react";
import {
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarIcon,
  HomeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Droplet } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch("https://ayursutra-tox3.onrender.com/api/patients/19");
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }
        const data = await response.json();
        setPatient(data); // use backend response directly
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50">
        <p className="text-lg font-medium text-gray-700">
          Loading patient data...
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50">
        <ExclamationCircleIcon className="h-12 w-12 text-red-400 mb-6" />
        <span className="text-xl text-gray-700">No patient data found.</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-10 h-10 bg-blue-50 rounded-lg shadow-md"></div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}

          <header className="rounded-xl bg-white shadow-lg px-8 py-6 mb-10 flex items-center space-x-4">
            <UserIcon className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-900">
                Welcome, {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-sm text-gray-500">
                Patient ID: {patient.patient_id}
              </p>
            </div>
          </header>

          {/* Info sections */}
          <section className="grid grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-bold text-blue-700 mb-4">
                Personal Details
              </h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center">
                  <IdentificationIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Gender: {patient.gender}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-1 text-gray-400" />
                  DOB: {patient.dob}
                </div>
                <div className="flex items-center">
                  <Droplet className="w-5 h-5 mr-1 text-gray-400" />
                  Blood Group: {patient.blood_group}
                </div>
                <div className="flex items-center">
                  <HomeIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Address: {patient.address || "N/A"}
                </div>
                <div className="flex items-center">
                  <IdentificationIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Aadhar: {patient.aadhar_number}
                </div>
              </div>
            </div>

            {/* Contact & Emergency */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-bold text-blue-700 mb-4">
                Contact & Emergency
              </h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Mobile: {patient.mob_number}
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Email: {patient.email}
                </div>
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Emergency Contact: {patient.emergency_contact_name}
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Emergency No: {patient.emergency_contact_number}
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
              <h2 className="text-lg font-bold text-blue-700 mb-4">
                Medical Info
              </h2>
              <div className="space-y-2 text-gray-700">
                <div>
                  <span className="font-medium text-indigo-900">
                    Allergies:
                  </span>
                  <div className="bg-blue-50 rounded p-2 mt-1 ml-2">
                    {patient.allergies || "No allergies listed."}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-indigo-900">
                    Medical History:
                  </span>
                  <div className="bg-blue-50 rounded p-2 mt-1 ml-2">
                    {patient.medical_history || "No medical history yet."}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Video Call Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() =>
                (window.location.href =
                  "https://videocall-6nuu.onrender.com/patient.html")
              }
              className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              Video Call
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PatientDashboard;
