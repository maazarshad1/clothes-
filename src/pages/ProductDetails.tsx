import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, products } = useStore();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-theme-bg text-theme-text">
        <h2 className="font-serif text-3xl mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-sm font-medium uppercase tracking-widest border-b border-theme-accent pb-1 hover:text-theme-accent transition">
          Return to Shop
        </Link>
      </div>
    );
  }

  const images = product.images || [product.image];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-theme-text">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-theme-text/60 hover:text-theme-accent transition mb-12">
        <ArrowLeft size={16} /> Back to Shop
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Images Slideshow */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-[60%] flex gap-4"
        >
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-4 w-20">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-[3/4] border-2 transition-all overflow-hidden ${activeImageIndex === idx ? 'border-theme-accent' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {product.video && (
              <button
                onClick={() => setIsVideoOpen(true)}
                className="aspect-[3/4] bg-theme-card flex items-center justify-center border-2 border-transparent hover:border-theme-accent transition-all relative overflow-hidden group"
              >
                <img src={images[0]} alt="Video thumbnail" className="w-full h-full object-cover opacity-50" />
                <Play size={24} className="absolute z-10 text-theme-accent group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          {/* Main Image */}
          <div className="flex-1 aspect-[3/4] bg-theme-card overflow-hidden relative group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={images[activeImageIndex]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Mobile Thumbnails (dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? 'bg-theme-accent w-4' : 'bg-theme-accent/20'}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-bg/60 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-theme-accent hover:text-theme-bg"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-bg/60 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-theme-accent hover:text-theme-bg"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Mobile Video Trigger */}
            {product.video && (
              <button
                onClick={() => setIsVideoOpen(true)}
                className="absolute top-4 right-4 md:hidden w-10 h-10 bg-theme-bg/60 backdrop-blur-sm flex items-center justify-center rounded-full text-theme-accent"
              >
                <Play size={20} />
              </button>
            )}
          </div>
        </motion.div>

          {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="mb-8 border-b border-theme-border pb-8">
            <p className="text-sm text-theme-accent uppercase tracking-widest mb-4 font-bold">{product.category}</p>
            <h1 className="font-serif text-4xl sm:text-5xl mb-4 text-theme-text">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-theme-accent">PKR {product.price}</span>
              <div className="flex text-theme-accent text-sm">
                <span className="mr-1">★</span> {product.rating}
              </div>
            </div>
            <p className="text-theme-text/80 leading-relaxed font-serif text-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-3 text-theme-text/60">Select Size</h3>
              <div className="flex gap-3">
                {['7', '8', '9', '10', '11'].map((size) => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border flex items-center justify-center hover:border-theme-accent transition ${selectedSize === size ? 'border-theme-accent bg-theme-accent text-theme-bg font-bold' : 'border-theme-border text-theme-text'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                if (!selectedSize) {
                  alert('Please select a size');
                  return;
                }
                addToCart(product, selectedSize);
              }}
              className="w-full bg-theme-accent text-theme-bg py-5 flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase hover:bg-white transition mt-8"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="border border-theme-border p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-theme-accent mb-1">Shipping</p>
                <p className="text-xs font-semibold">Free Nationwide</p>
              </div>
              <div className="border border-theme-border p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-theme-accent mb-1">Authentic</p>
                <p className="text-xs font-semibold">Premium Quality</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && product.video && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12"
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-8 right-8 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>
            <div className="w-full max-w-5xl aspect-video relative">
              <video 
                src={product.video} 
                className="w-full h-full" 
                controls 
                autoPlay 
                playsInline
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
