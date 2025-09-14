import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Therapies from './pages/Therapies';
import Home from './pages/Home';

// Import patient-related pages/components
import Patients from './pages/Patients';
import PatientRegistration from './components/PatientRegistration/PatientRegistration';
import PatientList from './pages/Patients';
import PatientProfiles from './pages/Patients';

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
            <Route path="/patients" element={<Patients />} /> 
            <Route path="/patients/register" element={<PatientRegistration />} />
            <Route path="/patients/list" element={<PatientList />} />
            <Route path="/patients/profiles" element={<PatientProfiles />} />

            {/* 404 catch-all */}
            <Route path="*" element={
              <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300">
                    Back to Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
