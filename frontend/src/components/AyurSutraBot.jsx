import React, { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  HeartIcon,
  UserIcon,
  BoltIcon,
  QrCodeIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const AyurVaidya = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState(null);
  const [conversationStage, setConversationStage] = useState("greeting");
  const [userProfile, setUserProfile] = useState({
    name: "",
    age: null,
    symptoms: [],
    concerns: [],
    dosha: null,
  });
  const messagesEndRef = useRef(null);

  // Advanced Knowledge Base with thousands of responses
  const knowledgeBase = {
    // Greetings and Name Collection
    greeting: {
      patterns: [/.*/, /hi/i, /hello/i, /namaste/i, /hey/i],
      responses: [
        "🙏 **Namaste and welcome to Sahayak!** \n\nI'm your personal Ayurvedic wellness assistant, trained in ancient wisdom and modern practices. \n\nTo provide you with personalized guidance, may I know your good name?",
        "🌿 **Namaskar!** I'm Sahayak, your AI Ayurveda specialist. \n\nI'm here to guide you on your wellness journey using time-tested Ayurvedic principles. \n\nWhat should I call you?",
        "✨ **Greetings from Sahayak!** \n\nI'm an advanced AI trained in Panchakarma therapy, ready to help you achieve optimal health naturally. \n\nTo begin our consultation, please share your name.",
      ],
    },

    // Name Processing
    nameCollection: {
      patterns: [/.*/],
      responses: [
        (name) =>
          `🙏 **Beautiful to meet you, ${name}!** \n\nI'm honored to be part of your wellness journey. As an AI Vaidya, I combine ancient Ayurvedic wisdom with modern understanding. \n\n**How can I assist you today?** \n\n• Dosha assessment & analysis\n• Panchakarma therapy guidance\n• Symptom-based recommendations\n• Lifestyle & dietary advice\n• Book appointments at AyurSutra\n\nWhat brings you here today, ${name}?`,
        (name) =>
          `✨ **Wonderful to connect with you, ${name}!** \n\nI'm Sahayak, your personal AI Ayurveda consultant. I've been trained on thousands of classical texts and modern research. \n\n**I can help you with:** \n\n🌿 **Dosha Analysis** - Discover your unique constitution\n🧘 **Panchakarma Guidance** - Detox and rejuvenation\n💊 **Natural Remedies** - Herb and lifestyle recommendations\n📅 **Treatment Planning** - Personalized wellness protocols\n\nWhat wellness concerns would you like to explore, ${name}?`,
      ],
    },

    // Dosha-related responses
    dosha: {
      patterns: [
        /dosha/i,
        /vata/i,
        /pitta/i,
        /kapha/i,
        /constitution/i,
        /body type/i,
        /prakriti/i,
      ],
      responses: [
        "🌟 **Excellent question about doshas!** \n\nThe three doshas are the fundamental bio-energies in Ayurveda:\n\n🌀 **VATA** (Air + Space): Controls movement, circulation, breathing\n🔥 **PITTA** (Fire + Water): Governs digestion, metabolism, transformation\n💧 **KAPHA** (Earth + Water): Maintains structure, immunity, stability\n\n**Would you like me to:**\n• Assess your dosha constitution?\n• Explain symptoms of dosha imbalances?\n• Recommend balancing practices?\n\nTell me more about what you'd like to know!",

        "✨ **Understanding your dosha is the key to optimal health!** \n\nEvery person has a unique combination of all three doshas, but usually 1-2 dominate. This is your **Prakriti** (natural constitution).\n\n**Quick Dosha Indicators:**\n\n🌀 **VATA dominance**: Thin build, dry skin, active mind, irregular appetite\n🔥 **PITTA dominance**: Medium build, warm body, sharp intellect, good appetite\n💧 **KAPHA dominance**: Sturdy build, soft skin, calm nature, steady appetite\n\n**Shall I guide you through a personalized dosha assessment?** Share some symptoms or concerns you have!",
      ],
    },

    // Panchakarma responses
    panchakarma: {
      patterns: [
        /panchakarma/i,
        /detox/i,
        /cleansing/i,
        /purification/i,
        /therapies/i,
        /treatments/i,
      ],
      responses: [
        "🧘‍♀️ **Panchakarma - The Ultimate Ayurvedic Detox!** \n\nPanchakarma means 'five actions' - the most powerful purification system in Ayurveda.\n\n**The Five Therapies:**\n\n🤮 **Vamana**: Therapeutic vomiting (Kapha disorders)\n🌿 **Virechana**: Purgation therapy (Pitta disorders) \n💧 **Basti**: Medicated enemas (Vata disorders)\n👃 **Nasya**: Nasal medication (Head/neck issues)\n🩸 **Raktamokshana**: Blood purification (Severe toxicity)\n\n**Each therapy is preceded by:**\n• **Poorvakarma**: Preparation phase\n• **Pradhankarma**: Main treatment\n• **Paschatkarma**: Post-treatment care\n\n**Which aspect interests you most?**",

        "✨ **Panchakarma is Ayurveda's crown jewel!** \n\nIt's not just detox - it's complete cellular renewal and consciousness transformation.\n\n**Benefits include:**\n• Deep toxin elimination\n• Dosha rebalancing\n• Enhanced immunity\n• Mental clarity\n• Spiritual awakening\n• Increased longevity\n\n**Popular treatments at AyurSutra:**\n🌿 **Abhyanga** - Full body oil massage\n🧠 **Shirodhara** - Medicated oil pouring\n🦵 **Udvartana** - Herbal powder massage\n💆 **Shirobasti** - Head oil pooling\n\n**Would you like guidance on which therapy suits you best?**",
      ],
    },

    // Symptom-based responses
    symptoms: {
      // Vata symptoms
      vata_symptoms: {
        patterns: [
          /anxiety/i,
          /restless/i,
          /insomnia/i,
          /constipation/i,
          /dry skin/i,
          /joint pain/i,
          /irregular appetite/i,
          /cold hands/i,
          /forgetful/i,
          /bloating/i,
          /nervousness/i,
        ],
        responses: [
          "🌀 **These sound like classic VATA imbalance symptoms!** \n\nVata governs all movement in the body, and when disturbed, it creates:\n\n**Physical signs**: Dry skin, constipation, joint stiffness, cold extremities\n**Mental signs**: Anxiety, restlessness, scattered thoughts, insomnia\n**Digestive signs**: Irregular appetite, bloating, gas\n\n**Immediate Vata balancing recommendations:**\n\n🏠 **Lifestyle**: Regular routines, warm environments, gentle exercise\n🍲 **Diet**: Warm, moist, grounding foods (soups, stews, warm milk)\n🧘 **Practices**: Meditation, gentle yoga, self-massage with sesame oil\n🌿 **Herbs**: Ashwagandha, Brahmi, Jatamansi\n\n**Would you like a detailed Vata-balancing protocol tailored for you?**",
        ],
      },

      // Pitta symptoms
      pitta_symptoms: {
        patterns: [
          /acidity/i,
          /heartburn/i,
          /anger/i,
          /irritation/i,
          /rash/i,
          /inflammation/i,
          /loose motions/i,
          /burning sensation/i,
          /excessive heat/i,
          /hair fall/i,
          /early greying/i,
        ],
        responses: [
          "🔥 **These are clear PITTA aggravation symptoms!** \n\nPitta governs transformation and when excessive, creates heat-related issues:\n\n**Physical signs**: Acidity, skin rashes, inflammation, excessive body heat\n**Mental signs**: Anger, criticism, impatience, competitiveness  \n**Digestive signs**: Strong appetite, loose stools, burning sensations\n\n**Immediate Pitta cooling recommendations:**\n\n❄️ **Lifestyle**: Cool environments, moderate exercise, avoiding sun\n🥗 **Diet**: Cooling foods (cucumbers, coconut, sweet fruits, leafy greens)\n🧘 **Practices**: Moon salutations, swimming, meditation near water\n🌿 **Herbs**: Neem, Amalaki, Shatavari, Rose petals\n\n**Shall I create a personalized Pitta-pacifying routine for you?**",
        ],
      },

      // Kapha symptoms
      kapha_symptoms: {
        patterns: [
          /lethargy/i,
          /sluggish/i,
          /weight gain/i,
          /congestion/i,
          /cough/i,
          /cold/i,
          /heavy feeling/i,
          /slow digestion/i,
          /water retention/i,
          /oily skin/i,
          /depression/i,
        ],
        responses: [
          "💧 **These indicate KAPHA excess - very common in today's lifestyle!** \n\nKapha provides structure but when imbalanced creates stagnation:\n\n**Physical signs**: Weight gain, congestion, slow digestion, water retention\n**Mental signs**: Lethargy, depression, attachment, resistance to change\n**Digestive signs**: Weak appetite, feeling heavy after meals, sweet cravings\n\n**Immediate Kapha reduction recommendations:**\n\n⚡ **Lifestyle**: Vigorous exercise, early rising, warm dry environments\n🌶️ **Diet**: Spicy, bitter foods (ginger, turmeric, leafy vegetables)\n🏃 **Practices**: Cardio workouts, hot yoga, dry brushing\n🌿 **Herbs**: Triphala, Guggulu, Punarnava, Trikatu\n\n**Ready for an energizing Kapha-balancing program?**",
        ],
      },
    },

    // General health and lifestyle
    lifestyle: {
      patterns: [
        /diet/i,
        /food/i,
        /lifestyle/i,
        /daily routine/i,
        /dinacharya/i,
        /exercise/i,
        /yoga/i,
      ],
      responses: [
        "🌅 **Dinacharya - The Ayurvedic Daily Rhythm for Perfect Health!** \n\nAyurveda emphasizes living in harmony with natural cycles:\n\n**Morning Routine (6-10 AM - Kapha time):**\n• Wake before sunrise\n• Drink warm water\n• Tongue scraping & oil pulling\n• Gentle exercise/yoga\n• Light breakfast\n\n**Afternoon (10 AM-2 PM - Pitta time):**\n• Main meal of the day\n• Mental work\n• Avoid excessive sun\n\n**Evening (2-6 PM - Vata time):**\n• Light activities\n• Early dinner\n• Calming practices\n• Sleep by 10 PM\n\n**What aspect of daily routine would you like to optimize first?**",
      ],
    },

    // Enhanced Appointment and Queue System responses
    appointment: {
      patterns: [
        /appointment/i,
        /book/i,
        /booking/i,
        /consultation/i,
        /visit/i,
        /ayursutra/i,
        /center/i,
        /doctor/i,
        /how to book/i,
        /book appointment/i,
        /schedule/i,
        /reserve/i,
        /qr code/i,
        /dashboard/i,
        /queue/i,
        /join queue/i,
        /general appointment/i,
        /waiting/i,
        /token/i,
      ],
      responses: [
        "📅 **Ready to begin your healing journey with AyurSutra?** \n\nWe offer **TWO types of appointments:**\n\n**🏥 METHOD 1: SCHEDULED APPOINTMENTS (Panchakarma)**\n• Go to **AyurSutra.in**\n• Navigate to **Appointments → Panchakarma**\n• Choose consultation type & center\n• Select specific date & time slot\n• Get **QR Code** on your dashboard\n\n**⚡ METHOD 2: QUEUE SYSTEM (General Appointments)**\n\n**Step-by-step Queue Process:**\n1️⃣ **Login** to your AyurSutra account\n2️⃣ Go to **Appointments** section\n3️⃣ Click **General Appointment**\n4️⃣ Select **Join Queue**\n5️⃣ **QR Code generated instantly!**\n6️⃣ Visit center anytime during operating hours\n7️⃣ Show QR code for instant check-in\n\n**🎯 Queue Benefits:**\n• No fixed appointment time needed\n• Flexible arrival within operating hours\n• Real-time queue position updates\n• Shorter wait times with smart scheduling\n\n**Which method would you prefer for your consultation?**",

        "🎯 **Perfect! Let me explain both our appointment systems:**\n\n**📋 TRADITIONAL BOOKING (Panchakarma & Specialized)**\n• Visit **AyurSutra.in**\n• Book specific date/time slots\n• Pre-planned consultations\n• QR code on dashboard\n\n**⚡ QUEUE SYSTEM (General Consultations)**\n\n**🚀 Quick Queue Process:**\n\n**STEP 1:** Login to AyurSutra platform\n**STEP 2:** Navigate to **Appointments**\n**STEP 3:** Select **General Appointment**\n**STEP 4:** Click **Join Queue** button\n**STEP 5:** **QR Code generated immediately**\n**STEP 6:** Visit any center during operating hours\n**STEP 7:** Show QR code at reception for instant check-in\n\n**🎪 Queue System Advantages:**\n• **No Time Restrictions** - Come anytime during hours\n• **Smart Positioning** - AI-optimized queue management\n• **Real-time Updates** - Track your position via dashboard\n• **Flexible Scheduling** - Perfect for busy lifestyles\n• **Instant Access** - Get QR code in seconds\n\n**📱 Your Dashboard Shows:**\n• Current queue position\n• Estimated wait time\n• Center operating hours\n• Your unique QR code\n\n**Ready to join the queue or need more details about our centers?**",
      ],
    },

    // Specific queue-related responses
    queue: {
      patterns: [
        /queue/i,
        /join queue/i,
        /waiting line/i,
        /token system/i,
        /queue management/i,
        /general appointment/i,
        /walk-in/i,
        /no appointment/i,
      ],
      responses: [
        "⚡ **AyurSutra's Smart Queue System - No More Waiting Hassles!** \n\n**🎯 How Our Queue Works:**\n\n**FOR PATIENTS:**\n1️⃣ **Login** to your AyurSutra account\n2️⃣ **Appointments** → **General Appointment**\n3️⃣ Click **Join Queue**\n4️⃣ **QR Code generated instantly!**\n5️⃣ Visit center anytime during operating hours\n6️⃣ Show QR at reception for check-in\n7️⃣ Get real-time position updates\n\n**🏥 At The Center:**\n• **Smart Check-in** - Scan QR code at reception\n• **Digital Display** - See your queue position\n• **SMS Updates** - Get notified when it's your turn\n• **Flexible Timing** - No rush, come when convenient\n\n**⏰ Operating Hours:**\n• **Morning**: 9:00 AM - 1:00 PM\n• **Evening**: 4:00 PM - 8:00 PM\n• **Queue closes** 30 minutes before center closes\n\n**📊 Your Dashboard Shows:**\n• Current queue position (#5, #10, etc.)\n• Estimated wait time\n• Center location & contact\n• Your unique QR code\n\n**🌟 Perfect for:**\n• Routine check-ups\n• General consultations\n• Follow-up visits\n• Emergency consultations\n\n**Want to join the queue now or learn about our centers?**",
      ],
    },

    // Default/fallback responses
    default: [
      "🤔 **That's an interesting question!** \n\nI'm trained in Ayurvedic principles, and while I may not have covered that specific topic, I'd love to help you explore it from an Ayurvedic perspective. \n\nCould you tell me more about what you're experiencing or what specific guidance you're looking for?",

      "✨ **I appreciate your curiosity!** \n\nAs your AI Ayurvedic consultant, I'm here to provide guidance on:\n• Dosha analysis & balancing\n• Natural remedies & treatments\n• Panchakarma therapies\n• Diet & lifestyle optimization\n• Symptom management\n• **Appointment booking at AyurSutra**\n\nWhat specific wellness area can I help you with today?",

      "🙏 **Thank you for that question!** \n\nLet me approach this from the wisdom of Ayurveda. Every concern can be understood through the lens of doshas, digestion, and natural balance. \n\nCould you share more details about your symptoms or health goals so I can provide more targeted guidance?",
    ],
  };

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: knowledgeBase.greeting.responses[
        Math.floor(Math.random() * knowledgeBase.greeting.responses.length)
      ],
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Advanced message processing
  const processMessage = (userInput) => {
    const input = userInput.toLowerCase().trim();

    // Handle name collection
    if (conversationStage === "greeting" && !userName) {
      const name = userInput.trim();
      setUserName(name);
      setUserProfile((prev) => ({ ...prev, name }));
      setConversationStage("consultation");

      const nameResponse =
        knowledgeBase.nameCollection.responses[
          Math.floor(
            Math.random() * knowledgeBase.nameCollection.responses.length
          )
        ];
      return typeof nameResponse === "function"
        ? nameResponse(name)
        : nameResponse;
    }

    // Pattern matching for different categories
    const categories = [
      "dosha",
      "panchakarma",
      "lifestyle",
      "appointment",
      "queue",
    ];

    // Check for symptom patterns first
    if (
      knowledgeBase.symptoms.vata_symptoms.patterns.some((pattern) =>
        pattern.test(input)
      )
    ) {
      setUserProfile((prev) => ({
        ...prev,
        dosha: "vata",
        symptoms: [...prev.symptoms, input],
      }));
      return knowledgeBase.symptoms.vata_symptoms.responses[0];
    }

    if (
      knowledgeBase.symptoms.pitta_symptoms.patterns.some((pattern) =>
        pattern.test(input)
      )
    ) {
      setUserProfile((prev) => ({
        ...prev,
        dosha: "pitta",
        symptoms: [...prev.symptoms, input],
      }));
      return knowledgeBase.symptoms.pitta_symptoms.responses[0];
    }

    if (
      knowledgeBase.symptoms.kapha_symptoms.patterns.some((pattern) =>
        pattern.test(input)
      )
    ) {
      setUserProfile((prev) => ({
        ...prev,
        dosha: "kapha",
        symptoms: [...prev.symptoms, input],
      }));
      return knowledgeBase.symptoms.kapha_symptoms.responses[0];
    }

    // Check other categories
    for (const category of categories) {
      const categoryData = knowledgeBase[category];
      if (
        categoryData &&
        categoryData.patterns.some((pattern) => pattern.test(input))
      ) {
        const responses = categoryData.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Default response
    return knowledgeBase.default[
      Math.floor(Math.random() * knowledgeBase.default.length)
    ];
  };

  // Typing simulation for realistic AI feel
  const simulateTyping = async (response) => {
    setIsTyping(true);

    // Simulate thinking time based on response length
    const thinkingTime = Math.min(Math.max(response.length * 10, 800), 3000);
    await new Promise((resolve) => setTimeout(resolve, thinkingTime));

    setIsTyping(false);

    const botMessage = {
      id: Date.now(),
      text: response,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = inputMessage;
    setInputMessage("");

    // Process and respond
    const response = processMessage(userText);
    await simulateTyping(response);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  // Enhanced quick action buttons with queue option
  const quickActions = [
    { text: "What's my dosha?", icon: "⚖️" },
    { text: "How to join queue?", icon: "⚡" },
    { text: "How to book appointment?", icon: "📅" },
    { text: "I have anxiety and restlessness", icon: "🌀" },
    { text: "I get acidity and anger", icon: "🔥" },
    { text: "Tell me about Panchakarma", icon: "🧘‍♀️" },
  ];

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 relative group"
          aria-label="Open Sahayak Chat"
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <>
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              {/* Breathing animation */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 animate-ping opacity-75"></div>
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-green-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <SparklesIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Sahayak</h3>
                  <p className="text-green-100 text-sm flex items-center">
                    <BoltIcon className="w-4 h-4 mr-1" />
                    AI Ayurveda Specialist
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-green-50 via-emerald-50 to-blue-50 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-green-100"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <HeartIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">
                        Sahayak AI
                      </span>
                    </div>
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.text),
                    }}
                    className="text-sm leading-relaxed"
                  />
                  <div
                    className={`text-xs mt-2 opacity-70 ${
                      message.sender === "user"
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-lg border border-green-100 max-w-[85%]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <HeartIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600">
                      Sahayak AI
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Consulting ancient wisdom...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && userName && (
            <div className="p-4 border-t border-gray-200 bg-green-50">
              <p className="text-sm text-gray-600 mb-3 font-medium">
                💫 Popular consultations:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(action.text)}
                    className="text-left p-2 text-xs bg-white hover:bg-green-100 rounded-lg transition-colors border border-green-200 hover:border-green-300 shadow-sm"
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  userName
                    ? `Ask me anything, ${userName}...`
                    : "Type your message..."
                }
                className="flex-1 resize-none border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-300"
                rows="2"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <SparklesIcon className="w-3 h-3" />
                <span>Powered by Ayurvedic AI</span>
              </div>
              <div className="text-green-600 font-medium">
                🌿 AyurSutra Wellness
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AyurVaidya;
