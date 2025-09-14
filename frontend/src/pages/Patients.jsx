import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PatientRegistration from '../components/PatientRegistration/PatientRegistration';

const Patients = () => {
  // Example backend generated patient ID placeholder
  const generatedPatientId = "AY12345678";

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto">
        <PatientRegistration generatedPatientId={generatedPatientId} />
      </main>

      <Footer />
    </div>
  );
};

export default Patients;
