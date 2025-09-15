import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: "Vamana",
    emoji: "🤮",
    image: "/assets/vamana.jpg",
    desc: "Therapeutic Emesis\nDetoxifies the respiratory & digestive tract,\nexpelling excess Kapha for lasting rejuvenation."
  },
  {
    title: "Virechana",
    emoji: "🌿",
    image: "/assets/virechana.jpg",
    desc: "Herbal Purgation\nCleanses the liver & intestines,\nbalancing Pitta dosha and igniting your inner fire."
  },
  {
    title: "Basti",
    emoji: "💧",
    image: "/assets/basti.jpg",
    desc: "Medicated Enema\nThe master healer balancing Vata,\nstrengthening nerves, joints, and cleansing deeply."
  },
  {
    title: "Nasya",
    emoji: "👃",
    image: "/assets/nasya.jpg",
    desc: "Nasal Remedy\nDelivers potent herbs to your mind, nerves, and senses,\nclearing head and spirit."
  },
  {
    title: "Raktamokshana",
    emoji: "🩸",
    image: "/assets/raktamokshana.jpg",
    desc: "Blood Cleansing\nReleases toxins, purifies skin & circulatory system,\nrestoring vibrancy within."
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent(c => (c + 1) % slides.length);

  return (
    <section className="relative flex items-center justify-center pt-20 pb-12 sm:pt-28 sm:pb-20 lg:py-32 bg-gradient-to-tr from-emerald-50 to-green-100 overflow-x-hidden font-[Poppins]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-t from-emerald-100/40 via-green-50/60 to-transparent" />
      </div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-10 px-4 z-10">

        {/* Text Block */}
        <div className="flex-1 relative flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
          {/* Watermark Logo */}
          <img
            src="/assets/logo.jpg"
            alt="AyurSutra Symbol"
           className="absolute opacity-10 w-100 sm:w-500 lg:w-800 -top-10 left--122 lg:left-50-translate-x-1/2 lg:translate-x-0 pointer-events-none select-none"
          />

       <h1 className="relative text-3xl sm:text-4xl lg:text-5xl font-cormorant tracking-tight text-transparent bg-clip-text bg-gradient-to-tr from-emerald-700 via-green-700 to-emerald-400 mt-0">
  The Sacred Science of Panchakarma<br />
            <span className="text-lg sm:text-2xl font-semibold bg-clip-text text-emerald-700">
              Detox. Balance. Rejuvenate.
            </span>
          </h1>
          <p className="relative mt-6 text-gray-700 text-lg sm:text-xl font-medium max-w-xl">
            Discover five ancient rituals to heal every layer of your being—with a modern platform for expert guidance, progress, and care.
          </p>
          <div className="relative mt-8">
            <Link
              to="/therapies"
              className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-700 hover:to-green-700 text-white px-7 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Explore All Therapies <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Slideshow */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-[85vw] max-w-xs min-h-[320px] sm:max-w-sm rounded-2xl overflow-hidden shadow-xl border-4 border-emerald-30bg-white">
            <img
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-44 sm:h-52 object-cover object-center rounded-t-2xl transition duration-500"
              loading="lazy"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="p-5 flex flex-col items-center bg-white">
              {/* Title + Emoji */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl sm:text-4xl">{slides[current].emoji}</span>
                <h2 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">
                  {slides[current].title}
                </h2>
              </div>
              {/* Description */}
              <div className="text-emerald-800 text-center text-sm sm:text-base leading-relaxed font-[Merriweather] italic whitespace-pre-line">
                {slides[current].desc}
              </div>
            </div>

            {/* Slide Controls */}
            <button
              className="absolute top-1/2 -left-2 bg-gradient-to-tr from-green-50 to-emerald-100 rounded-full p-2 shadow hover:scale-110 transition hidden sm:block"
              onClick={prevSlide}
              aria-label="Previous Panchakarma"
            >
              <ChevronLeftIcon className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              className="absolute top-1/2 -right-2 bg-gradient-to-tr from-green-50 to-emerald-100 rounded-full p-2 shadow hover:scale-110 transition hidden sm:block"
              onClick={nextSlide}
              aria-label="Next Panchakarma"
            >
              <ChevronRightIcon className="w-5 h-5 text-emerald-600" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-1 mt-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full ${idx === current ? 'bg-emerald-600' : 'bg-emerald-200'} transition`}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setCurrent(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
