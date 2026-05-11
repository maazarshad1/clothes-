import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, CheckCircle, Shield, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { products as allProducts } from '../data/products';

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
  const { addToCart } = useStore();
  const allCollection = allProducts;

  return (
    <div className="min-h-screen">
      {/* Hero Section - Made very small and compact */}
      <section className="relative h-[35vh] flex items-center overflow-hidden border-b border-theme-border/30">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover brightness-[0.3]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h4 className="text-theme-accent tracking-[0.3em] font-semibold uppercase mb-1 text-[10px]">The New Standard</h4>
            <h1 className="font-serif text-3xl md:text-5xl mb-3 leading-tight uppercase">Elite Urban <br/> Design</h1>
            <p className="text-sm text-theme-text/70 mb-5 font-serif max-w-sm">
              Premium engineering meets unparalleled comfort.
            </p>
            <Link to="/shop" className="bg-theme-accent text-theme-bg px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300">
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Product Grid - All products displayed in a compact way */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 border-b border-theme-border/20 pb-4">
            <div>
              <h2 className="font-serif text-2xl uppercase tracking-tighter">Full Catalogue</h2>
              <p className="text-theme-accent uppercase tracking-widest text-[9px] font-bold">Premium Selection</p>
            </div>
            <div className="text-theme-text/40 text-[10px] uppercase tracking-widest font-bold">
              {allCollection.length} Items Listed
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allCollection.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-black/40 backdrop-blur-sm border border-theme-border/30 group relative flex flex-col"
              >
                {index === 0 && (
                  <div className="absolute top-2 left-2 z-20 bg-theme-accent text-theme-bg px-2 py-0.5 text-[8px] uppercase font-bold tracking-widest shadow-lg">
                    Featured
                  </div>
                )}
                
                <div className="aspect-[4/5] overflow-hidden relative">
                  <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </Link>
                </div>

                <div className="p-3 text-center transition-colors flex-1 flex flex-col justify-between hover:bg-white/5">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-serif text-[10px] sm:text-xs truncate max-w-[70%]">{product.name}</h3>
                    <Link 
                      to="/cart" 
                      onClick={() => addToCart(product)}
                      className="bg-theme-accent text-theme-bg px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest whitespace-nowrap"
                    >
                      Buy
                    </Link>
                  </div>
                  <p className="text-theme-accent font-bold tracking-widest text-[10px]">PKR {product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
