import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore, Order } from '../context/StoreContext';
import { Package, Truck, Search, CheckCircle, PackageOpen } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TrackOrder = () => {
  const { orders } = useStore();
  const [searchId, setSearchId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');

    // First check local orders
    const foundOrder = orders.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase());
    
    if (foundOrder) {
      setSearchedOrder(foundOrder);
      setLoading(false);
      return;
    }

    // If not found in local context, check Firestore
    try {
      const orderDoc = await getDoc(doc(db, 'orders', searchId.trim()));
      if (orderDoc.exists()) {
        const data = orderDoc.data() as Order;
        setSearchedOrder(data);
      } else {
        setSearchedOrder(null);
        setError('No order found with the provided ID. Please check and try again.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${searchId.trim()}`);
      setError('An error occurred while tracking your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const calculateEstimatedDelivery = (orderDate: string) => {
    const date = new Date(orderDate);
    // Add 5-7 days for delivery estimation
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const activeStep = searchedOrder ? getStatusStep(searchedOrder.status) : 0;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-serif text-center mb-6 tracking-tight text-theme-accent uppercase">Track Order</h1>
        <p className="text-center text-theme-text/60 mb-16 max-w-xl mx-auto font-serif text-lg">
          Please enter your unique Order ID to receive real-time updates on your shipment status.
        </p>

        <form onSubmit={handleSearch} className="mb-16">
          <div className="flex bg-theme-card border border-theme-border overflow-hidden shadow-2xl max-w-2xl mx-auto">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. ORD-12345"
              className="px-8 py-5 flex-1 outline-none font-medium bg-theme-bg text-theme-text placeholder:text-theme-text/30"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-theme-accent text-theme-bg px-10 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-4 text-center font-bold uppercase tracking-widest">{error}</p>}
        </form>

        {searchedOrder && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-card border border-theme-border shadow-2xl p-10"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-theme-border pb-8 mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-theme-accent font-bold mb-2">Identification</p>
                <h2 className="text-3xl font-serif">{searchedOrder.id}</h2>
              </div>
              <div className="mt-6 sm:mt-0 text-left sm:text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] text-theme-accent font-bold mb-2">Manifested On</p>
                <p className="font-bold text-base">{new Date(searchedOrder.date).toLocaleDateString()}</p>
              </div>
            </div>

            {searchedOrder.status === 'Cancelled' ? (
              <div className="text-center py-16 bg-red-950/20 border border-red-500/20 text-red-500 mb-10">
                <PackageOpen className="mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-serif mb-2">Order Revoked</h3>
                <p className="text-sm uppercase tracking-widest font-bold">This shipment has been cancelled by administration.</p>
              </div>
            ) : (
              <>
                <div className="mb-16 relative px-4">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-theme-border -z-0">
                    <div 
                      className="absolute top-0 left-0 h-full bg-theme-accent transition-all duration-700 shadow-[0_0_10px_rgba(197,160,89,0.5)]" 
                      style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="flex justify-between text-center relative z-10">
                    {/* Step 1: Pending */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${activeStep >= 1 ? 'border-theme-accent bg-theme-accent text-theme-bg shadow-lg shadow-theme-accent/20' : 'border-theme-border bg-theme-bg text-theme-text/20'}`}>
                        <Package size={22} />
                      </div>
                      <p className={`mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${activeStep >= 1 ? 'text-theme-accent' : 'text-theme-text/20'}`}>Pending</p>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${activeStep >= 2 ? 'border-theme-accent bg-theme-accent text-theme-bg shadow-lg shadow-theme-accent/20' : 'border-theme-border bg-theme-bg text-theme-text/20'}`}>
                        <PackageOpen size={22} />
                      </div>
                      <p className={`mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${activeStep >= 2 ? 'text-theme-accent' : 'text-theme-text/20'}`}>Processing</p>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${activeStep >= 3 ? 'border-theme-accent bg-theme-accent text-theme-bg shadow-lg shadow-theme-accent/20' : 'border-theme-border bg-theme-bg text-theme-text/20'}`}>
                        <Truck size={22} />
                      </div>
                      <p className={`mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${activeStep >= 3 ? 'text-theme-accent' : 'text-theme-text/20'}`}>Shipped</p>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${activeStep >= 4 ? 'border-white bg-white text-theme-bg shadow-lg' : 'border-theme-border bg-theme-bg text-theme-text/20'}`}>
                        <CheckCircle size={22} />
                      </div>
                      <p className={`mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${activeStep >= 4 ? 'text-white' : 'text-theme-text/20'}`}>Delivered</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 p-8 flex flex-col md:flex-row justify-between items-center gap-8 border border-theme-border">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-theme-accent font-bold mb-2">Arrival Projection</p>
                    {activeStep === 4 ? (
                      <p className="text-3xl font-serif text-white uppercase tracking-widest">Received</p>
                    ) : (
                      <p className="text-2xl font-serif text-theme-text">{calculateEstimatedDelivery(searchedOrder.date)}</p>
                    )}
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-theme-accent font-bold mb-2">Recipient</p>
                    <p className="text-lg font-serif text-theme-text">{searchedOrder.customerName}</p>
                    <p className="text-xs text-theme-text/40">{searchedOrder.city}, Pakistan</p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-theme-border">
                   <div className="flex justify-between items-center bg-theme-accent/10 p-4 border border-theme-accent/20">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-theme-accent">Total Amount</span>
                      <span className="text-xl font-bold text-theme-text">PKR {searchedOrder.total}</span>
                   </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
