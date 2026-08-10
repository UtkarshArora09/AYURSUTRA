import React, { useState, useEffect } from 'react';

import { 
  BookOpenIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PlayIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import Header from '../components/Header';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const Therapies = () => {
  const [activeTab, setActiveTab] = useState('catalogue');
  const [patientId, setPatientId] = useState(null);
  const [patientBookings, setPatientBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRaw = localStorage.getItem("ayursutra_user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        const pid = user.id || user.patient_id || user.patientId;
        if (pid) {
          setPatientId(pid);
          fetchBookings(pid);
        }
      } catch (e) {
        console.error("Error parsing user in Therapies.jsx", e);
      }
    }
  }, []);

  const fetchBookings = async (pid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/patient/${pid}`);
      if (res.ok) {
        const data = await res.json();
        setPatientBookings(data);
      }
    } catch (err) {
      console.error("Error fetching patient bookings in Therapies.jsx", err);
    } finally {
      setLoading(false);
    }
  };

  const panchakarmaTherapies = [
    {
      id: 1,
      name: 'Vamana',
      title: 'Therapeutic Emesis',
      emoji: '🤮',
      dosha: 'Kapha',
      duration: '3-5 days',
      difficulty: 'Moderate',
      description: 'Controlled therapeutic vomiting to clear excess Kapha from the upper respiratory and digestive tract.',
      detailedDescription: 'Vamana is a specialized detoxification therapy where medicated emesis is induced to eliminate accumulated toxins, especially excess Kapha dosha. This ancient procedure involves careful preparation, administration of specific herbal medicines, and controlled vomiting to cleanse the stomach, chest, and respiratory system.',
      benefits: [
        'Treats chronic asthma and respiratory disorders',
        'Eliminates allergies and skin conditions',
        'Improves digestion and metabolism',
        'Reduces chronic cough and cold symptoms',
        'Balances Kapha-related disorders',
        'Enhances immunity and vitality'
      ],
      conditions: [
        'Bronchial Asthma', 'Chronic Allergies', 'Skin Diseases', 'Sinusitis', 
        'Chronic Indigestion', 'Obesity', 'Diabetes Type 2', 'Psoriasis'
      ],
      process: [
        'Pre-treatment preparation (Purvakarma)',
        'Internal oleation with medicated ghee',
        'External massage and steam therapy',
        'Administration of emetic medicines',
        'Controlled therapeutic vomiting',
        'Post-treatment care and diet'
      ],
      contraindications: ['Pregnancy', 'Heart disease', 'High blood pressure', 'Recent surgery'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      name: 'Virechana',
      title: 'Herbal Purgation Therapy',
      emoji: '🌿',
      dosha: 'Pitta',
      duration: '5-7 days',
      difficulty: 'Easy',
      description: 'Controlled herbal purgation to cleanse the liver, small intestine, and balance Pitta dosha.',
      detailedDescription: 'Virechana is a gentle yet effective purgation therapy using specific Ayurvedic herbs to eliminate toxins from the liver, gallbladder, and small intestine. This therapy is particularly beneficial for Pitta-related disorders and helps restore digestive fire while removing accumulated bile and metabolic waste.',
      benefits: [
        'Cleanses liver and digestive system',
        'Treats skin disorders like eczema and psoriasis',
        'Reduces hyperacidity and digestive issues',
        'Balances hormonal disorders',
        'Improves metabolism and weight management',
        'Enhances mental clarity and focus'
      ],
      conditions: [
        'Liver Disorders', 'Skin Diseases', 'Hyperacidity', 'Migraine', 
        'Constipation', 'Hemorrhoids', 'Jaundice', 'Inflammatory Conditions'
      ],
      process: [
        'Digestive fire enhancement',
        'Internal oleation therapy',
        'External massage and sweating',
        'Administration of purgative medicines',
        'Controlled bowel cleansing',
        'Gradual diet restoration'
      ],
      contraindications: ['Diarrhea', 'Weak digestive system', 'Extreme weakness', 'Pregnancy'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      name: 'Basti',
      title: 'Medicated Enema Therapy',
      emoji: '💧',
      dosha: 'Vata',
      duration: '8-30 days',
      difficulty: 'Advanced',
      description: 'Specialized enema therapy using herbal oils and decoctions to balance Vata and cleanse the colon.',
      detailedDescription: 'Basti is considered the most important among Panchakarma therapies, often called the "mother of all treatments." It involves administering medicated enemas using specific herbal oils, ghee, or decoctions to eliminate Vata-related toxins from the colon and restore proper function of the nervous system.',
      benefits: [
        'Treats arthritis and joint disorders',
        'Relieves chronic constipation',
        'Improves neurological conditions',
        'Enhances reproductive health',
        'Reduces lower back pain and sciatica',
        'Strengthens bones and muscles'
      ],
      conditions: [
        'Arthritis', 'Osteoporosis', 'Sciatica', 'Paralysis', 
        'Constipation', 'IBS', 'Infertility', 'Neurological Disorders'
      ],
      process: [
        'Complete body preparation',
        'Selection of appropriate medicated oils',
        'Anuvasana Basti (oil-based enema)',
        'Asthapana Basti (decoction-based enema)',
        'Systematic administration cycles',
        'Post-treatment strengthening'
      ],
      contraindications: ['Acute diarrhea', 'Rectal bleeding', 'Severe hemorrhoids', 'Recent abdominal surgery'],
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 4,
      name: 'Nasya',
      title: 'Nasal Administration Therapy',
      emoji: '👃',
      dosha: 'Kapha/Vata',
      duration: '7-21 days',
      difficulty: 'Easy',
      description: 'Therapeutic administration of medicated oils through the nasal passages to treat head and neck disorders.',
      detailedDescription: 'Nasya therapy involves the administration of medicated oils, powders, or herbal juices through the nasal passages. This treatment directly affects the brain, nervous system, and sensory organs, making it highly effective for disorders related to the head, neck, and respiratory system.',
      benefits: [
        'Treats sinusitis and nasal congestion',
        'Improves memory and concentration',
        'Relieves migraine and headaches',
        'Enhances sensory organ function',
        'Reduces stress and anxiety',
        'Prevents premature graying of hair'
      ],
      conditions: [
        'Sinusitis', 'Migraine', 'Memory Loss', 'Depression', 
        'Nasal Polyps', 'Trigeminal Neuralgia', 'Facial Paralysis', 'Hair Loss'
      ],
      process: [
        'Facial massage preparation',
        'Steam therapy for head and neck',
        'Selection of appropriate medicines',
        'Precise nasal administration',
        'Post-treatment rest and care',
        'Gradual increase in dosage'
      ],
      contraindications: ['Acute cold', 'Nasal injuries', 'Pregnancy', 'Recent nasal surgery'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 5,
      name: 'Raktamokshana',
      title: 'Therapeutic Blood Purification',
      emoji: '🩸',
      dosha: 'Pitta/Kapha',
      duration: '1-3 sessions',
      difficulty: 'Expert',
      description: 'Controlled blood purification therapy to eliminate toxins and treat blood-related disorders.',
      detailedDescription: 'Raktamokshana is a specialized therapy for purifying blood and eliminating deep-seated toxins. This treatment uses various methods including leech therapy, cupping, or controlled venesection to remove impure blood and restore healthy circulation. It is particularly effective for chronic skin conditions and circulatory disorders.',
      benefits: [
        'Treats chronic skin diseases',
        'Reduces blood toxicity levels',
        'Improves circulation and blood flow',
        'Relieves localized swelling',
        'Treats varicose veins',
        'Enhances skin complexion'
      ],
      conditions: [
        'Eczema', 'Psoriasis', 'Acne', 'Urticaria', 
        'Varicose Veins', 'Elephantiasis', 'Chronic Wounds', 'Blood Disorders'
      ],
      process: [
        'Complete health assessment',
        'Selection of appropriate method',
        'Sterilization and preparation',
        'Controlled blood removal',
        'Immediate wound care',
        'Post-treatment monitoring'
      ],
      contraindications: ['Anemia', 'Blood clotting disorders', 'Pregnancy', 'Weak constitution'],
      color: 'from-red-500 to-rose-500'
    }
  ];

  const TabButton = ({ tabName, icon: Icon, title, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabName)}
      className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 min-w-0 flex-1 sm:flex-none ${
        isActive
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
          : 'bg-white text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
      <span className="text-sm sm:text-base whitespace-nowrap">{title}</span>
    </button>
  );

  const TherapyCard = ({ therapy }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${therapy.color} p-4 sm:p-6 text-white`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl">{therapy.emoji}</span>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">{therapy.name}</h3>
              <p className="text-xs sm:text-sm opacity-90">{therapy.title}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {therapy.dosha} Balance
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm opacity-95">{therapy.description}</p>
      </div>
      {/* Floating Image Circles */}
<div className="absolute top-24 left-20 w-32 h-32 rounded-full overflow-hidden shadow-xl animate-float pointer-events-none z-0">
  <img
    src="/assets/ayurveda1.png"
    alt="Ayurveda Symbol"
    className="w-full h-full object-cover"
  />
</div>

<div className="absolute top-20 right-6 w-36 h-36 rounded-full overflow-hidden shadow-xl animate-float-reverse pointer-events-none z-0">
  <img
    src="/assets/ayurveda3.png"
    alt="Ayurveda Symbol"
    className="w-full h-full object-cover"
  />
</div>



      {/* Content - Made flexible to push buttons to bottom */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-grow flex flex-col">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Duration: {therapy.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Level: {therapy.difficulty}</span>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">About This Therapy</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{therapy.detailedDescription}</p>
        </div>

        {/* Benefits */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
            <SparklesIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            Key Benefits
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {therapy.benefits.slice(0, 4).map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-600">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions Treated */}
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
            <HeartIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            Conditions Treated
          </h4>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {therapy.conditions.slice(0, 6).map((condition, index) => (
              <span 
                key={index}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom with consistent sizing */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-100 mt-auto">
          <button className="w-full sm:flex-1 h-11 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-md flex items-center justify-center text-sm sm:text-base">
            Learn More
          </button>
        <button className="w-full sm:flex-1 h-11 sm:h-12 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center text-sm sm:text-base"> Book Session </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'catalogue':
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
          Panchakarma Therapy Catalogue
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed px-4 sm:px-0">
                Discover the ancient wisdom      of Panchakarma - five powerful detoxification therapies 
                designed to cleanse, balance, and rejuvenate your mind, body, and spirit. Each therapy 
                targets specific doshas and health conditions for optimal healing.
              </p>
            </div>

            {/* Therapies Grid - Updated for mobile responsiveness */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {panchakarmaTherapies.map((therapy) => (
                <TherapyCard key={therapy.id} therapy={therapy} />
              ))}
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-green-100 mx-4 sm:mx-0">
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 text-center">
                Why Choose Panchakarma at AyurSutra?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Expert Practitioners</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Certified Ayurvedic doctors with 15+ years experience</p>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Authentic Methods</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Traditional techniques following ancient Ayurvedic texts</p>
                </div>
                <div className="text-center">
                  <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Personalized Care</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Customized treatment plans based on your unique constitution</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'assign':
        if (!patientId) {
          return (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-xl mx-auto border border-gray-100">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h3>
              <p className="text-gray-600 mb-6">Please log in to your patient account to see your assigned therapies.</p>
            </div>
          );
        }

        if (loading) {
          return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-xl mx-auto border border-gray-100">
              <p className="text-gray-600 animate-pulse font-medium">Fetching your assigned therapies...</p>
            </div>
          );
        }

        const activeBookings = patientBookings.filter(b => b.status !== 'cancelled');

        if (activeBookings.length === 0) {
          return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-xl mx-auto border border-gray-100">
              <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Assignments</h3>
              <p className="text-gray-600 mb-6">You do not have any assigned therapies currently. Start the Dosha Quiz with Sahayak or book a therapy from the Catalogue.</p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            <div className="text-center px-4 sm:px-0">
              <ClipboardDocumentListIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Your Assigned Therapies</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Here are the personalized Panchakarma therapies recommended and scheduled for you based on your clinical assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {activeBookings.map((booking) => {
                const therapy = panchakarmaTherapies.find(
                  t => t.name.toLowerCase() === booking.therapy_type.toLowerCase()
                ) || {
                  name: booking.therapy_type,
                  title: 'Custom Assigned Therapy',
                  emoji: '🧘‍♂️',
                  duration: 'As scheduled',
                  detailedDescription: 'Personalized treatment protocol prescribed by your attending doctor.',
                  benefits: ['Promotes systemic balance', 'Aids detoxification'],
                  conditions: ['General Wellness'],
                  color: 'from-green-500 to-emerald-500'
                };

                return (
                  <div key={booking.booking_id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mx-4 sm:mx-0">
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${therapy.color} p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{therapy.emoji}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{therapy.name}</h3>
                          <p className="text-sm opacity-90">{therapy.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-1.5">
                        <span className="bg-white/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                          Status: {booking.status}
                        </span>
                        <span className="text-sm opacity-90 font-medium">
                          📅 {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Clinical Rationale */}
                      <div className="bg-green-50/55 rounded-xl p-5 border border-green-100">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                          <SparklesIcon className="w-5 h-5 mr-2 text-green-600" />
                          Clinical Rationale (Why this is assigned)
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Assigned to balance excess <strong className="text-green-800">{booking.dosha_type || therapy.dosha}</strong> dosha.
                        </p>
                        {booking.symptoms && (
                          <div className="mt-3 text-xs text-gray-600">
                            <strong className="text-gray-700">Addressed Symptoms:</strong> {booking.symptoms}
                          </div>
                        )}
                        {booking.preferences && (
                          <div className="mt-1.5 text-xs text-gray-600">
                            <strong className="text-gray-700">Special Preferences:</strong> {booking.preferences}
                          </div>
                        )}
                      </div>

                      {/* Doctor and Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-b border-gray-100 pb-6">
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-1.5">Assigned Practitioner</h5>
                          <p className="text-gray-800 font-medium">{booking.doctor_name || "Dr. Priya Singh"}</p>
                          <p className="text-xs text-gray-500">{booking.doctor_specialization || "Ayurvedic Specialist"}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-1.5">Clinic Location</h5>
                          <p className="text-gray-800 font-medium">
                            {booking.center_id === 2 ? "Vedic Healing Center - Pune" : booking.center_id === 3 ? "Holistic Ayurveda Clinic - Delhi" : "AyurSutra Wellness Center - Mumbai"}
                          </p>
                        </div>
                      </div>

                      {/* About and Benefits */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-base mb-2">About the Treatment</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{therapy.detailedDescription}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center">
                              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" /> Key Benefits
                            </h4>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-1">
                              {therapy.benefits.slice(0, 4).map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1 text-blue-500" /> Therapy Plan & Duration
                            </h4>
                            <p className="text-xs text-gray-600">Expected Cycle Duration: <strong>{therapy.duration}</strong></p>
                            <p className="text-xs text-gray-500 mt-1">Please ensure to follow the Purvakarma diet guidelines 2 days prior to your visit.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'track':
        if (!patientId) {
          return (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-xl mx-auto border border-gray-100">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h3>
              <p className="text-gray-600 mb-6">Please log in to your patient account to track your therapy progress.</p>
            </div>
          );
        }

        if (loading) {
          return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-xl mx-auto border border-gray-100">
              <p className="text-gray-600 animate-pulse font-medium">Loading progress tracker...</p>
            </div>
          );
        }

        const activeTrackBookings = patientBookings.filter(b => b.status !== 'cancelled');

        if (activeTrackBookings.length === 0) {
          return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-xl mx-auto border border-gray-100">
              <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Journeys</h3>
              <p className="text-gray-600 mb-6">You have no active therapy journeys to track. Once an assignment is scheduled, progress stages will show up here.</p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            <div className="text-center px-4 sm:px-0">
              <ChartBarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Therapy Progress Tracker</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Panchakarma is completed in three distinct chronological stages. Follow your stage guidelines below.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {activeTrackBookings.map((booking) => {
                const schedDate = new Date(booking.scheduled_date);
                const today = new Date();
                
                schedDate.setHours(0,0,0,0);
                today.setHours(0,0,0,0);

                let currentStage = 1;
                if (booking.status.toLowerCase() === 'completed') {
                  currentStage = 4;
                } else if (today.getTime() === schedDate.getTime()) {
                  currentStage = 2;
                } else if (today.getTime() > schedDate.getTime()) {
                  currentStage = 3;
                } else {
                  currentStage = 1;
                }

                const stages = [
                  {
                    num: 1,
                    title: "Purvakarma",
                    subtitle: "Preparation",
                    desc: "Oleation and steam treatments to prepare the body for detox.",
                    duration: "2-3 days before"
                  },
                  {
                    num: 2,
                    title: "Pradhanakarma",
                    subtitle: "Main Treatment",
                    desc: "Elimination of toxins via the scheduled main therapy.",
                    duration: "Treatment Day"
                  },
                  {
                    num: 3,
                    title: "Paschatkarma",
                    subtitle: "Post-Treatment",
                    desc: "Samsarjana Krama restoration diet to revive digestive fire.",
                    duration: "3-5 days after"
                  },
                  {
                    num: 4,
                    title: "Rasayana",
                    subtitle: "Rejuvenation",
                    desc: "Nourishment phase to rebuild strength and lock in benefits.",
                    duration: "Post-recovery"
                  }
                ];

                return (
                  <div key={booking.booking_id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mx-4 sm:mx-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{booking.therapy_type} Progress</h3>
                        <p className="text-xs text-gray-500">Scheduled: {new Date(booking.scheduled_date).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                        {currentStage === 4 ? "Completed" : `Stage ${currentStage} Active`}
                      </span>
                    </div>

                    {/* Desktop Stepper Progress Bar */}
                    <div className="hidden md:flex justify-between items-center relative mb-8 px-4">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((currentStage - 1) / 3) * 100}%` }}
                      ></div>
                      
                      {stages.map((stg) => {
                        const isPast = stg.num < currentStage;
                        const isActive = stg.num === currentStage;
                        return (
                          <div key={stg.num} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                              isPast ? "bg-green-500 text-white" : isActive ? "bg-green-600 text-white ring-4 ring-green-100" : "bg-white border-2 border-gray-300 text-gray-500"
                            }`}>
                              {isPast ? "✓" : stg.num}
                            </div>
                            <span className={`text-xs font-bold mt-2 ${isActive ? "text-green-700" : "text-gray-500"}`}>{stg.title}</span>
                            <span className="text-[10px] text-gray-400">{stg.subtitle}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stages Details Stack */}
                    <div className="space-y-4">
                      {stages.map((stg) => {
                        const isActive = stg.num === currentStage;
                        const isPast = stg.num < currentStage;
                        return (
                          <div key={stg.num} className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                            isActive ? "bg-green-50/50 border-green-200 shadow-sm" : isPast ? "bg-gray-50/50 border-gray-100 opacity-75" : "bg-white border-gray-100 opacity-60"
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                              isPast ? "bg-green-500 text-white" : isActive ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
                            }`}>
                              {isPast ? "✓" : stg.num}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className={`font-semibold text-sm sm:text-base ${isActive ? "text-green-900" : "text-gray-800"}`}>
                                  {stg.title} <span className="text-xs text-gray-400 text-gray-500">({stg.subtitle})</span>
                                </h4>
                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                                  {stg.duration}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">{stg.desc}</p>
                              {isActive && (
                                <div className="mt-3 text-xs bg-green-100/50 text-green-800 p-2.5 rounded-lg border border-green-200 flex items-center">
                                  <span className="mr-1.5 animate-pulse">🟢</span>
                                  <span><strong>Current Focus:</strong> Follow diet guidelines and avoid physical exhaustion today.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Component */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow bg-gray-50 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Page Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-3 sm:mb-4">
              Ayurvedic Therapies
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Explore, assign, and track traditional Panchakarma therapies for holistic healing and wellness
            </p>
          </div>

          {/* Tab Navigation - Mobile responsive */}
          <div className="mb-6 sm:mb-8">
            <div className="flex gap-3 bg-gray-100 p-2 rounded-2xl mx-4 sm:mx-auto sm:max-w-fit overflow-x-auto scrollbar-hide">
              <TabButton
                tabName="catalogue"
                icon={BookOpenIcon}
                title="Catalogue"
                isActive={activeTab === 'catalogue'}
                onClick={setActiveTab}
              />
              <TabButton
                tabName="assign"
                icon={ClipboardDocumentListIcon}
                title="Assign"
                isActive={activeTab === 'assign'}
                onClick={setActiveTab}
              />
              <TabButton
                tabName="track"
                icon={ChartBarIcon}
                title="Track"
                isActive={activeTab === 'track'}
                onClick={setActiveTab}
              />
            </div>
          </div>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Therapies;
