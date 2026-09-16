import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageSquare, Globe, Share2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-zinc-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
              <span className="bg-white text-zinc-950 font-black text-2xl px-2.5 py-1 tracking-wider uppercase rounded-xs">
                PRO
              </span>
              <span className="font-black text-2xl tracking-widest text-white uppercase">
                EDGE
              </span>
            </Link>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              PROEDGE designs high-performance athletic and lifestyle footwear engineered for durability, comfort, and uncompromising street style.
            </p>
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
              Built for Your Next Step.
            </p>

            {/* Social & WhatsApp Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="#"
                aria-label="WhatsApp Support"
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Official Website"
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Share Store"
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Shop Collections</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/men" className="hover:text-amber-400 transition-colors">
                  Men&apos;s Footwear
                </Link>
              </li>
              <li>
                <Link href="/women" className="hover:text-amber-400 transition-colors">
                  Women&apos;s Footwear
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-amber-400 transition-colors">
                  Sports &amp; Running
                </Link>
              </li>
              <li>
                <Link href="/shop?category=casual" className="hover:text-amber-400 transition-colors">
                  Casual Sneakers
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Sale &amp; Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Customer Care</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Islandwide Delivery Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Shoe Size Fitting Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Returns &amp; Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Order Tracking
                </a>
              </li>
            </ul>
          </div>

          {/* Store Info */}
          <div className="space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Get In Touch</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Galle Road, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>support@proedge.lk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} PROEDGE Footwear. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              Cookie Preferences
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
