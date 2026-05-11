import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-theme-bg text-theme-text">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Your Cart is Empty</h2>
          <p className="text-theme-text/60 mb-8 text-center max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Discover something perfect for your lifestyle.
          </p>
          <Link 
            to="/shop" 
            className="bg-theme-accent text-theme-bg px-10 py-5 text-sm font-bold tracking-widest uppercase hover:bg-white transition inline-block"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-theme-bg text-theme-text min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-serif text-5xl mb-12 text-center text-theme-accent">Shopping Bag</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="border-b border-theme-border pb-4 mb-6 hidden sm:grid grid-cols-12 gap-4 text-xs font-bold tracking-[0.2em] uppercase text-theme-accent">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-6">
              {cart.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center border-b border-theme-border pb-6"
                >
                  {/* Product Info */}
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <div className="w-24 h-32 flex-shrink-0 bg-theme-card relative overflow-hidden">
                      <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="absolute -top-1 -left-1 bg-theme-accent text-theme-bg rounded-none p-1 shadow hover:bg-white transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-theme-text">{item.name}</h3>
                      <p className="text-xs uppercase tracking-widest text-theme-accent mb-1">{item.category}</p>
                      <div className="flex gap-4 text-xs text-theme-text/60 mb-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <p className="font-bold text-theme-text/80">PKR {item.price}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 flex justify-center w-full sm:w-auto">
                    <div className="flex items-center border border-theme-border bg-theme-card">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-3 py-2 hover:text-theme-accent transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-3 py-2 hover:text-theme-accent transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-3 text-right text-lg font-serif w-full sm:w-auto text-center sm:text-right text-theme-accent">
                    PKR {item.price * item.quantity}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-theme-card p-8 border border-theme-border">
              <h2 className="font-serif text-2xl mb-6 border-b border-theme-border pb-4 text-theme-accent">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6 border-b border-theme-border pb-6">
                <div className="flex justify-between">
                  <span className="text-theme-text/60 tracking-widest uppercase text-xs">Subtotal</span>
                  <span className="font-bold">PKR {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text/60 tracking-widest uppercase text-xs">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'Free' : `PKR ${shipping}`}</span>
                </div>
              </div>

              <div className="flex justify-between font-serif text-2xl mb-8 text-theme-accent">
                <span>Total</span>
                <span>PKR {total}</span>
              </div>

              <Link 
                to="/checkout"
                className="w-full bg-theme-accent text-theme-bg py-5 flex items-center justify-center gap-2 text-sm font-bold tracking-[0.2em] uppercase hover:bg-white transition"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <p className="text-[10px] text-theme-text/40 text-center mt-6 uppercase tracking-[0.25em]">
                Free shipping on orders over PKR 5000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
