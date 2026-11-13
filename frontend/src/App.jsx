import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
const Therapies = lazy(() => import("./pages/Therapies"));
import Home from "./pages/Home";

// Patient-related imports
const PatientRegistration = lazy(() => import("./components/PatientRegistration/PatientRegistration"));
const PatientList = lazy(() => import("./pages/Patients"));
const PatientProfiles = lazy(() => import("./pages/Patients"));
const PanchakarmaBooking = lazy(() => import("./pages/PanchakarmaBooking"));
const PanchakarmaReschedule = lazy(() => import("./pages/PanchakarmaReschedule"));
const JoinQueue = lazy(() => import("./pages/JoinQueue"));
const QueueManagement = lazy(() => import("./pages/QueueManagement"));
const ClinicWorkspace = lazy(() => import("./components/ClinicWorkspace"));
const PatientDashboard = lazy(() => import("./components/PatientDashboard"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const ResetPassword = lazy(() => import("./pages/newpassword"));


function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <Suspense fallback={<p className="p-8 pt-24" role="status">Loading page…</p>}>
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<Home />} />

            {/* Therapies Routes */}
            <Route path="/therapies/*" element={<Therapies />} />

            {/* Patients Routes */}
            <Route path="/patients" element={<PatientRegistration />} />
            <Route path="/patients/register" element={<PatientRegistration />} />
            <Route path="/patients/list" element={<PatientList />} />
            <Route path="/patients/profiles" element={<PatientProfiles />} />

            {/* Panchakarma Appointment Routes */}
            <Route path="/appointments/panchakarma/booking" element={<PanchakarmaBooking />} />
            <Route path="/appointments/panchakarma/reschedule" element={<PanchakarmaReschedule />} />

            {/* General Appointment Routes - Using Queue System */}
            <Route path="/queue/join" element={<JoinQueue />} />
            <Route path="/queue/manage" element={<QueueManagement />} />
            <Route path="/queue/reschedule-cancel" element={<Navigate to="/queue/join" replace />} />

            {/* Alternative routes for consistency */}
            <Route path="/appointments/general/reschedule" element={<Navigate to="/queue/join" replace />} />

            {/* Queue Routes */}
            <Route path="/queue" element={<Navigate to="/queue/join" replace />} />
            <Route path="/dashboard" element={<><PatientDashboard /><ClinicWorkspace embedded /></>} />
            <Route path="/queuetrends" element={<Navigate to="/queue/join" replace />} />
            <Route path="/patient-dashboard" element={<><PatientDashboard /><ClinicWorkspace embedded /></>} />
            <Route path="/therapist-dashboard" element={<ClinicWorkspace />} />
            <Route path="/doctor-dashboard" element={<ClinicWorkspace />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* New password */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Reports */}
            <Route path="/reports" element={<ClinicWorkspace reportsOnly />} />

            {/* 404 catch-all */}
            <Route
              path="*"
              element={
                <div className="min-h-screen pt-20 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a
                      href="/"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                    >
                      Back to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
