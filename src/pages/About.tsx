import React from 'react';
import { motion } from 'motion/react';

const About = () => {
  return (
    <div className="bg-theme-bg text-theme-text min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] bg-black">
        <img 
          src="https://images.unsplash.com/photo-1544816153-1574d6c4125b?w=1600&auto=format&fit=crop&q=80" 
          alt="About Us"
          className="absolute inset-0 w-full h-full object-cover opacity-50 brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-7xl text-theme-accent">Our Story</h1>
        </div>
      </section>

      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xl leading-relaxed text-theme-text/80">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 font-serif"
        >
          Urban was born out of a desire for curated, timeless footwear. We believe that true luxury lies in simplicity, quality craftsmanship, and attention to detail.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif"
        >
          Our mission is to provide pieces that elevate your everyday walk, focusing on premium materials and authentic craftsmanship. Every pair of Urban slides or clogs is designed to keep you moving comfortably every step of the way.
        </motion.p>
      </section>
    </div>
  );
};

export default About;
