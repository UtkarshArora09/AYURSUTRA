import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  UserIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PatientRegistration from "../../components/PatientRegistration/PatientRegistration"; // Adjust path as needed

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Login modal states
  const [loginRole, setLoginRole] = useState(null);
  const [showPatientReg, setShowPatientReg] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showLoginModal ? "hidden" : "unset";
  }, [showLoginModal]);

  const navItems = [
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
    { name: "Appointments", href: "/appointments" },
    { name: "Queue", href: "/queue" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reports", href: "/reports" },
  ];

  // Close modal and reset all login states and form inputs
  const closeModal = () => {
    setShowLoginModal(false);
    setLoginRole(null);
    setShowPatientReg(false);
    setShowForgotPassword(false);
    setUsername("");
    setPassword("");
    setForgotEmail("");
  };

  // Handle Patient Login form submit
  const handlePatientLogin = (e) => {
    e.preventDefault();
    alert(`Patient logged in as ${username}`);
    closeModal();
  };

  // Handle Doctor/Admin Login form submit
  const handleUserLogin = (e) => {
    e.preventDefault();
    alert(`${loginRole.charAt(0).toUpperCase() + loginRole.slice(1)} logged in as ${username}`);
    closeModal();
  };

  // Handle Forgot Password submit
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${forgotEmail}`);
    setShowForgotPassword(false);
    setForgotEmail("");
  };

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
            <Link to="/" className="flex items-center space-x-3 cursor-pointer flex-shrink-0">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <img
                    src="/assets/logo.jpg"
                    alt="AyurSutra Logo"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "inline";
                    }}
                  />
                  <span className="text-white font-bold text-lg hidden">🕉️</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-0 group-hover:opacity-30"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  AyurSutra
                </h1>
                <p className="text-xs text-gray-600 -mt-1">Ayurvedic Wellness Platform</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.name}
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="relative group"
                  >
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-all duration-300 rounded-lg hover:bg-green-50"
                      >
                        <span>{item.name}</span>
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform duration-300 ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </Link>
                    ) : (
                      <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-all duration-300 rounded-lg hover:bg-green-50">
                        <span>{item.name}</span>
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform duration-300 ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                    <div
                      className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ${
                        activeDropdown === item.name
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 translate-y-4 invisible"
                      }`}
                    >
                      <div className="p-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl"
                          >
                            <span className="text-lg">{subItem.icon}</span>
                            <span className="font-medium">{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 text-gray-700 hover:text-green-600 font-medium rounded-lg"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            {/* Login/Profile */}
            <div className="flex items-center space-x-3">
              <button className="hidden sm:flex p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                <BellIcon className="w-5 h-5" />
              </button>

              {isLoggedIn ? (
                <div className="hidden sm:flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-565ff4ffac26?w=40"
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-green-200"
                  />
                  <span className="text-gray-700 font-medium">Dr. Smith</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hidden sm:flex bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium"
                >
                  <UserIcon className="w-4 h-4 mr-1" />
                  Login
                </button>
              )}

              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                aria-label="Toggle mobile menu"
              >
                {isMobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
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
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
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
                        activeDropdown === item.name ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="block px-6 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                        >
                          {sub.icon} {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
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

            <div className="border-t border-gray-200 pt-4">
              {isLoggedIn ? (
                <div className="flex items-center px-4 py-3 space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-565ff4ffac26?w=40"
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-green-200"
                  />
                  <span className="text-gray-700 font-medium">Dr. Smith</span>
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
              />
            ) : null}

            {loginRole !== "patient" && loginRole && !showPatientReg && !showForgotPassword ? (
              <UserLogin role={loginRole} onBack={() => setLoginRole(null)} />
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
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};


const PatientLogin = ({ onBack, setShowPatientReg, setShowForgotPassword }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Patient logged in as ${username}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onBack}>
        ← Back
      </button>
      <h3 className="text-lg font-semibold text-center">Patient Login</h3>

      <label className="block text-base font-medium mb-1">Username</label>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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

      <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-semibold">
        Login
      </button>

      <div className="flex justify-between mt-2 text-sm">
        <button type="button" className="text-green-600 hover:underline" onClick={() => setShowPatientReg(true)}>
          New Patient? Register
        </button>
        <button type="button" className="text-green-600 hover:underline" onClick={() => setShowForgotPassword(true)}>
          Forgot Password?
        </button>
      </div>
    </form>
  );
};


const UserLogin = ({ role, onBack }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${role.charAt(0).toUpperCase() + role.slice(1)} logged in as ${username}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <button type="button" className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" onClick={onBack}>
        ← Back
      </button>
      <h3 className="text-lg font-semibold text-center">
        {role.charAt(0).toUpperCase() + role.slice(1)} Login
      </h3>

      <label className="block text-base font-medium mb-1">Username</label>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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

      <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-semibold">
        Login
      </button>
    </form>
  );
};


const ForgotPassword = ({ setShowForgotPassword }) => {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${email}`);
    setShowForgotPassword(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <button type="button" className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" onClick={() => setShowForgotPassword(false)}>
        ← Back
      </button>
      <h3 className="text-xl font-semibold text-center mb-6">Forgot Password</h3>

      <label className="block mb-1">Email</label>
      <input
        type="email"
        placeholder="Your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
      />

      <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-semibold">
        Send Reset Link
      </button>
    </form>
  );
};

export default Header;
