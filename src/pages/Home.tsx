import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Heart } from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
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
              className="bg-white text-black border border-black/10 p-3 hover:bg-black hover:text-white transition flex items-center justify-center"
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
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] bg-black">
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
            <h4 className="text-[10px] tracking-[0.3em] font-semibold uppercase mb-2 text-white">Premium Collection</h4>
            <h1 className="font-serif text-4xl sm:text-6xl font-light mb-6 leading-tight">Urban Elegance</h1>
            <Link 
              to="/shop" 
              className="inline-block border border-white px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-white hover:text-black transition duration-300"
            >
              Shop All
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products (Moved up and section padding reduced) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white shadow-sm border border-black/5 mt-[-2rem] relative z-10">
        <div className="flex flex-col items-center mb-12">
          <h2 className="font-serif text-3xl mb-3 text-center">New Arrivals</h2>
          <div className="w-12 h-px bg-[#d4af37]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            to="/shop" 
            className="inline-block border border-black px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-black hover:text-white transition duration-300"
          >
            Explore Full Collection
          </Link>
        </div>
      </section>

      {/* Optional: Small Categories bar if needed, but keeping it minimal as requested */}

    </div>
  );
};

export default Home;
