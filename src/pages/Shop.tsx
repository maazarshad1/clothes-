import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
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
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="flex gap-2">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-white text-black py-3 text-xs font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className="bg-white text-black p-3 hover:bg-black hover:text-white transition flex items-center justify-center"
            >
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-serif text-lg hover:text-[#d4af37] transition">{product.name}</h3>
          </Link>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="text-right">
          <span className="font-medium">${product.price.toFixed(2)}</span>
          <div className="text-xs text-yellow-500 mt-1">★ {product.rating}</div>
        </div>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'All');

  const categories = ['All', 'Women', 'Men', 'Kids', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="font-serif text-5xl mb-4">Collection</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase">Explore our latest pieces</p>
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
                className={`text-sm tracking-widest uppercase pb-1 border-b-2 transition-colors ${
                  activeCategory === cat 
                  ? 'border-black text-black font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-black'
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
                className="w-full border-b border-gray-300 py-2 pl-8 pr-4 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-gray-600 hover:text-black">
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
