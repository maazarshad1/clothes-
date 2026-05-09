import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-4xl mb-6">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Discover something perfect for your wardrobe.
        </p>
        <Link 
          to="/shop" 
          className="bg-black text-white px-8 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-[#d4af37] transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-5xl mb-12 text-center">Shopping Bag</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="border-b border-gray-200 pb-4 mb-6 hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold tracking-widest uppercase text-gray-500">
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
                className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center border-b border-gray-100 pb-6"
              >
                {/* Product Info */}
                <div className="col-span-6 flex items-center gap-4 w-full">
                  <div className="w-24 h-32 flex-shrink-0 bg-gray-100 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="absolute -top-2 -left-2 bg-white rounded-full p-1 shadow hover:text-red-500 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                    {item.size && <p className="text-sm text-gray-500 mb-1">Size: {item.size}</p>}
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-3 flex justify-center w-full sm:w-auto">
                  <div className="flex items-center border border-gray-300">
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-3 text-right text-lg font-serif w-full sm:w-auto text-center sm:text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-[#f5f2ed] p-8">
            <h2 className="font-serif text-2xl mb-6 border-b border-black/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 border-b border-black/10 pb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between font-serif text-2xl mb-8">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link 
              to="/checkout"
              className="w-full bg-black text-white py-4 flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase hover:bg-[#d4af37] transition"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4 uppercase tracking-wider">
              Free shipping on orders over $200
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
