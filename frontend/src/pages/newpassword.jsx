import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token and email from URL parameters
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState("idle"); // idle, success, error, invalid_token
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(null); // null, true, false

  // Verify token validity on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setErrorMessage(
          "Invalid reset link. Please request a new password reset."
        );
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setErrorMessage(
            data.message || "This reset link has expired or is invalid."
          );
        }
      } catch (error) {
        setTokenValid(false);
        setErrorMessage("Unable to verify reset link. Please try again later.");
      }
    };

    verifyToken();
  }, [token, email]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (passwordStrength === "Very Weak" || passwordStrength === "Weak") {
      setErrorMessage("Please choose a stronger password!");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          newPassword: formData.password, // 👈 make sure it's newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetStatus("success");
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password reset successful. Please log in with your new password.",
            },
          });
        }, 3000);
      } else {
        setResetStatus("error");
        setErrorMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setResetStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Loading state while verifying token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <Header />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">
              Verifying reset link...
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we validate your request.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white">
        <Header />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 inline-block"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/"
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors duration-300 inline-block"
              >
                <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success state
  if (resetStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
        <Header />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You will be
              redirected to the login page shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Email:</strong> {email}
              </p>
            </div>
            <Link
              to="/login"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <KeyIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600">Enter your new password below</p>

            {email && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Account:</strong> {email}
                </p>
              </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Enter your new password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your new password"
                  className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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

            {/* Password Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must contain:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li
                  className={
                    formData.password.length >= 8 ? "text-green-600" : ""
                  }
                >
                  • At least 8 characters
                </li>
                <li
                  className={
                    /[a-z]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  • One lowercase letter
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  • One uppercase letter
                </li>
                <li
                  className={
                    /[0-9]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  • One number
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(formData.password)
                      ? "text-green-600"
                      : ""
                  }
                >
                  • One special character
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                !passwordMatch ||
                passwordStrength === "Very Weak" ||
                passwordStrength === "Weak" ||
                isSubmitting
              }
              className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300"
              >
                <ArrowLeftIcon className="w-4 h-4 inline mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;
