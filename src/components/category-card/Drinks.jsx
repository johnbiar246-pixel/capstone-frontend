import React from "react";
import { MdLocalBar } from "react-icons/md";

const Drinks = () => {
  return (
    <div role="listitem" className="w-full h-full">
      <a
        href="/category/drinks"
        className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden h-full flex flex-col min-h-[320px]"
      >
        {/* Icon */}
        <div className="h-48 flex items-center justify-center bg-blue-50 overflow-hidden">
          <MdLocalBar className="w-24 h-24 text-blue-500 transform scale-105 hover:scale-110 transition duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 text-center flex flex-col flex-grow mt-auto">
          <h3 className="text-xl font-bold text-blue-500 mb-3">Drinks</h3>

          <p className="text-gray-600 mb-4">
            Refreshing beverages to complement your meal.
          </p>

          {/* Link */}
          <div className="flex items-center justify-center gap-2 font-bold text-blue-500 mt-auto">
            <span>Browse category</span>
            <span className="transform translate-x-1">→</span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Drinks;
