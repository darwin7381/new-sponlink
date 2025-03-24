'use client';

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState("2025");
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);
  
  return (
    <footer className="bg-[#1f2937] text-white">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-12 gap-y-16">
          {/* Logo and Description */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-2 rounded mr-2">
                <span className="font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold">SponLink</span>
            </div>
            <p className="mt-6 text-base text-gray-300">
              SponLink is a professional activity management platform that helps you easily create, manage and promote activities.
            </p>
            
            {/* Social Media Icons */}
            <div className="mt-8 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-white tracking-wider uppercase mb-4">Products</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/features" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/documentation" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Design System
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Developer API
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-300 hover:text-white transition-colors duration-300">
                  Work With Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with copyright and legal links */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-base text-gray-400 order-2 sm:order-1">
              &copy; {currentYear} EventConnect, Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-8 order-1 sm:order-2">
              <Link href="/privacy" className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Use
              </Link>
              <Link href="/cookies" className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 