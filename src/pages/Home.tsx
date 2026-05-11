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
  const { products: allCollection, collections } = useStore();
  const navigate = useNavigate();

  // Combine static divisions with custom collections
  // We prioritize custom collections assigned by the user
  const sections = React.useMemo(() => {
    const list: { title: string; id: string; category: string; type: 'collection' | 'category' }[] = [];
    
    // Add custom collections
    collections.forEach(col => {
      list.push({ 
        title: col.name, 
        id: col.id, 
        category: '',
        type: 'collection'
      });
    });

    // Add all unique product categories that aren't already in common headers
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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="max-w-5xl mx-auto flex flex-col items-center"
          >
            <h1 className="font-serif text-[70px] md:text-[160px] leading-none text-white mb-10 tracking-tighter uppercase drop-shadow-2xl">
              COLLECTION
            </h1>
            <Link 
              to="/shop" 
              className="bg-[#C2A46C] text-black px-16 py-5 text-sm uppercase tracking-[0.4em] font-black hover:bg-white transition-all transform hover:scale-105 duration-300 shadow-[0_10px_40px_rgba(194,164,108,0.3)]"
            >
              SHOP NOW
            </Link>
          </motion.div>
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
