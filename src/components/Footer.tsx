import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-2xl tracking-widest uppercase mb-6">Urban Style</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              A modern luxury fashion destination offering curated styles for the contemporary wardrobe.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-gray-300">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/shop?category=Women" className="hover:text-[#d4af37] transition">Women's Collection</Link></li>
              <li><Link to="/shop?category=Men" className="hover:text-[#d4af37] transition">Men's Collection</Link></li>
              <li><Link to="/shop?category=Kids" className="hover:text-[#d4af37] transition">Kids</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-[#d4af37] transition">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-gray-300">Help</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/contact" className="hover:text-[#d4af37] transition">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-[#d4af37] transition">Shipping & Returns</Link></li>
              <li><Link to="#" className="hover:text-[#d4af37] transition">FAQ</Link></li>
              <li><Link to="#" className="hover:text-[#d4af37] transition">Order Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-gray-300">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex border-b border-gray-600 pb-2">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-transparent border-none text-sm focus:outline-none w-full text-white placeholder-gray-500"
              />
              <button type="submit" className="text-xs uppercase tracking-wider font-semibold hover:text-[#d4af37] transition">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Urban Style. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
