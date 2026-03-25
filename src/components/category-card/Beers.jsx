import React from "react";
import { IoBeer } from "react-icons/io5";

const Beers = () => {
  return (
    <div role="listitem" className="w-full h-full">
      <a
        href="/category/beers"
        className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden h-full flex flex-col min-h-[320px]"
      >
        {/* Icon */}
        <div className="h-48 flex items-center justify-center bg-amber-50 overflow-hidden">
          <IoBeer className="w-24 h-24 text-amber-600 transform scale-105 hover:scale-110 transition duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 text-center flex flex-col flex-grow mt-auto">
          <h3 className="text-xl font-bold text-amber-600 mb-3">Beers</h3>

          <p className="text-gray-600 mb-4">
            Premium selection of craft and classic beers.
          </p>

          {/* Link */}
          <div className="flex items-center justify-center gap-2 font-bold text-amber-600 mt-auto">
            <span>Browse category</span>
            <span className="transform translate-x-1">→</span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Beers;
