import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, products } = useStore();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-3xl mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-sm font-medium uppercase tracking-widest border-b border-black pb-1 hover:text-[#d4af37] hover:border-[#d4af37] transition">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-black transition mb-12">
        <ArrowLeft size={16} /> Back to Shop
      </Link>
      
      <div className="flex flex-col md:flex-row gap-16">
        {/* Images */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="mb-8 border-b border-gray-200 pb-8">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">{product.category}</p>
            <h1 className="font-serif text-4xl sm:text-5xl mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl">${product.price.toFixed(2)}</span>
              <div className="flex text-yellow-500 text-sm">
                <span>★</span> {product.rating}
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed font-serif text-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-3">Size</h3>
              <div className="flex gap-3">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button key={size} className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:border-black transition">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => addToCart(product)}
              className="w-full bg-black text-white py-5 flex items-center justify-center gap-3 text-sm font-semibold tracking-widest uppercase hover:bg-[#d4af37] transition mt-8"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <p className="text-xs text-center text-gray-500 uppercase tracking-widest">
              Free shipping and easy returns
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
