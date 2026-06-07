import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  UserGroupIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MegaphoneIcon,
  PlusCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const FIREBASE_DB_URL = "https://digital-queue-system-ca4a3-default-rtdb.firebaseio.com";

const QueueManagement = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  
  // Date selector state
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Queue state
  const [queueList, setQueueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Authentication & Authorization check
  useEffect(() => {
    const userRaw = localStorage.getItem("ayursutra_user");
    if (!userRaw) {
      alert("Unauthorized access. Please login.");
      navigate("/");
      return;
    }
    try {
      const user = JSON.parse(userRaw);
      const role = user.role?.toLowerCase();
      if (role !== "doctor" && role !== "admin") {
        alert("Access restricted to Doctors and Admins only.");
        navigate("/");
        return;
      }
      setUserRole(user.role);
    } catch (e) {
      console.error("Auth parsing error", e);
      navigate("/");
    }
  }, [navigate]);

  // Fetch queue from Firebase (runs on date change or manual refresh or poll interval)
  useEffect(() => {
    let active = true;

    const fetchQueue = async () => {
      try {
        const response = await fetch(`${FIREBASE_DB_URL}/queues/${selectedDate}.json`);
        if (!response.ok) throw new Error("Failed to fetch database queues");
        
        const data = await response.json();
        
        if (!active) return;
        
        if (!data) {
          setQueueList([]);
          setLoading(false);
          return;
        }

        // Convert key-value object to array
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Sort: Emergency priority first, then by timestamp (oldest first)
        list.sort((a, b) => {
          if (a.priority === "emergency" && b.priority !== "emergency") return -1;
          if (b.priority === "emergency" && a.priority !== "emergency") return 1;
          return (a.timestamp || 0) - (b.timestamp || 0);
        });

        setQueueList(list);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching queues:", err);
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchQueue();

    // Poll every 3 seconds to get real-time state updates
    const interval = setInterval(fetchQueue, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedDate, refreshKey]);

  // Mark patient as Emergency
  const handleMarkEmergency = async (patientId, patientName) => {
    if (
      !window.confirm(
        `🚨 Are you sure you want to mark ${patientName} as EMERGENCY priority?\n\nThis will move them to the front of the queue.`
      )
    ) {
      return;
    }

    try {
      const updates = {
        priority: "emergency",
        timestamp: Date.now() - 10000000, // force timestamp backward to position them at the very front
      };

      const response = await fetch(
        `${FIREBASE_DB_URL}/queues/${selectedDate}/${patientId}.json`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to mark emergency status");
      
      // Force instant UI updates
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Error marking emergency: " + err.message);
    }
  };

  // Remove patient from queue
  const handleRemovePatient = async (patientId, patientName) => {
    if (
      !window.confirm(
        `⚠️ Are you sure you want to remove ${patientName} from the queue?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${FIREBASE_DB_URL}/queues/${selectedDate}/${patientId}.json`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove patient");

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Error removing patient: " + err.message);
    }
  };

  // Call Next Patient
  const handleCallNext = async () => {
    if (queueList.length === 0) {
      alert("📋 The consultation queue is currently empty.");
      return;
    }

    const nextPatient = queueList[0];
    const name = nextPatient.name || "Patient";

    if (
      !window.confirm(
        `📢 Call patient "${name}" to the consultation room?\n\nThis will remove them from the queue.`
      )
    ) {
      return;
    }

    try {
      // Play web audio beep or speech synthesis callout!
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(`Calling patient ${name} to consultation room.`);
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
      }

      // Delete next patient from queue
      const response = await fetch(
        `${FIREBASE_DB_URL}/queues/${selectedDate}/${nextPatient.id}.json`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete called patient");

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Error calling next patient: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Block */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-green-100 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {userRole} Administration Panel
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-green-950 mt-2 flex items-center gap-2">
              ⚡ Queue Administration
            </h1>
            <p className="text-green-700 text-sm font-medium mt-1">
              Manage and serve consultation patients in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial">
              <label className="block text-xs font-bold text-green-900 mb-1">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-green-950 font-bold"
                />
              </div>
            </div>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="mt-5 p-2.5 bg-green-50 hover:bg-green-100 text-green-800 rounded-xl border border-green-200 transition"
              title="Refresh Queue"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-green-700 text-xs font-bold uppercase tracking-wider">
                Total Patients
              </p>
              <h3 className="text-3xl font-black text-green-950 mt-1">
                {queueList.length}
              </h3>
            </div>
            <UserGroupIcon className="w-12 h-12 text-green-200" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-green-700 text-xs font-bold uppercase tracking-wider">
                Urgent Emergencies
              </p>
              <h3 className="text-3xl font-black text-yellow-600 mt-1">
                {queueList.filter((item) => item.priority === "emergency").length}
              </h3>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-200" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-green-700 text-xs font-bold uppercase tracking-wider">
                Now Serving
              </p>
              <h3 className="text-sm font-semibold text-green-900 mt-2 truncate max-w-[180px]">
                {queueList.length > 0 ? queueList[0].name : "None - Queue Empty"}
              </h3>
            </div>
            <MegaphoneIcon className="w-12 h-12 text-emerald-200" />
          </div>
        </div>

        {/* Next Patient Call Button */}
        <div className="mb-8">
          <button
            onClick={handleCallNext}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-lg rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            📢 Call Next Patient
          </button>
        </div>

        {/* Queue List / Queue Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-green-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-green-950">Patient Registry</h3>
            <span className="text-xs text-green-700 font-bold bg-white px-3 py-1 rounded-full border border-green-100 shadow-sm flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-ping"></span> Real-time updates active
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-sm text-green-700 mt-2 font-bold">
                Syncing with Real-time DB...
              </p>
            </div>
          ) : queueList.length === 0 ? (
            <div className="text-center p-16">
              <div className="text-5xl mb-4">🏥</div>
              <h4 className="text-lg font-bold text-green-900">
                No patients in queue
              </h4>
              <p className="text-sm text-green-700 mt-1 max-w-sm mx-auto font-medium">
                The queue is empty for {selectedDate}. New patient tokens will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-green-50/20 text-green-800 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Patient Info</th>
                    <th className="px-6 py-4">Hospital & Service</th>
                    <th className="px-6 py-4">Status & Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queueList.map((patient, index) => {
                    const isEmergency = patient.priority === "emergency";
                    const joinedTime = patient.timestamp
                      ? new Date(patient.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";

                    return (
                      <tr
                        key={patient.id}
                        className={`transition hover:bg-green-50/10 ${
                          isEmergency ? "bg-amber-50/45 hover:bg-amber-50/70" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          {isEmergency ? (
                            <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full animate-bounce inline-block">
                              🚨 URGENT
                            </span>
                          ) : (
                            <span className="text-lg font-black text-green-900">
                              #{index + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-green-950">
                            {patient.name}
                          </div>
                          <div className="text-xs text-green-700 font-medium mt-0.5">
                            📞 {patient.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-green-950">
                            {patient.hospital}
                          </div>
                          <div className="text-xs text-emerald-700 font-bold mt-0.5 uppercase tracking-wide">
                            {patient.service}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isEmergency ? "bg-amber-500" : "bg-green-600"
                              }`}
                            ></span>
                            <span className="text-xs font-bold text-green-950 capitalize">
                              {patient.status || "waiting"}
                            </span>
                          </div>
                          <div className="text-xs text-green-700 font-semibold mt-1 flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" /> Joined: {joinedTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isEmergency && (
                              <button
                                onClick={() =>
                                  handleMarkEmergency(patient.id, patient.name)
                                }
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition"
                              >
                                Emergency
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleRemovePatient(patient.id, patient.name)
                              }
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition"
                              title="Remove Patient"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;
