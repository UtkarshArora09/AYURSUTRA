import React, { useState, useEffect } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "Vamana",
    emoji: "🤮",
    image: "/assets/vamana.jpg"
  },
  {
    title: "Virechana",
    emoji: "🌿",
    image: "/assets/virechana.jpg"
  },
  {
    title: "Basti",
    emoji: "💧",
    image: "/assets/basti.jpg"
  },
  {
    title: "Nasya",
    emoji: "👃",
    image: "/assets/nasya.jpg"
  },
  {
    title: "Raktamokshana",
    emoji: "🩸",
    image: "/assets/raktamokshana.jpg"
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((c) => (c + 1) % slides.length);

  const getIndices = () => {
    const prev = (current - 1 + slides.length) % slides.length;
    const next = (current + 1) % slides.length;
    return [prev, current, next];
  };
  const [prevIdx, currIdx, nextIdx] = getIndices();

  return (
    <section className="relative flex items-center justify-center pt-24 pb-12 sm:pt-32 sm:pb-20 lg:py-36 bg-gradient-to-tr from-emerald-50 to-green-100 overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-t from-emerald-100/40 via-green-50/60 to-transparent" />
      </div>
      <div className="relative flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-10 px-4 z-10">

        {/* Text Block */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-tr from-emerald-700 via-green-700 to-emerald-400">
            The Sacred Science of Panchakarma<br />
            <span className="text-2xl sm:text-3xl font-semibold bg-clip-text text-emerald-700">
              Detox. Balance. Rejuvenate.
            </span>
          </h1>
          <div className="mt-8">
            <Link
              to="/therapies"
              className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-700 hover:to-green-700 text-white px-7 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Explore All Therapies <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Netflix-style Carousel */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-[320px] sm:w-[400px] h-[360px] flex items-center justify-center">

            {/* Previous Slide */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[120px] h-[280px] sm:w-[140px] sm:h-[320px] opacity-60 scale-90 z-0 cursor-pointer transition-all duration-500"
              onClick={prevSlide}
              style={{ filter: "blur(0.5px)", pointerEvents: "auto" }}
            >
              <img
                src={slides[prevIdx].image}
                alt={slides[prevIdx].title}
                className="rounded-2xl object-cover w-full h-[70%] mb-2"
                loading="lazy"
              />
              <div className="flex flex-col items-center py-2">
                <div className="text-xl">{slides[prevIdx].emoji}</div>
                <div className="text-green-700 font-bold text-xs truncate">{slides[prevIdx].title}</div>
              </div>
            </div>

            {/* Current Slide */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[320px] sm:w-[250px] sm:h-[340px] bg-white rounded-3xl shadow-2xl z-10 transition-all duration-500 border-4 border-emerald-100 flex flex-col items-center"
              style={{ boxShadow: "0 8px 40px 0 rgba(70, 185, 120,0.13)" }}
            >
              <img
                src={slides[currIdx].image}
                alt={slides[currIdx].title}
                className="w-full h-[78%] object-cover object-center rounded-t-3xl transition duration-500"
                loading="lazy"
              />
              <div className="p-4 flex flex-col items-center bg-white">
                <div className="flex items-center gap-2 text-3xl mb-1">
                  <span>{slides[currIdx].emoji}</span>
                  <span className="font-bold text-gray-900">{slides[currIdx].title}</span>
                </div>
              </div>
            </div>

            {/* Next Slide */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[120px] h-[280px] sm:w-[140px] sm:h-[320px] opacity-60 scale-90 z-0 cursor-pointer transition-all duration-500"
              onClick={nextSlide}
              style={{ filter: "blur(0.5px)", pointerEvents: "auto" }}
            >
              <img
                src={slides[nextIdx].image}
                alt={slides[nextIdx].title}
                className="rounded-2xl object-cover w-full h-[70%] mb-2"
                loading="lazy"
              />
              <div className="flex flex-col items-center py-2">
                <div className="text-xl">{slides[nextIdx].emoji}</div>
                <div className="text-green-700 font-bold text-xs truncate">{slides[nextIdx].title}</div>
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-emerald-50 rounded-full p-2 shadow hover:scale-110 transition z-20"
              onClick={prevSlide}
              aria-label="Previous Panchakarma"
            >
              <ChevronLeftIcon className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-emerald-50 rounded-full p-2 shadow hover:scale-110 transition z-20"
              onClick={nextSlide}
              aria-label="Next Panchakarma"
            >
              <ChevronRightIcon className="w-5 h-5 text-emerald-600" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-[0.8rem] left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full ${idx === currIdx ? "bg-emerald-600" : "bg-emerald-200"} transition`}
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
