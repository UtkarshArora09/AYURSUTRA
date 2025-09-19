import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ChevronDownIcon,
  UserIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

import PatientRegistration from "../../components/PatientRegistration/PatientRegistration";

const Header = () => {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // User data state
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem("ayursutra_user");
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        // verify fields
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.role &&
          parsed.email
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Error parsing saved user data:", err);
    }
    return null;
  });

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Login modal state
  const [loginRole, setLoginRole] = useState(null);
  const [showPatientReg, setShowPatientReg] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Appointment modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState(null);

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  // Check for existing login on component mount
  useEffect(() => {
    if (userData && userData.role) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [userData]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Disable body scroll when modal open
  useEffect(() => {
    if (showLoginModal || showAppointmentModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showLoginModal, showAppointmentModal]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest(".profile-dropdown")) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  // Generate user initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Get role-based background color for avatar
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "doctor":
        return "from-blue-500 to-blue-600";
      case "admin":
        return "from-purple-500 to-purple-600";
      case "patient":
        return "from-green-500 to-green-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Get role-based dashboard route
  const getDashboardName = (role) => {
    switch (role?.toLowerCase()) {
      case "doctor":
        return "Doctor Dashboard";
      case "admin":
        return "Admin Dashboard";
      case "patient":
        return "Patient Dashboard";
      default:
        return "Dashboard";
    }
  };

  // Get role-based dashboard name
  const getDashboardRoute = (role) => {
    switch (role?.toLowerCase()) {
      case "doctor":
        return "/doctor-dashboard";
      case "admin":
        return "/admin-dashboard";
      case "patient":
        return "/patient-dashboard";
      default:
        return "/dashboard";
    }
  };

  // Handle dashboard navigation based on user role
  const handleDashboardClick = () => {
    if (isLoggedIn && userData?.role) {
      navigate(getDashboardRoute(userData.role));
    } else {
      // If not logged in, redirect to general dashboard or show login
      navigate("/dashboard");
    }
  };

  // NEW: Handle patient registration navigation
  const handlePatientRegistration = () => {
    closeModal(); // Close the login modal
    navigate("/patients"); // Navigate to patient registration page
  };

  // Navigation items with conditional dashboard
  const getNavItems = () => {
    const dashboardName =
      isLoggedIn && userData?.role
        ? getDashboardName(userData.role)
        : "Dashboard";

    const baseItems = [
      { name: "Home", href: "/" },
      {
        name: "Patients",
        dropdown: [
          { name: "Register", href: "/patients", icon: "👤" },
          { name: "List", href: "/patients/list", icon: "📋" },
          { name: "Profiles", href: "/patients/profiles", icon: "👥" },
        ],
      },
      { name: "Therapies", href: "/therapies" },
      {
        name: "Appointments",
        dropdown: [
          {
            name: "Panchakarma",
            href: "#",
            action: () => openAppointmentModal("Panchakarma"),
          },
          {
            name: "General Appointment",
            href: "#",
            action: () => openAppointmentModal("General Appointment"),
          },
        ],
      },
      { name: "Queue", href: "/queue" },
      {
        name: dashboardName,
        href: "#",
        action: handleDashboardClick,
      },
      { name: "Reports", href: "/reports" },
    ];

    // Filter navigation items based on user role
    if (isLoggedIn && userData?.role) {
      const roleLower = userData.role.toLowerCase();
      if (roleLower === "patient") {
        // Patient sees limited navigation
        return baseItems.filter((item) =>
          ["Home", "Appointments", "Queue", dashboardName, "Reports"].includes(
            item.name
          )
        );
      } else if (roleLower === "doctor" || roleLower === "admin") {
        return baseItems;
      }
    }
    return baseItems;
  };

  const navItems = getNavItems();

  // Modal control functions
  const closeModal = () => {
    setShowLoginModal(false);
    setShowPatientReg(false);
    setShowForgotPassword(false);
    setLoginRole(null);
    setEmail("");
    setPassword("");
    setForgotEmail("");
    closeAppointmentModal();
  };

  const openAppointmentModal = (type) => {
    setSelectedAppointmentType(type);
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedAppointmentType(null);
  };

  // Navigate on appointment modal button clicks
  const handleAppointmentAction = (action) => {
    if (selectedAppointmentType === "Panchakarma") {
      if (action === "Booking") navigate("/appointments/panchakarma/booking");
      else if (action === "Reschedule/Cancel")
        navigate("/appointments/panchakarma/reschedule");
    } else if (selectedAppointmentType === "General Appointment") {
      if (action === "Booking") {
        // *CHANGED*: Redirect to external deployed URL
        window.location.href = "https://queuecare-backend.vercel.app/user.html";
        return; // Return early to prevent closing modal immediately
      } else if (action === "Reschedule/Cancel") {
        navigate("/queue/reschedule-cancel");
      }
    }
    closeAppointmentModal();
  };

  // Updated login handlers with user data storage
  const handlePatientLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email or password missing");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/patients/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Patient login failed");

      console.log("Login success:", data);

      // Build full name safely from first_name and last_name
      const fullName =
        (data.patient.first_name || "").trim() +
        " " +
        (data.patient.last_name || "").trim();

      // Construct user object for frontend
      const user = {
        ...data.patient,
        name: fullName,
      };

      // Save to localStorage
      localStorage.setItem("ayursutra_user", JSON.stringify(user));
      localStorage.setItem("auth_token", data.token);

      setUserData(user);
      setIsLoggedIn(true);

      alert(`Logged in as ${user.name} (${user.role})`);
      closeModal();
    } catch (err) {
      console.error("Patient login error:", err);
      alert("Login failed: " + err.message);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    if (!loginRole) {
      alert("Please select a role.");
      return;
    }

    const roleStr = loginRole || "";
    try {
      // Determine backend endpoint based on role
      let endpoint = "";
      if (roleStr.toLowerCase() === "doctor") {
        endpoint = "/api/doctors/auth/login";
      } else if (roleStr.toLowerCase() === "admin") {
        endpoint = "/api/admin/auth/login";
      } else if (roleStr.toLowerCase() === "patient") {
        endpoint = "/api/patients/auth/login";
      } else {
        throw new Error("Invalid role selected");
      }

      const baseURL = "http://localhost:5000"; // adjust if your backend URL is different

      // Make POST request to backend
      const response = await fetch(baseURL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Login failed");
      }

      const data = await response.json();

      // Safely construct full name
      const fullName =
        `${data.user?.first_name || data.user?.name || ""} ${
          data.user?.last_name || ""
        }`.trim() ||
        data.user?.email ||
        "User";

      // Ensure role is properly capitalized
      const userDataSafe = {
        ...data.user,
        name: fullName,
        role: data.user?.role
          ? data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)
          : roleStr.charAt(0).toUpperCase() + roleStr.slice(1),
      };

      // Save to localStorage
      localStorage.setItem("ayursutra_user", JSON.stringify(userDataSafe));
      localStorage.setItem("auth_token", data.token);

      // Update state
      setUserData(userDataSafe);

      alert(`Logged in as ${userDataSafe.name} (${userDataSafe.role})`);
      closeModal();
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/patients/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(data.message); // e.g., "Password reset link sent to your email"
      } else {
        alert(data.error || data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      alert("Failed to send reset link. Please try again later.");
    } finally {
      setShowForgotPassword(false);
      setForgotEmail("");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("ayursutra_user");
    localStorage.removeItem("auth_token");
    setUserData(null);
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    navigate("/");
    alert("Logged out successfully");
  };

  // Dropdown hover control
  const handleMouseEnter = (name) => setActiveDropdown(name);
  const handleMouseLeave = () => setActiveDropdown(null);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-green-100"
            : "bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            {/* <Link
              to="/"
              className="flex items-center space-x-3 cursor-pointer flex-shrink-0"
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <img
                    src="/assets/logo.jpg"
                    alt="AyurSutra Logo"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "inline";
                    }}
                  />
                  <span className="text-white font-bold text-lg hidden">
                    🕉️
                  </span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-0 group-hover:opacity-30"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  AyurSutra
                </h1>
                <p className="text-xs text-gray-600 -mt-1">
                  Ayurvedic Wellness Platform
                </p>
              </div>
            </Link> */}
            <Link
              to="/"
              className="flex items-center space-x-3 cursor-pointer flex-shrink-0"
            >
              <div className="relative">
                <div
                  className="
      w-8 h-8 sm:w-40 sm:h-40 lg:w-12 lg:h-12
      rounded-full
      bg-gradient-to-br from-white to-white
      flex items-center justify-center
      shadow-lg
      group-hover:shadow-xl
      transition-all duration-300
      group-hover:scale-105
    "
                >
                  <img
                    src="/assets/logo.jpg"
                    alt="AyurSutra Logo"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 rounded-full object-cover object-center"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "inline";
                    }}
                  />
                  <span className="text-white font-bold text-lg hidden">
                    🕉️
                  </span>
                </div>
                <div
                  className="
      absolute -inset-1
      bg-gradient-to-r from-white to-white
      rounded-full blur opacity-0 group-hover:opacity-30
    "
                ></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  AyurSutra
                </h1>
                <p className="text-xs text-gray-600 -mt-1">
                  Ayurvedic Wellness Platform
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-green-600 font-medium rounded-lg hover:bg-green-50 transition-all duration-300">
                      <span>{item.name}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ${
                        activeDropdown === item.name
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 translate-y-4 invisible"
                      }`}
                    >
                      <div className="p-2">
                        {item.dropdown.map((sub) =>
                          sub.action ? (
                            <button
                              key={sub.name}
                              onClick={(e) => {
                                e.preventDefault();
                                if (sub.action) sub.action();
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl flex items-center"
                            >
                              {sub.icon && (
                                <span className="mr-2 text-lg">{sub.icon}</span>
                              )}
                              <span>{sub.name}</span>
                            </button>
                          ) : (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              className="w-full px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl flex items-center"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {sub.icon && (
                                <span className="mr-2 text-lg">{sub.icon}</span>
                              )}
                              <span>{sub.name}</span>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : item.action ? (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className={`px-3 py-2 font-medium rounded-lg transition-all duration-300 ${
                      isLoggedIn && item.name.includes("Dashboard")
                        ? "text-green-600 bg-green-50 hover:bg-green-100"
                        : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 text-gray-700 hover:text-green-600 font-medium rounded-lg hover:bg-green-50 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            {/* Login/Profile */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="hidden sm:flex p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>

              {/* User Profile or Login */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center space-x-3 profile-dropdown relative">
                  {/* User Avatar with Initials */}
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(
                      userData?.role
                    )} flex items-center justify-center text-white font-bold text-sm cursor-pointer ring-2 ring-green-200 hover:ring-green-300 transition-all`}
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    {userData?.avatar ? (
                      <img
                        src={userData.avatar}
                        alt={userData.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(userData?.name)
                    )}
                  </div>

                  {/* User Name and Role */}
                  <div
                    className="cursor-pointer hover:text-green-600 transition-colors"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <p className="text-gray-800 font-medium text-sm leading-tight">
                      {userData?.name}
                    </p>
                    <p className="text-gray-500 text-xs">{userData?.role}</p>
                  </div>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleColor(
                              userData?.role
                            )} flex items-center justify-center text-white font-bold`}
                          >
                            {userData?.avatar ? (
                              <img
                                src={userData.avatar}
                                alt={userData.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(userData?.name)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {userData?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {userData?.role}
                            </p>
                            <p className="text-xs text-gray-500">
                              {userData?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        {/* Role-based Dashboard Link */}
                        <button
                          onClick={() => {
                            handleDashboardClick();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-xl flex items-center font-medium"
                        >
                          <UserIcon className="w-5 h-5 mr-3" />
                          {getDashboardName(userData?.role)}
                        </button>

                        <Link
                          to="/profile"
                          className="w-full px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl flex items-center"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <UserIcon className="w-5 h-5 mr-3" />
                          View Profile
                        </Link>

                        <Link
                          to="/settings"
                          className="w-full px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl flex items-center"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <BellIcon className="w-5 h-5 mr-3" />
                          Settings
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center font-medium"
                          >
                            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hidden sm:flex bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all"
                >
                  <UserIcon className="w-4 h-4 mr-1" />
                  Login
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden border-t border-gray-200 shadow-lg bg-white ${
            isMobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.name ? null : item.name
                        )
                      }
                      className="flex justify-between px-4 py-3 w-full text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                    >
                      {item.name}
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        activeDropdown === item.name
                          ? "max-h-48 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.dropdown.map((sub) =>
                        sub.action ? (
                          <button
                            key={sub.name}
                            onClick={(e) => {
                              e.preventDefault();
                              if (sub.action) {
                                sub.action();
                                setIsMobileOpen(false);
                              }
                            }}
                            className="block px-6 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg w-full text-left"
                          >
                            {sub.icon} {sub.name}
                          </button>
                        ) : (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block px-6 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                          >
                            {sub.icon} {sub.name}
                          </Link>
                        )
                      )}
                    </div>
                  </>
                ) : item.action ? (
                  <button
                    onClick={() => {
                      item.action();
                      setIsMobileOpen(false);
                    }}
                    className={`block px-4 py-3 w-full text-left rounded-lg transition-all ${
                      isLoggedIn && item.name.includes("Dashboard")
                        ? "text-green-600 bg-green-50 hover:bg-green-100 font-medium"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                    }`}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-4">
              {isLoggedIn ? (
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="flex items-center px-4 py-3 space-x-3 bg-green-50 rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(
                        userData?.role
                      )} flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {userData?.avatar ? (
                        <img
                          src={userData.avatar}
                          alt={userData.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(userData?.name)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {userData?.name}
                      </p>
                      <p className="text-sm text-gray-600">{userData?.role}</p>
                    </div>
                  </div>

                  {/* Mobile Dashboard Button */}
                  <button
                    onClick={() => {
                      handleDashboardClick();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg font-medium"
                  >
                    <UserIcon className="w-5 h-5 mr-3" />
                    {getDashboardName(userData?.role)}
                  </button>

                  {/* Mobile Profile Actions */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                  >
                    <UserIcon className="w-5 h-5 mr-3" />
                    View Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg space-x-2"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          closeModal={closeModal}
          loginRole={loginRole}
          setLoginRole={setLoginRole}
          showPatientReg={showPatientReg}
          setShowPatientReg={setShowPatientReg}
          showForgotPassword={showForgotPassword}
          setShowForgotPassword={setShowForgotPassword}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handlePatientLogin={handlePatientLogin}
          handleUserLogin={handleUserLogin}
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          handleForgotPasswordSubmit={handleForgotPasswordSubmit}
          handlePatientRegistration={handlePatientRegistration} // NEW: Pass the function
        />
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <AppointmentModal
          selectedAppointmentType={selectedAppointmentType}
          closeAppointmentModal={closeAppointmentModal}
          handleAppointmentAction={handleAppointmentAction}
        />
      )}
    </>
  );
};

// Login Modal Component
const LoginModal = ({
  closeModal,
  loginRole,
  setLoginRole,
  showPatientReg,
  setShowPatientReg,
  showForgotPassword,
  setShowForgotPassword,
  email,
  setEmail,
  password,
  setPassword,
  handlePatientLogin,
  handleUserLogin,
  forgotEmail,
  setForgotEmail,
  handleForgotPasswordSubmit,
  handlePatientRegistration, // NEW: Add this prop
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
      <div className="absolute inset-0" onClick={closeModal}></div>
      <div
        className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full max-h-[650px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!loginRole && !showPatientReg && !showForgotPassword ? (
          <>
            <button
              aria-label="Close"
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl text-center font-bold mb-6">Login As</h2>
            <div className="space-y-3">
              <button
                className="w-full py-3 font-semibold rounded-md text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                onClick={() => setLoginRole("patient")}
              >
                Patient
              </button>
              <button
                className="w-full py-3 font-semibold rounded-md text-white bg-gradient-to-r from-emerald-700 to-green-700 hover:opacity-90"
                onClick={() => setLoginRole("doctor")}
              >
                Doctor
              </button>
              <button
                className="w-full py-3 font-semibold rounded-md text-white bg-gradient-to-r from-green-700 to-emerald-700 hover:opacity-90"
                onClick={() => setLoginRole("admin")}
              >
                Admin
              </button>
            </div>
          </>
        ) : null}

        {loginRole === "patient" && !showPatientReg && !showForgotPassword ? (
          <PatientLogin
            onBack={() => setLoginRole(null)}
            setShowPatientReg={setShowPatientReg}
            setShowForgotPassword={setShowForgotPassword}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handlePatientLogin={handlePatientLogin}
            handlePatientRegistration={handlePatientRegistration} // NEW: Pass the function
          />
        ) : null}

        {loginRole !== "patient" &&
        loginRole &&
        !showPatientReg &&
        !showForgotPassword ? (
          <UserLogin
            role={loginRole}
            onBack={() => setLoginRole(null)}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleUserLogin={handleUserLogin}
          />
        ) : null}

        {showPatientReg ? (
          <div>
            <PatientRegistration />
            <button
              onClick={() => {
                setShowPatientReg(false);
                setLoginRole(null);
              }}
              className="w-full mt-6 py-3 rounded-md bg-gray-100 text-green-700 font-semibold"
            >
              Back to Login
            </button>
          </div>
        ) : null}

        {showForgotPassword ? (
          <ForgotPassword
            setShowForgotPassword={setShowForgotPassword}
            forgotEmail={forgotEmail}
            setForgotEmail={setForgotEmail}
            handleForgotPasswordSubmit={handleForgotPasswordSubmit}
          />
        ) : null}
      </div>
    </div>
  );
};

// Patient Login Component
const PatientLogin = ({
  onBack,
  setShowPatientReg,
  setShowForgotPassword,
  email,
  setEmail,
  password,
  setPassword,
  handlePatientLogin,
  handlePatientRegistration, // NEW: Add this prop
}) => {
  return (
    <form onSubmit={handlePatientLogin} className="space-y-4 relative">
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        onClick={onBack}
      >
        ← Back
      </button>
      <h3 className="text-lg font-semibold text-center">Patient Login</h3>
      <label className="block text-base font-medium mb-1">Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      <label className="block text-base font-medium mb-1">Password</label>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-md font-semibold"
      >
        Login
      </button>
      <div className="flex justify-between mt-2 text-sm">
        {/* UPDATED: Use handlePatientRegistration instead of setShowPatientReg */}
        <button
          type="button"
          className="text-green-600 hover:underline"
          onClick={handlePatientRegistration}
        >
          New Patient? Register
        </button>
        <button
          type="button"
          className="text-green-600 hover:underline"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
};

// User Login Component
const UserLogin = ({
  role,
  onBack,
  email,
  setEmail,
  password,
  setPassword,
  handleUserLogin,
}) => {
  return (
    <form onSubmit={handleUserLogin} className="space-y-4 relative">
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        onClick={onBack}
      >
        ← Back
      </button>
      <h3 className="text-lg font-semibold text-center">
        {role.charAt(0).toUpperCase() + role.slice(1)} Login
      </h3>
      <label className="block text-base font-medium mb-1">Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      <label className="block text-base font-medium mb-1">Password</label>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-md font-semibold"
      >
        Login
      </button>
    </form>
  );
};

// Forgot Password Component
const ForgotPassword = ({
  setShowForgotPassword,
  forgotEmail,
  setForgotEmail,
  handleForgotPasswordSubmit,
}) => {
  return (
    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 relative">
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        onClick={() => setShowForgotPassword(false)}
      >
        ← Back
      </button>
      <h3 className="text-xl font-semibold text-center mb-6">
        Forgot Password
      </h3>
      <label className="block mb-1">Email</label>
      <input
        type="email"
        placeholder="Your registered email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        required
        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-md font-semibold"
      >
        Send Reset Link
      </button>
    </form>
  );
};

// Appointment Modal Component
const AppointmentModal = ({
  selectedAppointmentType,
  closeAppointmentModal,
  handleAppointmentAction,
}) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
    <div className="absolute inset-0" onClick={closeAppointmentModal}></div>
    <div
      className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full max-h-[320px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
    >
      <button
        aria-label="Close appointment modal"
        onClick={closeAppointmentModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600 rounded"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <h2
        id="appointment-modal-title"
        className="text-xl text-center font-bold mb-6"
      >
        {selectedAppointmentType} Appointments
      </h2>

      <div className="flex flex-col space-y-6">
        <button
          onClick={() => handleAppointmentAction("Booking")}
          className="w-full py-3 rounded-md font-semibold bg-green-600 text-white 
            hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition relative"
          type="button"
          aria-describedby="booking-desc"
        >
          {selectedAppointmentType === "Panchakarma" ? "Booking" : "Join Queue"}
          <p
            id="booking-desc"
            className="text-sm text-green-200 mt-1 font-normal select-none pointer-events-none"
          >
            {selectedAppointmentType === "Panchakarma"
              ? "Schedule a new Panchakarma session"
              : "Join the real-time consultation queue"}
          </p>
        </button>

        <button
          onClick={() => handleAppointmentAction("Reschedule/Cancel")}
          className="w-full py-3 rounded-md font-semibold bg-gray-200 text-gray-800 
            hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 transition relative"
          type="button"
          aria-describedby="reschedule-desc"
        >
          {selectedAppointmentType === "Panchakarma"
            ? "Reschedule/Cancel"
            : "Manage Queue"}
          <p
            id="reschedule-desc"
            className="text-sm text-gray-600 mt-1 font-normal select-none pointer-events-none"
          >
            {selectedAppointmentType === "Panchakarma"
              ? "Modify or cancel your existing appointment"
              : "Reschedule or cancel your queue position"}
          </p>
        </button>
      </div>
    </div>
  </div>
);

export default Header;
