import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import BlackLabel from "../../img/BlackLabel.jpg";
import Hennessy from "../../img/Hennessy.jpg";
import JackDaniels from "../../img/JackDaniels.jpg";
import JagerMeister from "../../img/JagerMeister.jpg";
import Jameson from "../../img/Jameson.jpg";

const images = [
  { src: BlackLabel, alt: "Black Label" },
  { src: Hennessy, alt: "Hennessy" },
  { src: JackDaniels, alt: "Jack Daniels" },
  { src: JagerMeister, alt: "Jager Meister" },
  { src: Jameson, alt: "Jameson" },
];

export default function Carousel() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000); // smoother timing

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-xs md:max-w-sm lg:max-w-md">
      {/* Carousel Wrapper */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[2/3] overflow-hidden rounded-2xl shadow-xl bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index].src}
            alt={images[index].alt}
            className="absolute w-full h-full object-cover object-center"
            loading="eager"
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 420px"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 sm:left-3 -translate-y-1/2 z-30 flex items-center justify-center cursor-pointer group"
        aria-label="Previous slide"
      >
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 text-white backdrop-blur-sm group-hover:bg-black/55 transition">
          ❮
        </span>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 z-30 flex items-center justify-center cursor-pointer group"
        aria-label="Next slide"
      >
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 text-white backdrop-blur-sm group-hover:bg-black/55 transition">
          ❯
        </span>
      </button>

      {/* Indicators (dots) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
