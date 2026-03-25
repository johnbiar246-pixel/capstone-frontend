import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#1f211d] via-[#2d3b2a] to-[#254F22] text-white border-t border-white/10">
      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <h3 className="text-2xl font-extrabold">
              Gulp <span className="text-[#F4B860]">Course</span>
            </h3>
            <p className="mt-3 text-white/80 text-sm max-w-md">
              2B 2nd Flr. 5059 P. Burgos St, Makati, Philippines, 1210
            </p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-white/90 mb-2">Follow us</p>
            <a
              href="https://www.facebook.com/gulpcourse.makati"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-[#F4B860] hover:text-[#ffd28f] transition"
            >
              Facebook Page
            </a>
          </div>
        </div>

        <hr className="my-6 border-white/15" />

        <p className="text-sm text-white/70 text-center">
          © 2026 Gulp Course. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
