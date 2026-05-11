import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, CheckCircle, Shield, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { products: allCollection, collections } = useStore();
  const navigate = useNavigate();

  // Combine custom collections with all product groups
  const sections = React.useMemo(() => {
    const list: { title: string; id: string; category: string; type: 'collection' | 'category' }[] = [];
    
    // Add custom collections first
    collections.forEach(col => {
      list.push({ 
        title: col.name, 
        id: col.id, 
        category: '',
        type: 'collection'
      });
    });

    // Ensure all unique categories are captured as fallback sections
    const productCategories = Array.from(new Set(allCollection.map(p => p.category)));
    productCategories.forEach(cat => {
      if (!list.some(s => s.title.toLowerCase() === cat.toLowerCase())) {
        list.push({
          title: cat,
          id: cat.toLowerCase().replace(/\s+/g, '-'),
          category: cat,
          type: 'category'
        });
      }
    });

    return list;
  }, [collections, allCollection]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dynamic Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
            alt="Premium Apparel" 
            className="w-full h-full object-cover brightness-[0.25]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-[#C2A46C] tracking-[0.6em] text-[10px] md:text-xs font-black uppercase mb-6">Established 2025</span>
            <h1 className="font-serif text-[60px] md:text-[140px] leading-tight text-white mb-10 tracking-tighter uppercase">
              DOPE PK
            </h1>
            <p className="max-w-xl text-white/60 text-xs md:text-sm uppercase tracking-[0.3em] font-light mb-12 leading-relaxed">
              Premium Streetwear & Refined Essentials <br/> Crafted for the Modern Individual
            </p>
            <Link 
              to="/shop" 
              className="group relative overflow-hidden bg-[#C2A46C] text-black px-16 py-5 text-sm uppercase tracking-[0.4em] font-black transition-all hover:text-white"
            >
              <span className="relative z-10">Explore Catalog</span>
              <div className="absolute inset-x-0 bottom-0 h-0 bg-black transition-all group-hover:h-full" />
            </Link>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <span className="text-[8px] uppercase tracking-[0.5em] font-black">Scroll to Discover</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Dynamic Sections */}
      <div className="bg-black">
        {sections.map((section, sIdx) => {
          const sectionProducts = allCollection.filter(p => {
            if (section.type === 'collection') {
              return p.collections?.some(c => c === section.id || c === section.title);
            }
            return p.category === section.category;
          }).slice(0, 8);

          if (sectionProducts.length === 0) return null;

          const linkPath = section.type === 'collection' 
            ? `/shop?collection=${section.id}` 
            : `/shop?category=${section.category}`;

          return (
            <section key={section.id || section.category} className="py-24 border-b border-white/5">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-8">
                  <div className="group">
                    <h2 className="font-serif text-5xl md:text-6xl uppercase tracking-tight text-white mb-2">{section.title}</h2>
                    <div className="h-1.5 w-40 bg-[#C2A46C] transition-all group-hover:w-full"></div>
                  </div>
                  <Link to={linkPath} className="text-white/40 uppercase tracking-[0.4em] text-[11px] font-black flex items-center gap-2 hover:text-[#C2A46C] transition-all group">
                    VIEW ALL <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
                  {sectionProducts.map((product, index) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 mb-8 shadow-2xl group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-700">
                        <Link to={`/product/${product.id}`}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-700" />
                        </Link>
                      </div>
                      <div className="space-y-3">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-serif text-xl tracking-tight text-white/90 hover:text-[#C2A46C] transition-colors line-clamp-2 uppercase leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-[#C2A46C] font-bold text-base tracking-widest">
                          PKR {product.price.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
