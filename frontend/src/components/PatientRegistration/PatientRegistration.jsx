import React, { useState, useEffect } from "react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other", "Prefer not to say"];

const PatientRegistration = ({ generatedPatientId }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    age: "",
    mobNumber: "",
    email: "",
    aadharNumber: "",
    bloodGroup: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    allergies: "",
    medicalHistory: "",
  });

  // Auto-calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prev) => ({ ...prev, age: age >= 0 ? age : "" }));
    } else {
      setFormData((prev) => ({ ...prev, age: "" }));
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Patient registered successfully!\n\n" + JSON.stringify(formData, null, 2));
    // TODO: Replace with actual backend integration
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-green-700 mb-8">Patient Registration</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Patient ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
          <input
            type="text"
            name="patientId"
            value={generatedPatientId || "Generating..."}
            readOnly
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="John"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name<span className="text-red-500">*</span>
            </label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Gender, DOB & Age */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender<span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              readOnly
              placeholder="Auto"
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Contact Info & Aadhar Number & Blood Group */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number<span className="text-red-500">*</span>
            </label>
            <input
              name="mobNumber"
              type="tel"
              value={formData.mobNumber}
              onChange={handleChange}
              required
              pattern="^\+?[0-9]{10,15}$"
              placeholder="+919876543210"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Number<span className="text-red-500">*</span>
            </label>
            <input
              name="aadharNumber"
              type="text"
              value={formData.aadharNumber}
              onChange={handleChange}
              required
              placeholder="1234 5678 9012"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={14}
            />
          </div>
        </div>

        {/* Blood Group */}
        <div className="mb-6 md:mb-0 md:grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="Full address, city, state, ZIP"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
            <input
              name="emergencyContactName"
              type="text"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
            <input
              name="emergencyContactNumber"
              type="tel"
              value={formData.emergencyContactNumber}
              onChange={handleChange}
              placeholder="+919876543210"
              pattern="^\+?[0-9]{10,15}$"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows={2}
            placeholder="List any allergies"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Medical History */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows={3}
            placeholder="Brief medical history"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-4 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-emerald-700 transition"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
