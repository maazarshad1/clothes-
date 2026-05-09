import React from 'react';
import { motion } from 'motion/react';

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] bg-black">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80" 
          alt="About Us"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-6xl text-white">Our Story</h1>
        </div>
      </section>

      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-lg leading-relaxed text-gray-700">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          Urban Style was born out of a desire for curated, timeless fashion. We believe that true luxury lies in simplicity, quality craftsmanship, and attention to detail.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our mission is to provide pieces that elevate your everyday wardrobe, focusing on sustainable practices and ethical production. We carefully select our materials to ensure every garment is made to last.
        </motion.p>
      </section>
    </div>
  );
};

export default About;
