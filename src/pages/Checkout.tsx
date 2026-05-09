import React, { useState } from 'react';
import { useStore, Order } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, addOrder, clearCart } = useStore();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash on Delivery'>('Card');

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      customerName: `${firstName} ${lastName}`.trim() || 'Guest Customer',
      email,
      address,
      city,
      postalCode,
      items: cart,
      paymentMethod,
      total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    addOrder(newOrder);
    clearCart();
    
    // Pass the created order ID to the track-order page
    navigate('/track-order', { state: { newOrderId: newOrder.id } });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-3xl mb-4">Your cart is empty</h2>
        <Link to="/shop" className="text-sm border-b border-black pb-1 uppercase tracking-widest hover:text-[#d4af37] hover:border-[#d4af37] transition">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-4xl mb-12 text-center">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1 space-y-12">
          {/* Form */}
          <section>
            <h2 className="text-xl font-serif mb-6 border-b border-gray-200 pb-2">Shipping Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
              <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
              <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="col-span-2 p-3 border border-gray-300 focus:outline-none focus:border-black" />
              <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required className="col-span-2 p-3 border border-gray-300 focus:outline-none focus:border-black" />
              <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
              <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif mb-6 border-b border-gray-200 pb-2">Payment</h2>
            
            <div className="flex gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Card" 
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  className="w-4 h-4 text-black focus:ring-black"
                />
                <span>Credit Card</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="w-4 h-4 text-black focus:ring-black"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>

            {paymentMethod === 'Card' && (
              <div className="grid grid-cols-1 gap-4">
                <input type="text" placeholder="Card Number" required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
                  <input type="text" placeholder="CVC" required className="p-3 border border-gray-300 focus:outline-none focus:border-black" />
                </div>
              </div>
            )}
          </section>

          <button 
            type="submit"
            className="w-full bg-black text-white py-4 font-semibold uppercase tracking-widest hover:bg-[#d4af37] transition"
          >
            Place Order
          </button>
        </div>

        <div className="lg:w-[400px]">
          <div className="bg-[#f5f2ed] p-8">
            <h2 className="font-serif text-2xl mb-6 border-b border-black/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-20 object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <h4 className="font-serif text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm mb-6 border-y border-black/10 py-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between font-serif text-2xl">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
