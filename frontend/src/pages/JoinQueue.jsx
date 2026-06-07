import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  QrCodeIcon,
  ArrowRightStartOnRectangleIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";

const FIREBASE_DB_URL = "https://digital-queue-system-ca4a3-default-rtdb.firebaseio.com";

const hospitals = [
  "Promhex Multispeciality Hospital",
  "Felix Hospital - Greater Noida",
  "Riverdale Healthcare",
  "Yatharth Super Speciality Hospital",
  "Apollo Spectra Hospital",
];

const services = [
  { name: "General Consultation", desc: "Routine health checks and consultations", icon: "🩺" },
  { name: "Pediatrics", desc: "Specialized care for children and infants", icon: "👶" },
  { name: "Blood Test", desc: "Diagnostic blood tests and investigations", icon: "🩸" },
  { name: "Diagnostic Imaging", desc: "X-Rays, Ultrasounds, and scans", icon: "🩻" },
  { name: "Dental Checkup", desc: "Complete oral care and hygiene", icon: "🦷" },
  { name: "Eye Examination", desc: "Vision tests and eye health assessments", icon: "👁️" },
  { name: "Cardiology", desc: "Heart checkups and cardiovascular care", icon: "❤️" },
  { name: "Vaccination", desc: "Immunization and preventive vaccines", icon: "💉" },
  { name: "Mental Health", desc: "Counseling and psychological support", icon: "🧠" },
  { name: "Orthopedics", desc: "Bone, joint, and muscle consultations", icon: "🦴" },
];

const JoinQueue = () => {
  const navigate = useNavigate();

  // Auth / Prefill
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Flow / Ticket state
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentLivePosition, setCurrentLivePosition] = useState(null);

  // Load user profile and saved ticket
  useEffect(() => {
    // 1. Fetch logged-in user
    const userRaw = localStorage.getItem("ayursutra_user");
    if (userRaw && userRaw !== "undefined") {
      try {
        const parsed = JSON.parse(userRaw);
        setCurrentUser(parsed);
        // Prefill form
        setPatientName(parsed.name || `${parsed.first_name || ""} ${parsed.last_name || ""}`.trim());
        setPatientPhone(parsed.mobile_number || parsed.phone || "");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    // 2. Fetch saved ticket from localStorage
    const savedTicketRaw = localStorage.getItem("ayursutra_current_queue");
    if (savedTicketRaw) {
      try {
        const ticket = JSON.parse(savedTicketRaw);
        setActiveTicket(ticket);
      } catch (e) {
        console.error("Error parsing saved ticket", e);
      }
    }
  }, []);

  // Poll Firebase to check current live position if there is an active ticket
  useEffect(() => {
    if (!activeTicket) return;

    const checkLiveStatus = async () => {
      try {
        const response = await fetch(`${FIREBASE_DB_URL}/queues/${activeTicket.firebaseDate}.json`);
        if (!response.ok) throw new Error("Failed to fetch queue status");
        
        const data = await response.json();
        
        // If the ticket has been deleted (i.e. patient was served or removed by doctor)
        if (!data || !data[activeTicket.key]) {
          localStorage.removeItem("ayursutra_current_queue");
          setActiveTicket(null);
          setCurrentLivePosition(null);
          alert("Your queue ticket has been processed or cleared by the coordinator.");
          return;
        }

        // Calculate current position: convert to array and sort
        const list = Object.keys(data).map(k => ({
          id: k,
          ...data[k],
        }));

        list.sort((a, b) => {
          if (a.priority === "emergency" && b.priority !== "emergency") return -1;
          if (b.priority === "emergency" && a.priority !== "emergency") return 1;
          return (a.timestamp || 0) - (b.timestamp || 0);
        });

        // Find patient index
        const idx = list.findIndex(item => item.id === activeTicket.key);
        if (idx !== -1) {
          const livePos = idx + 1;
          setCurrentLivePosition(livePos);
          
          // Check if priority changed to emergency
          if (list[idx].priority === "emergency" && activeTicket.priority !== "emergency") {
            setActiveTicket(prev => ({
              ...prev,
              priority: "emergency"
            }));
          }
        }
      } catch (err) {
        console.error("Error checking live position:", err);
      }
    };

    // Run immediately and then poll every 4 seconds
    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 4000);
    return () => clearInterval(interval);
  }, [activeTicket]);

  // Handle Form Submission (Join Queue)
  const handleJoinQueue = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert("Please enter a patient name.");
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!selectedHospital) {
      alert("Please select a hospital branch.");
      return;
    }
    if (!selectedService) {
      alert("Please select a clinical service.");
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch today's count to establish queue position
      const date = appointmentDate;
      const response = await fetch(`${FIREBASE_DB_URL}/queues/${date}.json`);
      if (!response.ok) throw new Error("Failed to fetch current queues");
      
      const data = await response.json();
      const count = data ? Object.keys(data).length : 0;
      const nextPosition = count + 1;

      // 2. Build payload
      const timestamp = Date.now();
      const payload = {
        name: patientName,
        phone: patientPhone,
        timestamp,
        date,
        hospital: selectedHospital,
        service: selectedService,
        position: nextPosition,
        system: "AyurSutra Digital Queue",
        status: "waiting",
      };

      // 3. Post to Firebase
      const postResponse = await fetch(`${FIREBASE_DB_URL}/queues/${date}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!postResponse.ok) throw new Error("Failed to push queue ticket");
      const result = await postResponse.json();
      
      // 4. Save ticket to state & localStorage
      const ticketInfo = {
        key: result.name, // Firebase key (e.g. -NJskd...)
        firebaseDate: date,
        name: patientName,
        phone: patientPhone,
        date,
        hospital: selectedHospital,
        service: selectedService,
        position: nextPosition,
        timestamp,
      };

      localStorage.setItem("ayursutra_current_queue", JSON.stringify(ticketInfo));
      setActiveTicket(ticketInfo);
      setCurrentLivePosition(nextPosition);
    } catch (err) {
      console.error(err);
      alert("Error joining queue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Leave Queue
  const handleLeaveQueue = async () => {
    if (!window.confirm("⚠️ Are you sure you want to leave the digital queue?\n\nThis will remove your appointment ticket from the database.")) {
      return;
    }

    setLoading(true);
    try {
      await fetch(`${FIREBASE_DB_URL}/queues/${activeTicket.firebaseDate}/${activeTicket.key}.json`, {
        method: "DELETE",
      });

      localStorage.removeItem("ayursutra_current_queue");
      setActiveTicket(null);
      setCurrentLivePosition(null);
      
      // Clear form selections
      setSelectedService("");
      alert("You have left the consultation queue.");
    } catch (err) {
      console.error("Error leaving queue:", err);
      alert("Failed to leave queue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Printing Ticket
  const handlePrint = () => {
    if (!activeTicket) return;
    const printWindow = window.open("", "_blank");
    const ticketPosition = currentLivePosition || activeTicket.position;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>AyurSutra Queue Ticket</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              background: #f0fdf4;
              padding: 20px;
              color: #14532d;
            }
            .ticket { 
              width: 380px;
              margin: 0 auto;
              border: 4px solid #16a34a; 
              border-radius: 20px; 
              padding: 25px; 
              background: white;
              box-shadow: 0 10px 30px rgba(22, 163, 74, 0.15);
              position: relative;
              overflow: hidden;
            }
            .ticket::before {
              content: '';
              position: absolute;
              top: -10px;
              left: 20px;
              right: 20px;
              height: 20px;
              background: repeating-linear-gradient(
                90deg,
                #16a34a 0px,
                #16a34a 10px,
                transparent 10px,
                transparent 20px
              );
              border-radius: 10px 10px 0 0;
            }
            .header { 
              text-align: center; 
              color: #16a34a; 
              border-bottom: 3px solid #bbf7d0; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 1.8rem;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .header h2 {
              font-size: 1.1rem;
              font-weight: 600;
              color: #15803d;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 12px 0;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
              font-size: 14px;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #15803d;
              font-weight: 600;
            }
            .info-value {
              color: #14532d;
              font-weight: 500;
              text-align: right;
            }
            .queue-highlight {
              background: linear-gradient(135deg, #dcfce7, #bbf7d0);
              padding: 15px;
              border-radius: 12px;
              margin: 15px 0;
              text-align: center;
            }
            .queue-number {
              font-size: 2rem;
              font-weight: 800;
              color: #16a34a;
            }
            .footer { 
              margin-top: 20px; 
              font-size: 11px; 
              color: #15803d; 
              text-align: center;
            }
            .status {
              background: #16a34a;
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              display: inline-block;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>🌿 AyurSutra</h1>
              <h2>Digital Queue Ticket</h2>
            </div>
            <div class="info-row">
              <span class="info-label">👤 Patient:</span>
              <span class="info-value">${activeTicket.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📱 Phone:</span>
              <span class="info-value">${activeTicket.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📅 Date:</span>
              <span class="info-value">${activeTicket.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🏥 Hospital:</span>
              <span class="info-value">${activeTicket.hospital}</span>
            </div>
            <div class="info-row">
              <span class="info-label">⚕️ Service:</span>
              <span class="info-value">${activeTicket.service}</span>
            </div>
            <div class="queue-highlight">
              <div style="font-size: 13px; color: #15803d; margin-bottom: 5px;">Queue Position</div>
              <div class="queue-number">#${ticketPosition}</div>
            </div>
            <div class="footer">
              <p>• Please arrive 15 minutes early</p>
              <p>• Present at reception desk</p>
              <div class="status">CONFIRMED APPOINTMENT</div>
              <p style="margin-top: 8px; font-style: italic;">
                Issued: ${new Date(activeTicket.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Get WhatsApp Link
  const getWhatsAppLink = () => {
    if (!activeTicket) return "#";
    const ticketPosition = currentLivePosition || activeTicket.position;
    
    const message = `🌿 *AyurSutra Digital Queue System*

🎟️ *Your Healthcare Appointment Confirmed*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Patient:* ${activeTicket.name}
📱 *Phone:* ${activeTicket.phone}
📅 *Date:* ${activeTicket.date}
🏥 *Hospital:* ${activeTicket.hospital}
⚕️ *Service:* ${activeTicket.service}
🔢 *Queue Position:* #${ticketPosition}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *Important Instructions:*
• Please arrive 15 minutes early
• Show this message at reception
• Keep phone ready for updates

🌿 *AyurSutra Healthcare*
Helpline: 1800-AYUR-CARE`;

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  // QR Code String
  const getQrDataString = () => {
    if (!activeTicket) return "";
    const ticketPosition = currentLivePosition || activeTicket.position;
    return encodeURIComponent(`🌿 AyurSutra Digital Queue Ticket
👤 Patient: ${activeTicket.name}
📱 Phone: ${activeTicket.phone}
📅 Date: ${activeTicket.date}
🏥 Hospital: ${activeTicket.hospital}
⚕️ Service: ${activeTicket.service}
🎟️ Position: #${ticketPosition}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-900 mb-2 flex items-center justify-center gap-2">
            🌿 AyurSutra Digital Queue
          </h1>
          <p className="text-emerald-700 text-sm md:text-base font-medium max-w-xl mx-auto">
            Skip the physical waiting lines. Secure your real-time consultation position instantly.
          </p>
        </div>

        {activeTicket ? (
          /* ================= PHASE 2: TICKET VIEW ================= */
          <div className="space-y-6">
            {/* Live Status Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 shadow-lg border border-emerald-400 text-center animate-pulse-subtle">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-white" />
              <h3 className="text-lg md:text-xl font-bold">Successfully Joined Queue!</h3>
              <div className="mt-4 flex flex-col md:flex-row gap-4 justify-center items-center text-sm font-medium">
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  Live Position: <strong className="text-yellow-200 text-base">#{currentLivePosition || activeTicket.position}</strong>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  Est. Wait: <strong className="text-yellow-200 text-base">{(currentLivePosition || activeTicket.position) * 5} mins</strong>
                </div>
                {activeTicket.priority === "emergency" && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold animate-bounce">
                    🚨 EMERGENCY PRIORITY
                  </div>
                )}
              </div>
            </div>

            {/* The Ticket Graphic */}
            <div className="bg-white rounded-3xl shadow-xl border-t-8 border-green-600 p-6 md:p-8 max-w-lg mx-auto relative overflow-hidden">
              {/* Ticket Scalloped Top Effect */}
              <div className="absolute top-0 left-6 right-6 h-4 bg-[repeating-linear-gradient(90deg,#16a34a_0px,#16a34a_10px,transparent_10px,transparent_20px)] opacity-50 rounded-b"></div>

              <div className="text-center mb-6 pt-4">
                <h2 className="text-2xl font-bold text-green-900 border-b-2 border-green-100 pb-2">
                  AyurSutra Consultation Ticket
                </h2>
              </div>

              {/* Patient Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm md:text-base">
                  <span className="text-green-700 font-semibold flex items-center gap-1">
                    <UserIcon className="w-4 h-4" /> Patient:
                  </span>
                  <span className="text-green-950 font-medium">{activeTicket.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm md:text-base">
                  <span className="text-green-700 font-semibold flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" /> Mobile:
                  </span>
                  <span className="text-green-950 font-medium">{activeTicket.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm md:text-base">
                  <span className="text-green-700 font-semibold flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" /> Date:
                  </span>
                  <span className="text-green-950 font-medium">{activeTicket.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm md:text-base">
                  <span className="text-green-700 font-semibold flex items-center gap-1">
                    <BuildingOffice2Icon className="w-4 h-4" /> Center:
                  </span>
                  <span className="text-green-950 font-medium text-right max-w-[200px]">{activeTicket.hospital}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm md:text-base">
                  <span className="text-green-700 font-semibold flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> Clinic Service:
                  </span>
                  <span className="text-green-950 font-medium">{activeTicket.service}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl border-2 border-green-100 mb-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${getQrDataString()}`}
                  alt="Queue QR Ticket"
                  className="w-40 h-40 border-4 border-white rounded-xl shadow-md transition-transform hover:scale-105"
                />
                <span className="text-xs text-green-700 font-semibold mt-2 flex items-center gap-1">
                  <QrCodeIcon className="w-4 h-4" /> Scan at reception to check-in
                </span>
              </div>

              {/* Ticket Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-green-900 font-bold rounded-xl transition duration-300 shadow-sm border border-gray-200"
                >
                  <PrinterIcon className="w-5 h-5" /> Print Ticket
                </button>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition duration-300 shadow-md"
                >
                  💬 Share WhatsApp
                </a>
              </div>

              {/* Leave Queue Action */}
              <button
                onClick={handleLeaveQueue}
                disabled={loading}
                className="w-full mt-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition duration-300 flex items-center justify-center gap-2"
              >
                <ArrowRightStartOnRectangleIcon className="w-5 h-5" /> Leave Queue
              </button>
            </div>
          </div>
        ) : (
          /* ================= PHASE 1: REGISTRATION FORM ================= */
          <div className="bg-white rounded-3xl shadow-xl border-3 border-emerald-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl md:text-2xl font-bold text-green-900 mb-1">
                Enter Consultation Details
              </h2>
              <p className="text-xs md:text-sm text-green-700 font-medium">
                Fill the required details below to join the real-time clinical token registry.
              </p>
            </div>

            <form onSubmit={handleJoinQueue} className="p-6 md:p-8 space-y-6">
              {/* Patient Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100 transition duration-300 text-green-950 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100 transition duration-300 text-green-950 font-medium"
                  />
                </div>
              </div>

              {/* Datepicker */}
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 border-2 border-emerald-100 rounded-xl focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100 transition duration-300 text-green-950 font-medium"
                />
              </div>

              {/* Hospital Selection */}
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Select Hospital Branch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {hospitals.map((hospital) => (
                    <button
                      key={hospital}
                      type="button"
                      onClick={() => setSelectedHospital(hospital)}
                      className={`p-4 rounded-2xl text-left border-2 transition duration-300 flex flex-col justify-between h-28 hover:scale-[1.02] ${
                        selectedHospital === hospital
                          ? "border-green-600 bg-green-50 shadow-md ring-4 ring-green-100"
                          : "border-gray-100 hover:border-green-200 bg-white"
                      }`}
                    >
                      <BuildingOffice2Icon className={`w-6 h-6 ${selectedHospital === hospital ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-xs md:text-sm font-bold text-green-950 line-clamp-2 leading-tight">
                        {hospital}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Select Consultation Specialty
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => setSelectedService(service.name)}
                      className={`p-4 rounded-2xl text-left border-2 transition duration-300 flex items-center gap-4 hover:scale-[1.01] ${
                        selectedService === service.name
                          ? "border-green-600 bg-green-50 shadow-md ring-4 ring-green-100"
                          : "border-gray-100 hover:border-green-200 bg-white"
                      }`}
                    >
                      <span className="text-3xl select-none">{service.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-green-950">{service.name}</h4>
                        <p className="text-xs text-green-700 mt-0.5 line-clamp-1 font-medium">
                          {service.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold text-base md:text-lg rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Ticket...
                  </>
                ) : (
                  "Join Digital Consultation Queue"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Informative Footer Badge */}
        <div className="mt-8 flex gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
          <InformationCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700 leading-normal font-medium">
            <strong>Real-Time Database Notice:</strong> Position calculations are done dynamically based on today's token pool. Estimated wait time is computed as approximately 5 minutes per patient, subject to consultation complexity. Keep this ticket page active to receive instant updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinQueue;
