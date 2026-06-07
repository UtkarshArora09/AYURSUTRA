import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  MapPinIcon,
  BriefcaseIcon,
  UserGroupIcon,
  HeartIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState(null);

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  // Modal states
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null); // null if adding
  const [docFormData, setDocFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience_years: "",
    qualification: "",
    clinic_address: "",
  });

  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [therapistFormData, setTherapistFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    expertise: "",
    experience_years: "",
    qualification: "",
    assigned_doctor_id: "",
  });

  // Check Authentication & Role
  useEffect(() => {
    const userRaw = localStorage.getItem("ayursutra_user");
    if (!userRaw) {
      navigate("/");
      return;
    }
    try {
      const user = JSON.parse(userRaw);
      if (user.role.toLowerCase() !== "admin") {
        navigate("/");
        return;
      }
      setAdminUser(user);
    } catch (e) {
      navigate("/");
      return;
    }
  }, [navigate]);

  // Fetch all dashboard data
  useEffect(() => {
    if (adminUser) {
      fetchAllData();
    }
  }, [adminUser]);

  const fetchAllData = async () => {
    setLoading(true);
    setActionError("");
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Fetch Doctors
      const resDocs = await fetch(`${API_BASE_URL}/api/admin/doctors`, { headers });
      if (resDocs.ok) {
        const dataDocs = await resDocs.json();
        setDoctors(dataDocs);
      }

      // Fetch Therapists
      const resTherapists = await fetch(`${API_BASE_URL}/api/admin/therapists`, { headers });
      if (resTherapists.ok) {
        const dataTherapists = await resTherapists.json();
        setTherapists(dataTherapists);
      }

      // Fetch Patients
      const resPatients = await fetch(`${API_BASE_URL}/api/admin/patients`, { headers });
      if (resPatients.ok) {
        const dataPatients = await resPatients.json();
        setPatients(dataPatients);
      }

      // Fetch Therapies
      const resTherapies = await fetch(`${API_BASE_URL}/api/admin/therapies`, { headers });
      if (resTherapies.ok) {
        const dataTherapies = await resTherapies.json();
        setTherapies(dataTherapies);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setActionError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- DOCTOR CRUD HANDLERS ---
  const handleOpenDocModal = (doc = null) => {
    setActionError("");
    if (doc) {
      setEditingDoctor(doc);
      setDocFormData({
        name: doc.name || "",
        email: doc.email || "",
        password: "", // leave empty for edit
        phone: doc.phone || "",
        specialization: doc.specialization || "",
        experience_years: doc.experience_years || "",
        qualification: doc.qualification || "",
        clinic_address: doc.clinic_address || "",
      });
    } else {
      setEditingDoctor(null);
      setDocFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        experience_years: "",
        qualification: "",
        clinic_address: "",
      });
    }
    setShowDocModal(true);
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    setActionError("");
    const token = localStorage.getItem("auth_token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      if (editingDoctor) {
        // Update Doctor
        const { password, ...updateData } = docFormData;
        // Only send password if admin filled it out
        if (docFormData.password) {
          updateData.password = docFormData.password;
        }

        const res = await fetch(`${API_BASE_URL}/api/admin/doctors/${editingDoctor.doctor_id || editingDoctor.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updateData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Failed to update doctor");

        alert("Doctor details updated successfully!");
      } else {
        // Register New Doctor
        if (!docFormData.password) {
          throw new Error("Password is required for registration");
        }

        const res = await fetch(`${API_BASE_URL}/api/admin/doctors`, {
          method: "POST",
          headers,
          body: JSON.stringify(docFormData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Failed to register doctor");

        alert("Doctor registered successfully!");
      }

      setShowDocModal(false);
      fetchAllData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setActionError("");
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/doctors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete doctor");

      alert("Doctor deleted successfully!");
      fetchAllData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // --- THERAPIST CRUD HANDLERS ---
  const handleOpenTherapistModal = (therapist = null) => {
    setActionError("");
    if (therapist) {
      setEditingTherapist(therapist);
      setTherapistFormData({
        name: therapist.name || "",
        email: therapist.email || "",
        password: "",
        phone: therapist.phone || "",
        expertise: therapist.expertise || "",
        experience_years: therapist.experience_years || "",
        qualification: therapist.qualification || "",
        assigned_doctor_id: therapist.assigned_doctor_id || "",
      });
    } else {
      setEditingTherapist(null);
      setTherapistFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        expertise: "",
        experience_years: "",
        qualification: "",
        assigned_doctor_id: "",
      });
    }
    setShowTherapistModal(true);
  };

  const handleTherapistSubmit = async (e) => {
    e.preventDefault();
    setActionError("");
    const token = localStorage.getItem("auth_token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      if (editingTherapist) {
        // Update Therapist
        const { password, ...updateData } = therapistFormData;
        if (therapistFormData.password) {
          updateData.password = therapistFormData.password;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/admin/therapists/${editingTherapist.therapist_id || editingTherapist.id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(updateData),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Failed to update therapist");

        alert("Therapist details updated successfully!");
      } else {
        // Register New Therapist
        if (!therapistFormData.password) {
          throw new Error("Password is required for registration");
        }

        const res = await fetch(`${API_BASE_URL}/api/admin/therapists`, {
          method: "POST",
          headers,
          body: JSON.stringify(therapistFormData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Failed to register therapist");

        alert("Therapist registered successfully!");
      }

      setShowTherapistModal(false);
      fetchAllData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteTherapist = async (id) => {
    if (!window.confirm("Are you sure you want to delete this therapist?")) return;
    setActionError("");
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/therapists/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete therapist");

      alert("Therapist deleted successfully!");
      fetchAllData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Filter lists based on search query
  const filteredDoctors = doctors.filter((doc) =>
    doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTherapists = therapists.filter((therapist) =>
    therapist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.expertise?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = patients.filter((patient) =>
    patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("ayursutra_user");
    localStorage.removeItem("auth_token");
    navigate("/");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-stone-600 font-medium">Loading AyurSutra Administration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-stone-50 text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
              System Administration
            </h1>
            <p className="text-stone-500 mt-1">
              Welcome back, <span className="font-semibold text-emerald-800">{adminUser?.name}</span>. Manage clinic providers and system configurations.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 bg-stone-150 hover:bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-medium transition duration-250 border border-stone-300"
          >
            Logout Securely
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-stone-200 mb-8 gap-2 pb-1 scrollbar-thin">
          {[
            { id: "overview", label: "Dashboard Overview" },
            { id: "doctors", label: "Manage Doctors" },
            { id: "therapists", label: "Manage Therapists" },
            { id: "patients", label: "View Patients" },
            { id: "therapies", label: "Panchakarma Therapies" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
                setActionError("");
              }}
              className={`whitespace-nowrap px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Error Alerts */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between text-red-700 shadow-sm">
            <span>{actionError}</span>
            <button onClick={() => setActionError("")}>
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}

        {/* Search Bar (except for Overview/Therapies) */}
        {["doctors", "therapists", "patients"].includes(activeTab) && (
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        )}

        {/* ---------------- OVERVIEW TAB ---------------- */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Doctors", val: doctors.length, icon: AcademicCapIcon, color: "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-800" },
                { label: "Active Therapists", val: therapists.length, icon: UserGroupIcon, color: "from-amber-50 to-orange-50 border-amber-100 text-amber-800" },
                { label: "Registered Patients", val: patients.length, icon: UsersIcon, color: "from-blue-50 to-indigo-50 border-blue-100 text-blue-800" },
                { label: "Therapies Available", val: therapies.length, icon: HeartIcon, color: "from-rose-50 to-pink-50 border-rose-100 text-rose-800" },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border shadow-sm flex items-center justify-between`}>
                  <div>
                    <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black mt-2">{stat.val}</p>
                  </div>
                  <stat.icon className="h-10 w-10 opacity-70" />
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 mb-6">Quick Administrative Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleOpenDocModal()}
                  className="flex items-center justify-center gap-3 bg-emerald-800 hover:bg-emerald-900 text-white p-5 rounded-2xl font-semibold transition-all duration-200 shadow-md shadow-emerald-800/10"
                >
                  <PlusIcon className="h-5 w-5" />
                  Register New Doctor
                </button>
                <button
                  onClick={() => handleOpenTherapistModal()}
                  className="flex items-center justify-center gap-3 bg-amber-800 hover:bg-amber-900 text-white p-5 rounded-2xl font-semibold transition-all duration-200 shadow-md shadow-amber-800/10"
                >
                  <PlusIcon className="h-5 w-5" />
                  Register New Therapist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- DOCTORS TAB ---------------- */}
        {activeTab === "doctors" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50/50">
              <h2 className="text-lg font-bold text-emerald-950">Doctors Directory</h2>
              <button
                onClick={() => handleOpenDocModal()}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition duration-200 shadow-md"
              >
                <PlusIcon className="h-4 w-4" /> Add Doctor
              </button>
            </div>
            
            {filteredDoctors.length === 0 ? (
              <div className="p-12 text-center text-stone-400">No doctors found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Specialization</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Clinic Address</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredDoctors.map((doc) => (
                      <tr key={doc.doctor_id || doc.id} className="hover:bg-stone-50/40 transition duration-150">
                        <td className="px-6 py-4 font-semibold text-stone-900">{doc.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
                            {doc.specialization}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-600">{doc.experience_years} Years</td>
                        <td className="px-6 py-4">
                          <div className="text-sm flex flex-col space-y-1">
                            <span className="flex items-center gap-1.5 text-stone-500"><EnvelopeIcon className="h-4 w-4" /> {doc.email}</span>
                            <span className="flex items-center gap-1.5 text-stone-500"><PhoneIcon className="h-4 w-4" /> {doc.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 text-sm max-w-xs truncate">{doc.clinic_address}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDocModal(doc)}
                              className="text-stone-500 hover:text-emerald-700 p-2 rounded-lg hover:bg-stone-100 transition duration-150"
                              title="Edit Doctor"
                            >
                              <PencilIcon className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doc.doctor_id || doc.id)}
                              className="text-stone-500 hover:text-red-600 p-2 rounded-lg hover:bg-stone-100 transition duration-150"
                              title="Delete Doctor"
                            >
                              <TrashIcon className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- THERAPISTS TAB ---------------- */}
        {activeTab === "therapists" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50/50">
              <h2 className="text-lg font-bold text-amber-950">Therapists Directory</h2>
              <button
                onClick={() => handleOpenTherapistModal()}
                className="bg-amber-850 hover:bg-amber-900 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition duration-200 shadow-md"
              >
                <PlusIcon className="h-4 w-4" /> Add Therapist
              </button>
            </div>
            
            {filteredTherapists.length === 0 ? (
              <div className="p-12 text-center text-stone-400">No therapists found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Expertise</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Qualification</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredTherapists.map((therapist) => (
                      <tr key={therapist.therapist_id || therapist.id} className="hover:bg-stone-50/40 transition duration-150">
                        <td className="px-6 py-4 font-semibold text-stone-900">{therapist.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold border border-amber-100">
                            {therapist.expertise}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-600">{therapist.experience_years} Years</td>
                        <td className="px-6 py-4 text-stone-500 text-sm">{therapist.qualification}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm flex flex-col space-y-1">
                            <span className="flex items-center gap-1.5 text-stone-500"><EnvelopeIcon className="h-4 w-4" /> {therapist.email}</span>
                            <span className="flex items-center gap-1.5 text-stone-500"><PhoneIcon className="h-4 w-4" /> {therapist.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenTherapistModal(therapist)}
                              className="text-stone-500 hover:text-amber-700 p-2 rounded-lg hover:bg-stone-100 transition duration-150"
                              title="Edit Therapist"
                            >
                              <PencilIcon className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTherapist(therapist.therapist_id || therapist.id)}
                              className="text-stone-500 hover:text-red-600 p-2 rounded-lg hover:bg-stone-100 transition duration-150"
                              title="Delete Therapist"
                            >
                              <TrashIcon className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- PATIENTS TAB ---------------- */}
        {activeTab === "patients" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-stone-200 bg-stone-50/50">
              <h2 className="text-lg font-bold text-emerald-950">Patient Profiles</h2>
            </div>
            
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-stone-400">No patients registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                      <th className="px-6 py-4">Patient ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Age / Gender</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">Emergency Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPatients.map((p) => (
                      <tr key={p.patient_id} className="hover:bg-stone-50/40 transition duration-150">
                        <td className="px-6 py-4 font-mono text-sm text-emerald-800 font-semibold">
                          {p.patient_id_str || `AYR-2024-${String(p.patient_id).padStart(3, "0")}`}
                        </td>
                        <td className="px-6 py-4 font-semibold text-stone-900">{p.first_name} {p.last_name}</td>
                        <td className="px-6 py-4 text-stone-600 text-sm">
                          {p.age} Yrs / {p.gender}
                        </td>
                        <td className="px-6 py-4 text-stone-600 text-sm">{p.email}</td>
                        <td className="px-6 py-4 text-stone-500 text-sm">{p.mob_number}</td>
                        <td className="px-6 py-4 text-sm text-stone-500">
                          <div>{p.emergency_contact_name}</div>
                          <div className="text-xs text-stone-400">{p.emergency_contact_number}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- THERAPIES TAB ---------------- */}
        {activeTab === "therapies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {therapies.map((therapy) => (
              <div key={therapy.id || therapy.title} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
                    <HeartIcon className="h-5 w-5" />
                    <span>Panchakarma Treatment</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-2">{therapy.title}</h3>
                  <p className="text-stone-500 text-sm line-clamp-3">{therapy.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-stone-400 font-medium">
                  <span>Duration: {therapy.duration || "N/A"}</span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                    {therapy.dosha || "All Doshas"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ================= DOCTOR MODAL ================= */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-50">
              <h3 className="text-lg font-bold text-stone-900">
                {editingDoctor ? "Modify Doctor Details" : "Register Doctor Account"}
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-stone-400 hover:text-stone-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleDocSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={docFormData.name}
                    onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    value={docFormData.email}
                    onChange={(e) => setDocFormData({ ...docFormData, email: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Password {editingDoctor && <span className="text-stone-400 font-normal">(Leave blank to keep same)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingDoctor}
                    value={docFormData.password}
                    onChange={(e) => setDocFormData({ ...docFormData, password: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={docFormData.phone}
                    onChange={(e) => setDocFormData({ ...docFormData, phone: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vata/Pitta Specialist"
                    value={docFormData.specialization}
                    onChange={(e) => setDocFormData({ ...docFormData, specialization: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    required
                    value={docFormData.experience_years}
                    onChange={(e) => setDocFormData({ ...docFormData, experience_years: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Qualification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAMS, MD (Ayurveda)"
                    value={docFormData.qualification}
                    onChange={(e) => setDocFormData({ ...docFormData, qualification: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Clinic Address</label>
                  <textarea
                    rows="2"
                    required
                    value={docFormData.clinic_address}
                    onChange={(e) => setDocFormData({ ...docFormData, clinic_address: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md"
                >
                  {editingDoctor ? "Save Changes" : "Register Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= THERAPIST MODAL ================= */}
      {showTherapistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-50">
              <h3 className="text-lg font-bold text-stone-900">
                {editingTherapist ? "Modify Therapist Details" : "Register Therapist Account"}
              </h3>
              <button onClick={() => setShowTherapistModal(false)} className="text-stone-400 hover:text-stone-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleTherapistSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={therapistFormData.name}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, name: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    value={therapistFormData.email}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, email: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Password {editingTherapist && <span className="text-stone-400 font-normal">(Leave blank to keep same)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingTherapist}
                    value={therapistFormData.password}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, password: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={therapistFormData.phone}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, phone: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Expertise / Speciality</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abhyanga, Shirodhara"
                    value={therapistFormData.expertise}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, expertise: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    required
                    value={therapistFormData.experience_years}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, experience_years: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Qualification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Certified Panchakarma Therapist"
                    value={therapistFormData.qualification}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, qualification: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Assign Supervisor Doctor</label>
                  <select
                    value={therapistFormData.assigned_doctor_id}
                    onChange={(e) => setTherapistFormData({ ...therapistFormData, assigned_doctor_id: e.target.value })}
                    className="w-full border border-stone-200 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    <option value="">Select Doctor (Optional)</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id || doc.id} value={doc.doctor_id || doc.id}>
                        {doc.name} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTherapistModal(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-850 hover:bg-amber-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md"
                >
                  {editingTherapist ? "Save Changes" : "Register Therapist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
