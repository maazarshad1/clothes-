import React from 'react';

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h1 className="font-serif text-5xl mb-6">Get In Touch</h1>
          <p className="text-gray-600 mb-12">
            Have a question about a product, order, or just want to say hello? 
            Fill out the form and our team will get back to you within 24 hours.
          </p>
          
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold uppercase tracking-widest mb-1">Email</h3>
              <p className="text-gray-500">support@urbanstyle.com</p>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-widest mb-1">Phone</h3>
              <p className="text-gray-500">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-widest mb-1">Studio</h3>
              <p className="text-gray-500">123 Fashion Ave, Suite 400<br/>New York, NY 10011</p>
            </div>
          </div>
        </div>

        <div className="bg-[#f5f2ed] p-8 sm:p-12">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Name</label>
              <input type="text" className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
              <input type="email" className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Message</label>
              <textarea rows={5} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black bg-white resize-none" required></textarea>
            </div>
            <button type="submit" className="w-full bg-black text-white py-4 font-semibold uppercase tracking-widest hover:bg-[#d4af37] transition">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
