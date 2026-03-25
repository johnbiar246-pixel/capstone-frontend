import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/navbar/Navbar";
import Carousel from "../../components/carousel/Carousel";
import Footer from "../../components/footer/Footer";
import MenuModal from "../../components/modal/MenuModal";
import { MdRestaurantMenu } from "react-icons/md";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <div className="min-h-screen bg-[#3C3D37] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f211d] via-[#2d3b2a] to-[#254F22] py-24 md:py-32">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#8FBF5A]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#F4B860]/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.span
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium tracking-wide backdrop-blur-md mb-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            Premium Resto Bar Experience
          </motion.span>

          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          >
            Welcome to <span className="text-[#F4B860]">Gulp Course</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          >
            Enjoy exceptional drinks and great flavors, where sipping, dining,
            and celebrating come together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <button
              onClick={openModal}
              className="inline-flex items-center border border-white/30 bg-white/10 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition cursor-pointer"
            >
              Browse Menu
            </button>
          </motion.div>
        </div>
      </section>

      {/* Special drinks Slides */}
      <section className="py-20 bg-[#f5f7f3]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Today's Special Drinks
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our featured products and specialties
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100">
            <Carousel />
          </div>

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center bg-[#254F22] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1f3f1c] transition"
            >
              <MdRestaurantMenu className="mr-2 text-xl" />
              Browse All Menu
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Menu Modal */}
      <MenuModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Home;
