import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, useStore } from '../context/StoreContext';
import { ShoppingBag, Heart, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-theme-card mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="flex gap-2">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-theme-accent text-theme-bg py-3 text-xs font-bold uppercase tracking-wider hover:bg-white transition flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className="bg-theme-bg text-theme-accent border border-theme-border p-3 hover:bg-theme-accent hover:text-theme-bg transition flex items-center justify-center"
            >
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg hover:text-theme-accent transition truncate">{product.name}</h3>
        </Link>
        <div className="flex justify-between items-center">
          <p className="text-xs uppercase tracking-widest text-theme-text/40">{product.category}</p>
          <div className="text-right">
            <span className="font-semibold text-theme-accent">PKR {product.price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'All');

  const categories = ['All', 'Slides', 'Clogs', 'Traditional'];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      {/* Header */}
      <div className="bg-black/40 text-theme-text py-20 text-center border-b border-theme-border">
        <h1 className="font-serif text-6xl mb-4">The Collection</h1>
        <p className="text-theme-accent text-sm tracking-[0.3em] uppercase">Premium Footwear by Zurbanz</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-4 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat === 'All') {
                    searchParams.delete('category');
                  } else {
                    searchParams.set('category', cat);
                  }
                  setSearchParams(searchParams);
                }}
                className={`text-sm tracking-widest uppercase pb-1 border-b-2 transition-all duration-300 ${
                  activeCategory === cat 
                  ? 'border-theme-accent text-theme-accent font-bold' 
                  : 'border-transparent text-theme-text/40 hover:text-theme-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-theme-border bg-transparent py-2 pl-8 pr-4 text-sm text-theme-text placeholder-theme-text/30 focus:outline-none focus:border-theme-accent transition-colors"
              />
              <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-theme-accent" />
            </div>
            <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-theme-text/60 hover:text-theme-accent">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
