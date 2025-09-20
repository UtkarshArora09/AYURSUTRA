import React, { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

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

  // Check password strength
  useEffect(() => {
    const { password } = formData;
    if (!password) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        setPasswordStrength("Very Weak");
        break;
      case 2:
        setPasswordStrength("Weak");
        break;
      case 3:
        setPasswordStrength("Fair");
        break;
      case 4:
        setPasswordStrength("Good");
        break;
      case 5:
        setPasswordStrength("Strong");
        break;
      default:
        setPasswordStrength("");
    }
  }, [formData.password]);

  // Check password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case "Very Weak":
        return "text-red-600";
      case "Weak":
        return "text-red-500";
      case "Fair":
        return "text-yellow-500";
      case "Good":
        return "text-blue-500";
      case "Strong":
        return "text-green-600";
      default:
        return "";
    }
  };

  const getPasswordStrengthBg = (strength) => {
    switch (strength) {
      case "Very Weak":
        return "bg-red-100 border-red-200";
      case "Weak":
        return "bg-red-50 border-red-200";
      case "Fair":
        return "bg-yellow-50 border-yellow-200";
      case "Good":
        return "bg-blue-50 border-blue-200";
      case "Strong":
        return "bg-green-50 border-green-200";
      default:
        return "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (passwordStrength === "Very Weak" || passwordStrength === "Weak") {
      alert("Please choose a stronger password!");
      return;
    }

    const { confirmPassword, ...registrationData } = formData;

    registrationData.patientId =
      generatedPatientId ||
      "AYR-2024-" +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");

    fetch("https://ayursutra-qhp0.onrender.com/api/patients/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    })
      .then(async (response) => {
        const data = await response.json(); // parse json once
        if (!response.ok) {
          // If not ok, throw error with message from backend
          throw new Error(data.message || "Network response was not ok");
        }
        return data; // return data for next then()
      })
      .then((data) => {
        alert(data.message || "Patient registered successfully!");
        setFormData({
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
          password: "",
          confirmPassword: "",
        });
      })
      .catch((error) => {
        console.error("There was a problem with the registration:", error);
        alert(error.message || "Failed to register patient. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-green-900 mb-2">
          Patient Registration
        </h2>
        <p className="text-gray-600 mb-8">
          All fields are mandatory and must be filled to complete registration
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
         

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Gender, DOB & Age */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Gender</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                readOnly
                required
                placeholder="Auto-calculated"
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Contact Info & Aadhar Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                name="mobNumber"
                type="tel"
                value={formData.mobNumber}
                onChange={handleChange}
                required
                pattern="^\+?[0-9]{10,15}$"
                placeholder="+919876543210"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhar Number <span className="text-red-500">*</span>
              </label>
              <input
                name="aadharNumber"
                type="text"
                value={formData.aadharNumber}
                onChange={handleChange}
                required
                placeholder="1234 5678 9012"
                pattern="[0-9\s]{12,14}"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                maxLength={14}
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Account Security
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Enter a strong password"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div
                    className={`mt-2 p-2 rounded border ${getPasswordStrengthBg(
                      passwordStrength
                    )}`}
                  >
                    <p
                      className={`text-xs font-medium ${getPasswordStrengthColor(
                        passwordStrength
                      )}`}
                    >
                      Password Strength: {passwordStrength}
                    </p>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li
                      className={
                        formData.password.length >= 8 ? "text-green-600" : ""
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        /[a-z]/.test(formData.password) ? "text-green-600" : ""
                      }
                    >
                      Lowercase letter
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                      }
                    >
                      Uppercase letter
                    </li>
                    <li
                      className={
                        /[0-9]/.test(formData.password) ? "text-green-600" : ""
                      }
                    >
                      Number
                    </li>
                    <li
                      className={
                        /[^A-Za-z0-9]/.test(formData.password)
                          ? "text-green-600"
                          : ""
                      }
                    >
                      Special character
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                    className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      !passwordMatch ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div
                    className={`mt-2 p-2 rounded border ${
                      passwordMatch
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        passwordMatch ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {passwordMatch
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blood Group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Full address, city, state, ZIP"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                name="emergencyContactName"
                type="text"
                value={formData.emergencyContactName}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                name="emergencyContactNumber"
                type="tel"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                required
                placeholder="+919876543210"
                pattern="^\+?[0-9]{10,15}$"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies <span className="text-red-500">*</span>
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              required
              rows={2}
              placeholder="List any allergies (write 'None' if no allergies)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Medical History */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical History <span className="text-red-500">*</span>
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Brief medical history (write 'None' if no significant medical history)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={
                !passwordMatch ||
                passwordStrength === "Very Weak" ||
                passwordStrength === "Weak"
              }
              className="w-full py-4 text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Register Patient
            </button>
          </div>

          {/* Required Fields Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <span className="text-red-500">*</span> All fields are mandatory
              and must be completed for successful registration.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Your password will be used to log into your patient account.
              Please keep it secure.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
