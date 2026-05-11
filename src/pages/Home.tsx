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

    // Automatic Seasonal Sorting System
    const currentMonth = new Date().getMonth(); // 0-11
    const isWinter = currentMonth === 10 || currentMonth === 11 || currentMonth === 0 || currentMonth === 1; // Nov, Dec, Jan, Feb
    
    const winterCats = ['Hoodies', 'Sweatshirts', 'Tracksuits', 'Bomber Jackets', 'Waffle Knitted Sweatshirts', 'WaffleZip Mocknecks', 'Full Sleeves T-Shirts'];
    const summerCats = ['Graphic Tees', 'Basic Oversized', 'Casual Shirts', 'Zipper Polos', 'Round Neck', 'Cuban Shirts'];

    return list.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      const getScore = (title: string) => {
        let score = 0;
        if (isWinter) {
          if (winterCats.some(c => title.includes(c.toLowerCase()))) score += 10;
          if (summerCats.some(c => title.includes(c.toLowerCase()))) score -= 10;
        } else {
          if (summerCats.some(c => title.includes(c.toLowerCase()))) score += 10;
          if (winterCats.some(c => title.includes(c.toLowerCase()))) score -= 10;
        }
        return score;
      };

      return getScore(bTitle) - getScore(aTitle);
    });
  }, [collections, allCollection]);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Dynamic Sections */}
      <div className="bg-black">
        {sections.map((section, sIdx) => {
          const sectionProducts = allCollection.filter(p => {
            if (section.type === 'collection') {
              return p.collections?.some(c => c === section.id || c === section.title);
            }
            return p.category === section.category;
          }).slice(0, 2);

          if (sectionProducts.length === 0) return null;

          const linkPath = section.type === 'collection' 
            ? `/shop?collection=${section.id}` 
            : `/shop?category=${section.category}`;

          return (
            <section key={section.id || section.category} className="py-12 md:py-24 border-b border-white/5">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 md:mb-16 border-b border-white/10 pb-6 md:pb-8 gap-6">
                  <div className="group flex-1">
                    <h2 className="font-serif text-3xl md:text-6xl uppercase tracking-tight text-white mb-2 break-words">{section.title}</h2>
                    <div className="h-1 w-20 md:h-1.5 md:w-40 bg-[#C2A46C] transition-all group-hover:w-full"></div>
                  </div>
                  <Link to={linkPath} className="text-white/40 uppercase tracking-[0.4em] text-[10px] md:text-[11px] font-black flex items-center gap-2 hover:text-[#C2A46C] transition-all group self-start md:self-auto">
                    VIEW ALL <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-8 md:gap-16 lg:gap-24 max-w-6xl">
                  {sectionProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 mb-8 shadow-2xl group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-700">
                        <Link to={`/product/${product.id}`}>
                          <img 
                            src={product.image || undefined} 
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
                    </div>
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
