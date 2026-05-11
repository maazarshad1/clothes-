import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, CheckCircle, Shield, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { toast } from 'react-hot-toast';

const CategoryCard = ({ title, image, link }: { title: string; image: string; link: string }) => (
  <Link to={link} className="group relative overflow-hidden aspect-square">
    <img 
      src={image} 
      alt={title} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
    <div className="absolute inset-0 flex items-center justify-center">
      <h3 className="text-white font-serif text-2xl tracking-widest uppercase border-b-2 border-transparent group-hover:border-theme-accent p-2 transition-all">
        {title}
      </h3>
    </div>
  </Link>
);

const TestimonialCard = ({ name, comment, rating }: { name: string; comment: string; rating: number }) => (
  <div className="bg-theme-card p-8 border border-theme-border">
    <div className="flex text-theme-accent mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} fill={i < rating ? "currentColor" : "none"} stroke="currentColor" />
      ))}
    </div>
    <p className="text-theme-text/80 italic mb-6 font-serif">"{comment}"</p>
    <p className="text-theme-accent uppercase tracking-widest text-xs font-bold">— {name}</p>
  </div>
);

const Home = () => {
  const { products: allCollection } = useStore();
  const navigate = useNavigate();

  // Group products by category for sections
  const sections = [
    { title: 'Zip Polos', category: 'Dual Stripe Zip Polos' },
    { title: 'Textured Polos', category: 'Textured Stripe Polos' },
    { title: 'Johnny Collar Polos', category: 'Two Tone Polos' },
    { title: 'Sweatshirts', category: 'Sweatshirts' },
    { title: 'T-Shirts', category: 'T-Shirts' },
    { title: 'Jackets', category: 'Bomber Jackets' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center overflow-hidden border-b border-theme-border/30">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://cdn.shopify.com/s/files/1/0613/1499/0165/files/Hero_Banner_Desktop.png?v=1776452628" 
            alt="Hero" 
            className="w-full h-full object-cover brightness-[0.7]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop";
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <h4 className="text-theme-accent tracking-[0.4em] font-semibold uppercase mb-2 text-xs drop-shadow-md">Premium Apparel</h4>
            <h1 className="font-serif text-4xl md:text-6xl mb-6 leading-tight uppercase text-white drop-shadow-lg">DOPE PK <br/> COLLECTION</h1>
            <Link to="/shop" className="bg-theme-accent text-theme-bg px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300 shadow-xl">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Category Sections */}
      {sections.map((section, sIdx) => {
        const sectionProducts = allCollection.filter(p => p.category === section.category).slice(0, 6);
        if (sectionProducts.length === 0) return null;

        return (
          <section key={section.category} className="py-16 border-b border-theme-border/10">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="font-serif text-3xl uppercase tracking-tighter mb-1">{section.title}</h2>
                  <div className="h-1 w-20 bg-theme-accent"></div>
                </div>
                <Link to={`/shop?category=${section.category}`} className="text-theme-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 hover:text-white transition">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {sectionProducts.map((product, index) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-theme-card mb-3">
                      <Link to={`/product/${product.id}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </Link>
                      <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="absolute bottom-0 left-0 right-0 py-3 bg-theme-accent text-theme-bg text-[10px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform"
                      >
                        Buy Now
                      </button>
                    </div>
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-serif text-xs truncate mb-1 group-hover:text-theme-accent transition">{product.name}</h3>
                      </Link>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {product.colors?.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="text-[7px] px-1 border border-theme-border text-theme-text/40 lowercase italic">
                            {color}
                          </span>
                        ))}
                        {product.colors && product.colors.length > 3 && <span className="text-[7px] text-theme-text/40">+</span>}
                      </div>
                      <p className="text-theme-accent font-bold text-[11px]">PKR {product.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Full Catalogue Preview if needed */}
      <section className="py-20 bg-theme-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl mb-6 uppercase">Explore Everything</h2>
          <p className="text-theme-text/60 max-w-2xl mx-auto mb-10 font-serif">
            Browse through our entire selection of premium apparel, from iconic polos to winter essentials.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-theme-bg px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-theme-accent transition">
            Shop Entire Collection <ShoppingBag size={18} />
          </Link>
        </div>
      </section>

      {/* Reduced and optional sections for single-page focus */}
      <section className="py-12 container mx-auto px-4 opacity-70">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 border border-theme-border/20 p-4">
            <CheckCircle size={24} className="text-theme-accent shrink-0" />
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-accent">Elite Materials</h4>
              <p className="text-[10px] text-theme-text/60">Strict architectural sourcing</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-theme-border/20 p-4">
            <Shield size={24} className="text-theme-accent shrink-0" />
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-accent">Lifetime Support</h4>
              <p className="text-[10px] text-theme-text/60">Guaranteed craftsmanship</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-theme-border/20 p-4">
            <Truck size={24} className="text-theme-accent shrink-0" />
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-accent">Rapid Dispatch</h4>
              <p className="text-[10px] text-theme-text/60">Delivery nationwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-theme-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl mb-4">Customers Talk</h2>
            <p className="text-theme-accent uppercase tracking-widest text-xs">Real Feedback From Real People</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard name="James Wilson" comment="These slides are a game changer for my post-gym recovery. Unmatched cushioning." rating={5} />
            <TestimonialCard name="Sarah Chen" comment="Sophisticated design that actually feels good to walk in. Will be buying more." rating={5} />
            <TestimonialCard name="Marcus Thorne" comment="Industrial strength quality with a luxury feel. Urban is my new go-to." rating={5} />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 container mx-auto px-4 border-t border-theme-border/20">
        <div className="bg-theme-accent/90 p-8 md:p-16 text-theme-bg text-center px-4 md:px-0">
          <h2 className="font-serif text-xl md:text-2xl mb-4">DISCOUNT ELIGIBILITY</h2>
          <p className="uppercase tracking-[0.2em] mb-6 opacity-80 text-[7px] md:text-[8px]">Unlock exclusive credentials by joining our registry</p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-white border-none px-4 py-2 text-theme-bg focus:ring-0 min-w-0 text-[10px]"
            />
            <button className="bg-theme-bg text-theme-accent px-6 py-2 font-bold uppercase tracking-widest hover:opacity-90 transition text-[10px]">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
