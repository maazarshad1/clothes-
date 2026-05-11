import React from 'react';

const Contact = () => {
  return (
    <div className="bg-theme-bg text-theme-text min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h1 className="font-serif text-6xl mb-6 text-theme-accent">Get In Touch</h1>
            <p className="text-theme-text/60 mb-12 text-lg font-serif">
              Have a question about a product, order, or just want to say hello? 
              Fill out the form and our team will get back to you within 24 hours.
            </p>
            
            <div className="space-y-8 text-sm">
              <div>
                <h3 className="font-bold uppercase tracking-[0.2em] mb-2 text-theme-accent">Corporate Email</h3>
                <p className="text-theme-text/80 font-sans text-base">contact@urbanstyle.app</p>
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-[0.2em] mb-2 text-theme-accent">Direct Line</h3>
                <p className="text-theme-text/80 font-sans text-base">+44 7700 900077</p>
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-[0.2em] mb-2 text-theme-accent">Creative Studio</h3>
                <p className="text-theme-text/80 font-serif text-base leading-relaxed">Studio 24, Heritage Square<br/>Central Avenue, London, UK</p>
              </div>
            </div>
          </div>

          <div className="bg-theme-card p-8 sm:p-12 border border-theme-border">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-theme-accent">Your Name</label>
                <input type="text" className="w-full border border-theme-border p-4 focus:outline-none focus:border-theme-accent bg-theme-bg text-theme-text" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-theme-accent">Email Address</label>
                <input type="email" className="w-full border border-theme-border p-4 focus:outline-none focus:border-theme-accent bg-theme-bg text-theme-text" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-theme-accent">Message</label>
                <textarea rows={5} className="w-full border border-theme-border p-4 focus:outline-none focus:border-theme-accent bg-theme-bg text-theme-text resize-none" required></textarea>
              </div>
              <button type="submit" className="w-full bg-theme-accent text-theme-bg py-5 font-bold uppercase tracking-[0.25em] hover:bg-white transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
