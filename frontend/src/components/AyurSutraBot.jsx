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
  PhoneIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

// Support configuring RAG service port via env or default to 8001
const RAG_API_URL = (import.meta.env.VITE_RAG_API_URL || "http://localhost:8001").replace(/\/$/, "") + "/chat";

const AyurVaidya = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState(null);
  const [conversationStage, setConversationStage] = useState("greeting"); // greeting -> consultation
  const [patientId, setPatientId] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const messagesEndRef = useRef(null);

  const [sessionId, setSessionId] = useState(() => {
    let id = sessionStorage.getItem("ayursutra_chat_session");
    if (!id) {
      id = "session_" + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("ayursutra_chat_session", id);
    }
    return id;
  });

  // Check login state and load initial message
  useEffect(() => {
    const userRaw = localStorage.getItem("ayursutra_user");
    let name = null;
    let pid = null;

    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        pid = user.id || user.patient_id || user.patientId || null;
        name = user.name || user.first_name || null;
      } catch (e) {
        console.error("Error parsing logged in user details", e);
      }
    }

    setPatientId(pid);

    let welcomeText = "";
    if (name) {
      setUserName(name);
      setConversationStage("consultation");
      welcomeText = `🙏 **Namaste, ${name}!** \n\nWelcome back to Sahayak. As you are logged in, I can query your profile, upcoming appointments, and queue status in real-time.\n\n**How can I assist you today?**\n• Check my next appointment\n• Start interactive Dosha quiz\n• Ask about therapies & FAQs\n• Hinglish commands (e.g. "Mujhe Basti therapy batao")`;
    } else {
      welcomeText = "🙏 **Namaste and welcome to Sahayak!** \n\nI'm your personal Ayurvedic wellness assistant. To begin our personalized consultation, may I know your good name?";
    }

    const welcomeMessage = {
      id: "welcome",
      text: welcomeText,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle message sending
  const handleSendMessage = async (customText = null) => {
    const userText = (customText || inputMessage).trim();
    if (!userText) return;

    // Add user message to UI
    const userMessage = {
      id: Date.now() + "-user",
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // If still in greeting stage (no username set), treat this message as their name
    if (conversationStage === "greeting" && !userName) {
      setUserName(userText);
      setConversationStage("consultation");
      setIsTyping(true);

      setTimeout(() => {
        const greetBotMessage = {
          id: Date.now() + "-bot",
          text: `🙏 **Pleasure to meet you, ${userText}!** \n\nI'm Sahayak, your AI Ayurvedic assistant. I can guide you on your wellness journey.\n\nAsk me anything! Or click a quick action below to start.`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, greetBotMessage]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // Call RAG API
    setIsTyping(true);

    try {
      const response = await fetch(RAG_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userText,
          session_id: sessionId,
          patient_id: patientId,
        }),
      });

      if (!response.ok) {
        throw new Error("RAG API request failed");
      }

      const data = await response.json();
      
      setIsEmergency(!!data.is_emergency);
      setIsQuizActive(!!data.is_quiz);

      const botMessage = {
        id: Date.now() + "-bot",
        text: data.answer,
        sender: "bot",
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error querying Sahayak RAG chatbot:", error);
      const errorMessage = {
        id: Date.now() + "-bot-err",
        text: "😔 *I am having trouble connecting to my Ayurvedic knowledge core right now.* Please verify that the `rag-service` backend is running and try again, or consult the clinic staff directly.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

  // Popular queries
  const quickActions = [
    { text: "I want to take the Dosha Quiz", icon: "📝" },
    { text: "When is my next appointment?", icon: "📅" },
    { text: "Tell me about Panchakarma benefits", icon: "🧘‍♀️" },
    { text: "How does the smart queue work?", icon: "⚡" },
    { text: "Pitta imbalance remedies?", icon: "🔥" }
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
              {/* Ping animation */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 animate-ping opacity-75"></div>
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-green-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${isEmergency ? "from-red-600 to-rose-700 animate-pulse" : "from-green-600 to-emerald-600"} text-white p-6 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <SparklesIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{isEmergency ? "Emergency Sahayak" : "Sahayak"}</h3>
                  <p className="text-green-100 text-sm flex items-center">
                    <BoltIcon className="w-4 h-4 mr-1" />
                    Advanced Ayurvedic AI
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

          {/* Emergency Alert Banner */}
          {isEmergency && (
            <div className="bg-red-50 border-b border-red-200 p-3 flex items-center justify-between animate-bounce">
              <span className="text-xs text-red-700 font-semibold flex items-center">
                ⚠️ POTENTIAL MEDICAL EMERGENCY DETECTED
              </span>
              <a
                href="tel:+919876543210"
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase font-bold py-1 px-3 rounded-lg shadow flex items-center space-x-1"
              >
                <PhoneIcon className="w-3 h-3" />
                <span>Call Clinic</span>
              </a>
            </div>
          )}

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

                  {/* Document Sources grounding indicators */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center text-[10px] text-gray-400">
                      <BookOpenIcon className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      <span>Retrieved from: {message.sources.join(", ")}</span>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 opacity-70 ${
                      message.sender === "user"
                        ? "text-blue-200"
                        : "text-gray-400"
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
                    <span className="text-xs text-gray-500">
                      {isQuizActive ? "Scoring your Dosha profile..." : "Consulting ancient wisdom..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Dosha Quiz Options Container */}
          {isQuizActive && !isTyping && (
            <div className="p-4 border-t border-gray-200 bg-emerald-50 flex justify-around">
              <button
                onClick={() => handleSendMessage("A")}
                className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-2 px-6 rounded-xl shadow transition duration-200 text-sm"
              >
                🅰️ Option A
              </button>
              <button
                onClick={() => handleSendMessage("B")}
                className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-2 px-6 rounded-xl shadow transition duration-200 text-sm"
              >
                🅱️ Option B
              </button>
              <button
                onClick={() => handleSendMessage("C")}
                className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-2 px-6 rounded-xl shadow transition duration-200 text-sm"
              >
                🆃 Option C
              </button>
            </div>
          )}

          {/* Quick Actions (only visible at startup or if quiz is not active) */}
          {messages.length <= 2 && userName && !isQuizActive && (
            <div className="p-4 border-t border-gray-200 bg-green-50">
              <p className="text-xs text-gray-500 mb-2.5 font-semibold uppercase tracking-wider flex items-center">
                <SparklesIcon className="w-3.5 h-3.5 mr-1 text-emerald-500 animate-pulse" />
                Suggested Consultations
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(action.text)}
                    className="text-left p-2.5 text-xs bg-white hover:bg-green-100 rounded-xl transition-colors border border-green-200 hover:border-green-300 shadow-sm flex items-center"
                  >
                    <span className="mr-2 text-sm">{action.icon}</span>
                    <span className="font-medium text-gray-700">{action.text}</span>
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
                    ? `Consult Sahayak, ${userName}...`
                    : "Type your name to begin..."
                }
                className="flex-1 resize-none border-2 border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-300"
                rows="2"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
              <div className="flex items-center space-x-1">
                <SparklesIcon className="w-3 h-3 text-emerald-500 animate-spin-slow" />
                <span>Grounded in Ayurvedic Texts</span>
              </div>
              <div className="text-green-700 font-semibold">
                🌿 AyurSutra Health
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AyurVaidya;
