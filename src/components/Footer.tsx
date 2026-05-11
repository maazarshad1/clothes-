import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-theme-bg text-theme-text border-t border-theme-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif tracking-widest uppercase font-bold text-theme-accent">ZURBAN</h3>
            <p className="text-theme-text/60 text-sm leading-relaxed font-serif">
              Premium quality footwear designed for ultimate comfort and timeless style. Authentic craftsmanship from the heart of Pakistan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-theme-text/40 hover:text-theme-accent transition"><Facebook size={20} /></a>
              <a href="#" className="text-theme-text/40 hover:text-theme-accent transition"><Instagram size={20} /></a>
              <a href="#" className="text-theme-text/40 hover:text-theme-accent transition"><Twitter size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-theme-accent">Shop</h4>
            <ul className="space-y-4 text-sm text-theme-text/60">
              <li><Link to="/shop?category=Slides" className="hover:text-theme-accent transition">Slides</Link></li>
              <li><Link to="/shop?category=Clogs" className="hover:text-theme-accent transition">Clogs</Link></li>
              <li><Link to="/shop?category=Traditional" className="hover:text-theme-accent transition">Traditional Wear</Link></li>
              <li><Link to="/shop" className="hover:text-theme-accent transition">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-theme-accent">Support</h4>
            <ul className="space-y-4 text-sm text-theme-text/60">
              <li><Link to="/track-order" className="hover:text-theme-accent transition">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-theme-accent transition">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-theme-accent transition">Shipping Policy</Link></li>
              <li><Link to="/about" className="hover:text-theme-accent transition">Returns & Exchanges</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-theme-accent">Contact</h4>
            <ul className="space-y-4 text-sm text-theme-text/60">
              <li className="flex items-center gap-3 font-sans"><Phone size={16} className="text-theme-accent" /> +92 300 1234567</li>
              <li className="flex items-center gap-3 font-sans"><Mail size={16} className="text-theme-accent" /> support@zurban.pk</li>
              <li className="flex items-start gap-3"><MapPin size={16} className="text-theme-accent mt-1" /> Office 12, Level 4, Tech Plaza, Lahore, Pakistan</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-theme-border pt-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-theme-text/30">
            &copy; {new Date().getFullYear()} ZURBAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
