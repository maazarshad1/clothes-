import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { products } from '../data/products';
import { ShoppingBag, Heart } from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
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

const Home = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] sm:h-[90vh] bg-black">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80" 
          alt="Fashion Hero" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h4 className="text-xs tracking-[0.3em] font-semibold uppercase mb-4 text-white/80">Premium Collection</h4>
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light mb-8 leading-tight">Elevate Your<br />Everyday Look</h1>
            <Link 
              to="/shop" 
              className="inline-block border border-white/30 bg-white/10 backdrop-blur-sm px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-black transition duration-300"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/shop?category=Women" className="group relative h-[600px] overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80" 
              alt="Women" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-serif text-5xl text-white font-light tracking-wide">Women</h2>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-500">
              <span className="text-white text-xs uppercase tracking-widest border-b border-white pb-1">Shop Now</span>
            </div>
          </Link>
          
          <Link to="/shop?category=Men" className="group relative h-[600px] overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&auto=format&fit=crop&q=80" 
              alt="Men" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-serif text-5xl text-white font-light tracking-wide">Men</h2>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-500">
              <span className="text-white text-xs uppercase tracking-widest border-b border-white pb-1">Shop Now</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col items-center mb-16">
          <h2 className="font-serif text-4xl mb-4 text-center">New Arrivals</h2>
          <div className="w-16 h-px bg-[#d4af37]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link 
            to="/shop" 
            className="inline-block border border-black px-10 py-4 text-sm tracking-widest uppercase font-medium hover:bg-black hover:text-white transition duration-300"
          >
            View All
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
