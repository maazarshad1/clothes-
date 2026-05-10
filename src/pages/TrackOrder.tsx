import React, { useState } from 'react';
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
    <div className="min-h-screen bg-zinc-50 pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif text-center mb-4 tracking-tight">Track Your Order</h1>
        <p className="text-center text-zinc-500 mb-10 max-w-lg mx-auto">
          Enter your order ID to keep an eye on your shipment. For any issues, please contact our support team.
        </p>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex bg-white border border-zinc-200 overflow-hidden shadow-sm">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. ORD-001"
              className="px-6 py-4 flex-1 outline-none font-medium placeholder:font-normal"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#111111] text-white px-8 uppercase tracking-widest text-xs font-bold hover:bg-[#d4af37] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={16} />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </form>

        {searchedOrder && (
          <div className="bg-white border border-zinc-100 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-6 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Order Details</p>
                <h2 className="text-2xl font-serif">{searchedOrder.id}</h2>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Ordered On</p>
                <p className="font-medium text-sm">{new Date(searchedOrder.date).toLocaleDateString()}</p>
              </div>
            </div>

            {searchedOrder.status === 'Cancelled' ? (
              <div className="text-center py-10 bg-red-50 border border-red-100 text-red-600 mb-8">
                <PackageOpen className="mx-auto mb-3" size={40} />
                <h3 className="text-xl font-bold mb-2">Order Cancelled</h3>
                <p className="text-sm">This order has been cancelled.</p>
              </div>
            ) : (
              <>
                <div className="mb-12 relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-zinc-100 -z-10">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#111111] transition-all duration-500" 
                      style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="flex justify-between text-center relative z-10">
                    {/* Step 1: Pending */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${activeStep >= 1 ? 'border-white bg-[#111111] text-white shadow-md' : 'border-white bg-zinc-100 text-zinc-400'}`}>
                        <Package size={20} />
                      </div>
                      <p className={`mt-3 text-xs uppercase tracking-wider font-bold ${activeStep >= 1 ? 'text-black' : 'text-zinc-400'}`}>Pending</p>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${activeStep >= 2 ? 'border-white bg-[#111111] text-white shadow-md' : 'border-white bg-zinc-100 text-zinc-400'}`}>
                        <PackageOpen size={20} />
                      </div>
                      <p className={`mt-3 text-xs uppercase tracking-wider font-bold ${activeStep >= 2 ? 'text-black' : 'text-zinc-400'}`}>Processing</p>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${activeStep >= 3 ? 'border-white bg-[#111111] text-white shadow-md' : 'border-white bg-zinc-100 text-zinc-400'}`}>
                        <Truck size={20} />
                      </div>
                      <p className={`mt-3 text-xs uppercase tracking-wider font-bold ${activeStep >= 3 ? 'text-black' : 'text-zinc-400'}`}>Shipped</p>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center w-1/4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${activeStep >= 4 ? 'border-white bg-[#d4af37] text-white shadow-md' : 'border-white bg-zinc-100 text-zinc-400'}`}>
                        <CheckCircle size={20} />
                      </div>
                      <p className={`mt-3 text-xs uppercase tracking-wider font-bold ${activeStep >= 4 ? 'text-black' : 'text-zinc-400'}`}>Delivered</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Estimated Delivery</p>
                    {activeStep === 4 ? (
                      <p className="text-xl font-serif text-[#d4af37]">Delivered</p>
                    ) : (
                      <p className="text-xl font-serif">{calculateEstimatedDelivery(searchedOrder.date)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Customer</p>
                    <p className="text-sm font-medium">{searchedOrder.customerName}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
