import React, { useState } from 'react';
import { useStore, Order } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Checkout = () => {
  const { cart, addOrder, clearCart } = useStore();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash on Delivery'>('Card');

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderId = `ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const newOrder: Order = {
      id: orderId,
      customerName: `${firstName} ${lastName}`.trim() || 'Guest Customer',
      email,
      phoneNumber,
      address,
      city,
      postalCode,
      items: [...cart], // Clone to avoid reference issues after clearing
      paymentMethod,
      total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      // Save to local context
      addOrder(newOrder);

      // Save to Firestore for notifications
      await setDoc(doc(db, 'orders', orderId), {
        ...newOrder,
        createdAt: serverTimestamp()
      });

      toast.success('Order placed successfully!');
      clearCart();
      
      // Pass the created order ID to the track-order page
      navigate('/track-order', { state: { newOrderId: newOrder.id } });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-theme-bg text-theme-text">
        <h2 className="font-serif text-3xl mb-4">Your cart is empty</h2>
        <Link to="/shop" className="text-sm border-b border-theme-accent pb-1 uppercase tracking-widest hover:text-theme-accent transition">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-theme-bg text-theme-text min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-serif text-5xl mb-12 text-center text-theme-accent">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1 space-y-12">
            {/* Form */}
            <section>
              <h2 className="text-xl font-serif mb-6 border-b border-theme-border pb-2">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="col-span-2 sm:col-span-1 p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="col-span-2 sm:col-span-1 p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required className="col-span-2 p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif mb-6 border-b border-theme-border pb-2">Payment</h2>
              
              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Card" 
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                    className="w-4 h-4 accent-theme-accent"
                  />
                  <span className="text-sm font-bold uppercase tracking-widest">Credit Card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="w-4 h-4 accent-theme-accent"
                  />
                  <span className="text-sm font-bold uppercase tracking-widest">Cash on Delivery</span>
                </label>
              </div>

              {paymentMethod === 'Card' && (
                <div className="grid grid-cols-1 gap-4">
                  <input type="text" placeholder="Card Number" required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                    <input type="text" placeholder="CVC" required className="p-3 border border-theme-border bg-theme-card focus:outline-none focus:border-theme-accent text-theme-text" />
                  </div>
                </div>
              )}
            </section>

            <button 
              type="submit"
              className="w-full bg-theme-accent text-theme-bg py-5 font-bold uppercase tracking-[0.2em] hover:bg-white transition"
            >
              Place Order
            </button>
          </div>

          <div className="lg:w-[400px]">
            <div className="bg-theme-card p-8 border border-theme-border">
              <h2 className="font-serif text-2xl mb-6 border-b border-theme-border pb-4 text-theme-accent">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-theme-bg" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-serif text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-theme-accent">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-theme-accent">
                      PKR {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm mb-6 border-y border-theme-border py-6">
                <div className="flex justify-between">
                  <span className="text-theme-text/60 uppercase tracking-widest text-xs">Subtotal</span>
                  <span className="font-bold">PKR {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text/60 uppercase tracking-widest text-xs">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'Free' : `PKR ${shipping}`}</span>
                </div>
              </div>

              <div className="flex justify-between font-serif text-2xl text-theme-accent">
                <span>Total</span>
                <span>PKR {total}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
