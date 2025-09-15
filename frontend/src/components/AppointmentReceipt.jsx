import React, { useRef } from 'react';
import { 
  CheckCircleIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon,
  QrCodeIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AppointmentReceipt = ({ bookingData, onPrint, onDownload }) => {
  const receiptRef = useRef();

  const generateQRCode = (data) => {
    // In a real implementation, use a QR code library like 'qrcode'
    // For now, we'll use a placeholder QR service
    const qrData = encodeURIComponent(JSON.stringify({
      bookingId: data.bookingId,
      patientId: data.patientId,
      date: data.selectedDate,
      time: data.selectedTimeSlot?.time,
      doctorId: data.selectedDoctor?.id
    }));
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
  };

  const downloadPDF = () => {
    // In a real implementation, use libraries like jsPDF or html2pdf
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Print Actions */}
      <div className="flex justify-center space-x-4 mb-6 print:hidden">
        <button
          onClick={onPrint}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          <PrinterIcon className="w-5 h-5 mr-2" />
          Print Receipt
        </button>
        <button
          onClick={downloadPDF}
          className="flex items-center px-6 py-3 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Download PDF
        </button>
      </div>

      {/* Receipt Content */}
      <div 
        ref={receiptRef}
        className="bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-green-100 print:shadow-none print:border-2 print:border-gray-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <img 
                  src="/assets/logo.jpg" 
                  alt="AyurSutra Logo" 
                  className="w-12 h-12 rounded-lg bg-white p-1"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div>
                  <h1 className="text-2xl font-bold">AyurSutra</h1>
                  <p className="text-green-100">Ayurvedic Wellness Platform</p>
                </div>
              </div>
              <p className="text-green-100 text-sm">
                📍 Mumbai • Pune • Delhi | 📞 1800-AYUR-CARE
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="w-8 h-8" />
                <span className="text-xl font-bold">CONFIRMED</span>
              </div>
              <p className="text-green-100">Panchakarma Appointment</p>
            </div>
          </div>
        </div>

        {/* Booking Details Header */}
        <div className="bg-green-50 px-8 py-4 border-b-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-800">Booking Confirmation</h2>
              <p className="text-green-600">Please present this receipt at the center</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="text-2xl font-bold text-green-800 font-mono">{bookingData.bookingId}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Patient Information */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Patient Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-green-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="font-semibold text-gray-800 font-mono">{bookingData.patientId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-800">{bookingData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aadhar Number</p>
                    <p className="font-semibold text-gray-800 font-mono">{bookingData.aadharNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-semibold text-gray-800">{bookingData.mobileNumber}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(bookingData.selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-800 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {bookingData.selectedTimeSlot?.time}
                      {bookingData.selectedTimeSlot?.optimal && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Optimal for {bookingData.doshaType} dosha
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-800">{bookingData.selectedTimeSlot?.therapyDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dosha Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{bookingData.doshaType}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <IdentificationIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Doctor & Treatment Details
                </h3>
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={bookingData.selectedDoctor?.avatar}
                    alt={bookingData.selectedDoctor?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{bookingData.selectedDoctor?.name}</p>
                    <p className="text-blue-600 font-medium">{bookingData.selectedDoctor?.specialization}</p>
                    <p className="text-sm text-gray-500">{bookingData.selectedDoctor?.experience} • ⭐ {bookingData.selectedDoctor?.rating}</p>
                  </div>
                </div>
                
                {bookingData.recommendedTreatment && (
                  <div className="border-t border-blue-200 pt-4">
                    <p className="text-sm text-gray-500">Recommended Treatment</p>
                    <p className="font-semibold text-gray-800">{bookingData.recommendedTreatment.therapy.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{bookingData.recommendedTreatment.therapy.description}</p>
                    <div className="flex space-x-4 mt-2 text-sm">
                      <span className="text-gray-600">Duration: {bookingData.recommendedTreatment.duration}</span>
                      <span className="text-gray-600">Sessions: {bookingData.recommendedTreatment.sessions}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Center Information */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BuildingOffice2Icon className="w-5 h-5 mr-2 text-purple-600" />
                  Treatment Center
                </h3>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{bookingData.selectedCenter?.name}</p>
                  <p className="text-gray-600 mt-1">{bookingData.selectedCenter?.address}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {bookingData.selectedCenter?.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">⭐ {bookingData.selectedCenter?.rating} rating</p>
                </div>
              </div>
            </div>

            {/* QR Code & Instructions */}
            <div className="space-y-6">
              
              {/* QR Code for Quick Check-in */}
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center">
                  <QrCodeIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Quick Check-in
                </h3>
                <div className="flex justify-center mb-4">
                  <img
                    src={generateQRCode({
                      bookingId: bookingData.bookingId,
                      patientId: bookingData.patientId,
                      selectedDate: bookingData.selectedDate,
                      selectedTimeSlot: bookingData.selectedTimeSlot,
                      selectedDoctor: bookingData.selectedDoctor
                    })}
                    alt="Booking QR Code"
                    className="w-32 h-32 border-2 border-gray-200 rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code at the reception for quick check-in
                </p>
              </div>

              {/* Booking Summary */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-semibold">{new Date(bookingData.bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Time:</span>
                    <span className="font-semibold">{bookingData.bookingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">✓ Confirmed</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-3">
                    <span className="text-gray-600">Reference ID:</span>
                    <span className="font-bold font-mono text-green-800">{bookingData.bookingId}</span>
                  </div>
                </div>
              </div>

              {/* Important Instructions */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Important Instructions
                </h3>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Arrive 15 minutes early for consultation
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Bring this receipt and a valid ID proof
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Wear comfortable, loose clothing
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    Avoid heavy meals 2 hours before treatment
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    For cancellation, call 24 hours in advance
                  </li>
                </ul>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Contact</h3>
                <div className="text-sm text-red-700">
                  <p className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    24/7 Helpline: 1800-AYUR-CARE
                  </p>
                  <p className="mt-1">
                    📧 support@ayursutra.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {(bookingData.symptoms || bookingData.preferences) && (
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              {bookingData.symptoms && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Symptoms/Health Concerns:</p>
                  <p className="text-gray-700">{bookingData.symptoms}</p>
                </div>
              )}
              {bookingData.preferences && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Special Preferences:</p>
                  <p className="text-gray-700">{bookingData.preferences}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Thank you for choosing AyurSutra for your wellness journey
            </p>
            <p className="text-xs text-gray-500">
              This is a computer-generated receipt. Please keep it safe for your records and present it during your appointment.
            </p>
            <div className="flex justify-center items-center space-x-6 mt-4 text-xs text-gray-500">
              <span>🌐 www.ayursutra.com</span>
              <span>📱 Download our mobile app</span>
              <span>⭐ Rate your experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentReceipt;
