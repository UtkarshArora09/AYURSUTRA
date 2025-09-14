import React from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Appointments', href: '/appointments' }
  ];

  const resources = [
    { name: 'Patient Portal', href: '/portal' },
    { name: 'Health Blog', href: '/blog' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘', color: 'hover:text-blue-600' },
    { name: 'Instagram', href: '#', icon: '📷', color: 'hover:text-pink-600' },
    { name: 'Twitter', href: '#', icon: '🐦', color: 'hover:text-blue-400' },
    { name: 'YouTube', href: '#', icon: '📺', color: 'hover:text-red-600' }
  ];

  return (
    <footer className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-t border-green-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Column 1: Brand + Tagline */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-base sm:text-lg">🕉️</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  AyurSutra
                </h3>
                <p className="text-xs text-gray-600 -mt-1">Wellness Platform</p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-gray-700 text-sm leading-relaxed pr-0 sm:pr-4">
              Transforming lives through authentic Ayurvedic healing. Experience holistic wellness with traditional therapies.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-600 hover:text-green-600 transition-colors duration-300 flex items-center group text-sm sm:text-base"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 border-b-2 border-emerald-500 pb-2 inline-block">
              Resources
            </h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-300 flex items-center group text-sm sm:text-base"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block">
              Contact Us
            </h3>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600">+91 98765 43210</p>
              </div>

              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 break-all">info@ayursutra.com</p>
              </div>

              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600">Mumbai, Maharashtra</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">Follow Us</h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 ${social.color}`}
                    title={social.name}
                    aria-label={social.name}
                  >
                    <span className="text-sm sm:text-base">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-200 bg-gradient-to-r from-green-100 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 gap-3">
            
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                © {currentYear} AyurSutra. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-red-500">
                <span className="text-xs">Made with</span>
                <HeartIcon className="w-3 h-3" />
                <span className="text-xs">for wellness</span>
              </div>
            </div>

            {/* Certification Badge */}
            <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-green-200">
              <span className="text-green-600 text-xs font-medium">✓ AYUSH Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
