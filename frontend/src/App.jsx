import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Therapies from './pages/Therapies';
import Home from './pages/Home';

// Patient-related imports
import Patients from './pages/Patients';
import PatientRegistration from './components/PatientRegistration/PatientRegistration';
import PatientList from './pages/Patients';
import PatientProfiles from './pages/Patients';
import PanchakarmaBooking from './pages/PanchakarmaBooking';
import PanchakarmaReschedule from './pages/PanchakarmaReschedule';
import JoinQueue from './pages/JoinQueue';
import QueueRescheduleCancel from './components/QueueRescheduleCancel';
import PatientDashboard from './components/PatientDashboard';

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
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
            <Route path="/queue/reschedule-cancel" element={<QueueRescheduleCancel />} />
            
            {/* Alternative routes for consistency */}
            <Route path="/appointments/general/reschedule" element={<QueueRescheduleCancel />} />

            {/* Queue Routes */}
            <Route path="/queue" element={<JoinQueue />} />
            <Route path="/dashboard" element={<PatientDashboard/>}/>

            {/* 404 catch-all */}
            <Route
              path="*"
              element={
                <div className="min-h-screen pt-20 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a href="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300">
                      Back to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
