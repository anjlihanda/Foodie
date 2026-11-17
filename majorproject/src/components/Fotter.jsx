import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#8B4A32] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Foodie Info */}
          <div>
            <h2 className="text-3xl font-bold mb-4 text-[#FFE8DB]">
              Foodie<span className="text-orange-300">.</span>
            </h2>

            <p className="text-orange-50 leading-7">
              Delicious food, fresh taste and amazing dishes.
              Discover your favourite meals and enjoy every bite
              with Foodie!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-[#FFE8DB]">
              Quick Links
            </h2>

            <ul className="space-y-3">
              <li>
                <a href="#home" className="hover:text-orange-300 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#food" className="hover:text-orange-300 transition">
                  Food
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-orange-300 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-orange-300 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-[#FFE8DB]">
              Contact Us
            </h2>

            <div className="space-y-3 text-orange-50">
              <p>📧 foodie@gmail.com</p>
              <p>📞 +91 98765 43210</p>
              <p>📍 Punjab, India</p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-orange-200/30 mt-10 pt-6 text-center">
          <p className="text-sm text-orange-100">
            © 2026 Foodie. All Rights Reserved.
          </p>

          <p className="text-sm mt-2 text-[#FFE8DB]">
            Made with ❤️ for food lovers
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;