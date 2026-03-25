import React from "react";
import { MdWhatshot } from "react-icons/md";

const Spirit = () => {
  return (
    <div role="listitem" className="w-full h-full">
      <a
        href="/category/spirits"
        className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden h-full flex flex-col min-h-[320px]"
      >
        {/* Icon */}
        <div className="h-48 flex items-center justify-center bg-red-50 overflow-hidden">
          <MdWhatshot className="w-24 h-24 text-red-600 transform scale-105 hover:scale-110 transition duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 text-center flex flex-col flex-grow mt-auto">
          <h3 className="text-xl font-bold text-red-600 mb-3">Spirits</h3>

          <p className="text-gray-600 mb-4">
            Premium spirits and cocktails for the perfect drink.
          </p>

          {/* Link */}
          <div className="flex items-center justify-center gap-2 font-bold text-red-600 mt-auto">
            <span>Browse category</span>
            <span className="transform translate-x-1">→</span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Spirit;
