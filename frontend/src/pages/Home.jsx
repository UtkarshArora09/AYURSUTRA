import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/Hero/HeroSection";
import AyurSutraBot from "../components/AyurSutraBot"; // Import the AyurSutraBot component

const testimonials = [
  {
    name: "Priya Sharma",
    text: "Ayurveda brought balance and vitality back to my life with personalized care.",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    rating: 5,
  },
  {
    name: "Rohit Patil",
    text: "Easy appointment booking and authentic treatments made my wellness journey smooth.",
    avatar: "https://randomuser.me/api/portraits/men/43.jpg",
    rating: 4,
  },
  {
    name: "Sarah D'Souza",
    text: "Expert practitioners and effective therapies—highly recommend Ayurvedic healing here.",
    avatar: "https://randomuser.me/api/portraits/women/77.jpg",
    rating: 5,
  },
];

const highlights = [
  {
    icon: <SparklesIcon className="w-10 h-10 text-green-600 animate-pulse" />,
    title: "Authentic Treatments",
    desc: "Rooted deeply in classical Ayurveda, every therapy is time-tested and personalized.",
  },
  {
    icon: <UserGroupIcon className="w-10 h-10 text-emerald-600 animate-bounce" />,
    title: "Expert Care",
    desc: "Work with certified Ayurveda doctors with decades of clinical experience and compassion.",
  },
  {
    icon: <Cog6ToothIcon className="w-10 h-10 text-green-500 animate-spin-slow" />,
    title: "Tech Powered",
    desc: "Seamless booking, patient management, and progress tracking on a user-friendly platform.",
  },
];

const faqItems = [
  {
    question: "What is Panchakarma?",
    answer:
      "Panchakarma is a set of five classic Ayurvedic detoxification therapies designed to cleanse the body and balance the doshas.",
  },
  {
    question: "How do I book a therapy?",
    answer:
      "You can easily book sessions via our platform, choosing from available therapies and scheduling at your convenience.",
  },
  {
    question: "Is Ayurvedic treatment safe?",
    answer:
      "All treatments are administered by certified doctors ensuring safety, personalized care, and ongoing support.",
  },
];

const Home = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-white">
    <Header />

    {/* Hero Section */}
    <HeroSection />

    {/* Why Choose Us */}
    <section className="max-w-7xl mx-auto py-20 px-6 sm:px-10">
      <h2 className="text-center text-4xl font-extrabold text-green-900 mb-16 leading-tight">
        Why Choose AyurSutra for Your Wellness Journey?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
        {highlights.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-xl p-10 shadow-lg hover:shadow-2xl transform transition duration-300 ease-in-out"
          >
            <div className="mb-6">{icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-green-700">{title}</h3>
            <p className="text-gray-700">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Featured Therapies */}
    <section className="max-w-7xl mx-auto px-6 sm:px-10 mb-24">
      <h2 className="text-3xl text-center font-bold text-green-900 mb-10">
        Explore Our Signature Panchakarma Therapies
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          {
            title: "Vamana",
            icon: "🤮",
            description:
              "Therapeutic vomiting to purge excess kapha and toxins, rejuvenating respiratory & digestive systems.",
          },
          {
            title: "Virechana",
            icon: "🌿",
            description:
              "Herbal purgation therapy to detoxify the liver and balance pitta dosha for digestive harmony.",
          },
          {
            title: "Basti",
            icon: "💧",
            description:
              "Specialized medicated enemas to purify the colon, balance vata, and strengthen nerves.",
          },
          {
            title: "Nasya",
            icon: "👃",
            description:
              "Nasal therapy using oils for cleansing the head region and enhancing sensory function.",
          },
        ].map(({ title, icon, description }) => (
          <div
            key={title}
            className="rounded-xl bg-white shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition duration-300"
          >
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-green-800">{title}</h3>
            <p className="text-gray-700">{description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Video Section */}
    <section className="bg-green-50 pb-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-green-900 mb-6">
          Learn More About Ayurveda and Panchakarma
        </h2>
        <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/bFtx2kurEvw"
            title="Ayurveda Introduction"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="max-w-7xl mx-auto py-24 px-6 sm:px-10 bg-gradient-to-tr from-emerald-50 to-green-50 rounded-xl">
      <h2 className="text-center text-4xl font-extrabold text-green-900 mb-16">
        What Our Patients Are Saying
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {testimonials.map(({ avatar, name, text, rating }) => (
          <div
            key={name}
            className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center text-center"
          >
            <img
              src={avatar}
              alt={`${name}'s photo`}
              className="w-20 h-20 rounded-full border-4 border-green-200 mb-6 object-cover"
              loading="lazy"
            />
            <h3 className="text-xl font-semibold text-green-800">{name}</h3>
            <p className="text-gray-700 italic mt-2">"{text}"</p>
            <div className="flex mt-4 space-x-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <StarIcon
                  key={idx}
                  className={`w-6 h-6 ${
                    idx < rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* FAQ Section */}
    <section className="max-w-4xl mx-auto px-6 sm:px-10 py-20">
      <h2 className="text-3xl font-bold text-green-900 mb-12 text-center">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {[
          {
            question: "What treatments do you offer?",
            answer:
              "We offer all five classical Panchakarma therapies personalized to your Ayurvedic type.",
          },
          {
            question: "How safe are these therapies?",
            answer:
              "All treatments are performed by certified Ayurvedic doctors ensuring safety and comfort.",
          },
          {
            question: "Can I book online?",
            answer:
              "Yes, our platform allows for easy booking and management of appointments.",
          },
        ].map(({ question, answer }) => (
          <details key={question} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <summary className="font-semibold text-green-800 text-lg">{question}</summary>
            <p className="mt-2 text-gray-700">{answer}</p>
          </details>
        ))}
      </div>
    </section>

    {/* Call to Action */}
    <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-24 px-6 text-center text-white">
      <h2 className="text-4xl font-extrabold mb-4">Start Your Healing Journey Today</h2>
      <p className="text-xl max-w-3xl mx-auto mb-8">
        Experience authentic Ayurveda like never before. Join the thousands who trust AyurSutra.
      </p>
      <Link
        to="/patients/register"
        className="inline-block bg-white text-green-700 font-bold px-12 py-4 rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300"
      >
        Register Now <ArrowRightIcon className="inline w-6 h-6 ml-2" />
      </Link>
    </section>

    <Footer />

    {/* AyurSutra Bot - Floating Chat Widget */}
    <AyurSutraBot />
  </div>
);

export default Home;
