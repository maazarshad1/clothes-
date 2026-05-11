import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Product, useStore } from '../context/StoreContext';
import { ShoppingBag, Heart, Search, SlidersHorizontal, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const navigate = useNavigate();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-theme-card mb-4">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image || undefined} 
            alt={product.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </Link>
        
        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-all group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                navigate(`/product/${product.id}`);
              }}
              className="w-full bg-theme-accent text-theme-bg py-3 text-xs font-bold uppercase tracking-wider hover:bg-white transition flex items-center justify-center gap-2"
            >
              <CreditCard size={16} /> Buy Now
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigate(`/product/${product.id}`);
                }}
                className="flex-1 bg-white text-theme-bg py-3 text-xs font-bold uppercase tracking-wider hover:bg-theme-accent transition flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Options
              </button>
              <button 
                onClick={() => toggleWishlist(product)}
                className="bg-theme-bg/80 backdrop-blur-sm text-theme-accent border border-theme-border p-3 hover:bg-theme-accent hover:text-theme-bg transition flex items-center justify-center"
              >
                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${product.id}`} className="flex-1 overflow-hidden">
            <h3 className="font-serif text-lg hover:text-theme-accent transition truncate">{product.name}</h3>
          </Link>
          <button 
            onClick={() => navigate(`/product/${product.id}`)}
            className="text-[10px] bg-theme-accent text-theme-bg px-1.5 py-0.5 rounded font-bold uppercase shrink-0 mt-1.5"
          >
            Buy
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {product.colors?.map((color, idx) => (
            <span key={idx} className="text-[8px] px-1 border border-theme-border text-theme-text/40 lowercase italic">
              {color}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs uppercase tracking-widest text-theme-text/40">{product.category}</p>
          <div className="text-right">
            <span className="font-semibold text-theme-accent">PKR {product.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const { products, collections } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const collectionParam = searchParams.get('collection');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCollection, setActiveCollection] = useState<string>('All');
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const collectionParam = searchParams.get('collection');
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
      if (!collectionParam) setActiveCollection('All');
    } else {
      setActiveCategory('All');
    }

    if (collectionParam) {
      setActiveCollection(collectionParam);
      if (!categoryParam) setActiveCategory('All');
    } else if (!categoryParam) {
      setActiveCollection('All');
    }

    // Scroll to products if filtered
    if ((categoryParam || collectionParam) && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)].filter(c => c);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesCollection = activeCollection === 'All' || product.collections?.includes(activeCollection) || product.collections?.includes(collections.find(c => c.id === activeCollection)?.name || '');
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesCollection && matchesSearch;
    });
  }, [activeCategory, activeCollection, searchQuery, collections]);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      {/* Header */}
      <div className="bg-black/40 text-theme-text py-20 text-center border-b border-theme-border">
        <h1 className="font-serif text-6xl mb-4 uppercase tracking-tighter">The Collection</h1>
        <p className="text-theme-accent text-sm tracking-[0.3em] uppercase">Premium Apparel by DOPE PK</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Collection Selector */}
        <div className="mb-12 border-b border-theme-border pb-6 overflow-x-auto">
          <p className="text-[10px] uppercase tracking-[0.4em] text-theme-accent font-bold mb-4">Curated Selections</p>
          <div className="flex gap-6 whitespace-nowrap min-w-full pb-2">
            <button
              onClick={() => {
                setActiveCollection('All');
                searchParams.delete('collection');
                setSearchParams(searchParams);
              }}
              className={`text-xl font-serif tracking-tight transition-all ${
                activeCollection === 'All' ? 'text-theme-accent underline decoration-2 underline-offset-8' : 'text-theme-text/40 hover:text-theme-text'
              }`}
            >
              All Items
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  setActiveCollection(col.id);
                  searchParams.set('collection', col.id);
                  setSearchParams(searchParams);
                }}
                className={`text-xl font-serif tracking-tight transition-all ${
                  activeCollection === col.id ? 'text-theme-accent underline decoration-2 underline-offset-8' : 'text-theme-text/40 hover:text-theme-text'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-[10px] uppercase tracking-widest text-theme-text/40 font-bold mr-2">Divisions:</span>
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

        {/* Product Grid Area */}
        <div ref={productsRef} className="scroll-mt-32">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-500">
              <p className="text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
