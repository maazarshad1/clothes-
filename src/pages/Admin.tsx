import React, { useState, useEffect, useRef } from 'react';
import { useStore, Product, Order } from '../context/StoreContext';
import { X, Bell } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus, addOrder, syncOrders } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isFirstSync, setIsFirstSync] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const triggerNotification = (order: Order) => {
    if (notificationPermission === 'granted') {
      new Notification('New Order Received!', {
        body: `Order ID: ${order.id}\nCustomer: ${order.customerName}\nTotal: $${order.total.toFixed(2)}`,
        icon: '/favicon.ico' // Or any app icon
      });
      
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  };

  // Sync orders with Firestore in real-time
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const isInitial = isFirstSync;
      if (isInitial) setIsFirstSync(false);

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isInitial) {
          const data = change.doc.data() as Order;
          const exists = orders.some(o => o.id === data.id);
          if (!exists) {
            triggerNotification(data);
            toast.success(`New Order Received: ${data.id}`, {
              duration: 5000,
              icon: '🛍️',
              style: {
                borderRadius: '0px',
                background: '#111111',
                color: '#fff',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }
            });
          }
        }
      });

      const syncedOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      syncOrders(syncedOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [isAuthenticated, orders.length]); // Re-run if length changes to help with notification logic

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect passcode');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F2ED] font-sans">
        <div className="bg-white p-8 border border-[rgba(0,0,0,0.05)] shadow-sm max-w-sm w-full">
          <h2 className="text-2xl font-serif mb-6 text-center">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Passcode</label>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter 1234"
                className="w-full border border-zinc-200 p-3 text-sm focus:outline-none focus:border-[#111111]" 
                required
              />
            </div>
            <button type="submit" className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: formData.get('image') as string,
      rating: parseFloat(formData.get('rating') as string) || 5,
      description: formData.get('description') as string,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as Order['status'];
    if (editingOrder) {
      try {
        await updateDoc(doc(db, 'orders', editingOrder.id), { status });
        updateOrderStatus(editingOrder.id, status);
        setEditingOrder(null);
        toast.success(`Order ${editingOrder.id} updated to ${status}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${editingOrder.id}`);
        toast.error('Failed to update order status');
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F2ED] font-sans overflow-hidden text-[#111111]">
      <Toaster position="top-right" />
      <div className="w-64 bg-[#111111] text-zinc-400 flex flex-col flex-shrink-0">
        <div className="p-8">
          <h2 className="text-white font-serif italic text-2xl tracking-widest uppercase">Fashion<br/>Admin</h2>
          <p className="text-[10px] tracking-[0.2em] mt-2 opacity-50">ADMINISTRATOR</p>
        </div>
        <ul className="flex-1 px-4 space-y-1 list-none m-0">
          <li className={`border-l-[3px] ${activeTab === 'products' ? 'border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white' : 'border-transparent hover:text-white'} flex items-center px-4 py-3 text-sm cursor-pointer transition`} onClick={() => setActiveTab('products')}>Products</li>
          <li className={`border-l-[3px] ${activeTab === 'orders' ? 'border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white' : 'border-transparent hover:text-white'} flex items-center px-4 py-3 text-sm cursor-pointer transition`} onClick={() => setActiveTab('orders')}>Orders</li>
        </ul>
      </div>

      <div className="flex-1 flex flex-col p-10 overflow-auto relative">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">Overview</span>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-serif italic">Admin Dashboard</h1>
              {notificationPermission !== 'granted' && (
                <button 
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] uppercase tracking-widest font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <Bell size={12} />
                  Enable Browser Notifications
                </button>
              )}
            </div>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="px-6 py-2 bg-[#111111] text-white text-xs uppercase tracking-widest hover:bg-black transition-colors"
            >
              Add Product
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Products</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">{products.length}</div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Orders</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">{orders.length}</div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Total Customers</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">890</div>
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.05)] p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Revenue</span>
            <div className="text-2xl mt-2 font-serif tracking-tight font-medium">${orders.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white border border-zinc-200 flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">
              {activeTab === 'products' ? 'Products Inventory' : 'Recent Orders'}
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              {activeTab === 'products' ? (
                <>
                  <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Image</th>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold text-right">Price</th>
                      <th className="px-6 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                        <td className="px-6 py-4">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover" />
                        </td>
                        <td className="px-6 py-4 font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-xs opacity-70">{product.category}</td>
                        <td className="px-6 py-4 font-serif text-right">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-4">
                            <button onClick={() => setEditingProduct(product)} className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Edit</button>
                            <button onClick={() => deleteProduct(product.id)} className="text-rose-600 hover:underline text-xs uppercase tracking-widest font-semibold">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-left">Order ID</th>
                      <th className="px-6 py-3 font-semibold text-left">Customer</th>
                      <th className="px-6 py-3 font-semibold text-left">Address</th>
                      <th className="px-6 py-3 font-semibold text-left">Date</th>
                      <th className="px-6 py-3 font-semibold text-right">Total</th>
                      <th className="px-6 py-3 font-semibold text-center">Status</th>
                      <th className="px-6 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                        <td className="px-6 py-4 font-medium">{order.id}</td>
                        <td className="px-6 py-4">
                          <div>{order.customerName}</div>
                          <div className="text-xs opacity-60">{order.email}</div>
                          <div className="text-xs opacity-60">{order.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-xs opacity-70">
                          <div>{order.address}</div>
                          <div>{order.city}, {order.postalCode}</div>
                        </td>
                        <td className="px-6 py-4 text-xs opacity-70">{order.date}</td>
                        <td className="px-6 py-4 font-serif text-right">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold ${
                            order.status === 'Delivered' ? 'text-green-600 bg-green-50' :
                            order.status === 'Shipped' ? 'text-blue-600 bg-blue-50' :
                            order.status === 'Pending' ? 'text-amber-600 bg-amber-50' :
                            'text-zinc-600 bg-zinc-100'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-4">
                            <button onClick={() => setViewingOrder(order)} className="text-blue-600 hover:underline text-xs uppercase tracking-widest font-semibold">View Details</button>
                            <button onClick={() => setEditingOrder(order)} className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Update Status</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>

        {/* Edit/Add Product Modal */}
        {(isAddingProduct || editingProduct) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-md p-8 relative shadow-2xl border border-zinc-100">
              <button 
                onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-serif italic mb-6">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Name</label>
                  <input name="name" defaultValue={editingProduct?.name || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Price</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Category</label>
                    <input name="category" defaultValue={editingProduct?.category || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Image URL</label>
                  <input name="image" defaultValue={editingProduct?.image || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} required className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]"></textarea>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-sm p-8 relative shadow-2xl border border-zinc-100">
              <button 
                onClick={() => setEditingOrder(null)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-serif italic mb-6">Update Order</h2>
              <div className="mb-4 text-sm">
                <p><span className="opacity-50">Order ID:</span> {editingOrder.id}</p>
                <p><span className="opacity-50">Customer:</span> {editingOrder.customerName}</p>
              </div>
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Status</label>
                  <select name="status" defaultValue={editingOrder.status} className="w-full border border-zinc-200 p-2 text-sm focus:outline-none focus:border-[#111111]">
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    Save Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {viewingOrder && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-2xl p-8 relative shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setViewingOrder(null)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Order Details</p>
                  <h2 className="text-2xl font-serif">{viewingOrder.id}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Date</p>
                  <p className="text-sm font-medium">{viewingOrder.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-2">Customer Info</h3>
                  <p className="font-medium">{viewingOrder.customerName}</p>
                  <p className="text-zinc-600">{viewingOrder.email}</p>
                  <p className="text-zinc-600">{viewingOrder.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-2">Shipping Address</h3>
                  <p>{viewingOrder.address}</p>
                  <p>{viewingOrder.city}, {viewingOrder.postalCode}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-2">Payment Info</h3>
                  <p>{viewingOrder.paymentMethod}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-2">Current Status</h3>
                  <p className="font-bold text-[#C5A059]">{viewingOrder.status}</p>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-6">
                <h3 className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-4">Purchased Items</h3>
                <div className="space-y-4">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.cartItemId || item.id} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover bg-zinc-100" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity}{item.size ? ` • Size: ${item.size}` : ''}</p>
                      </div>
                      <p className="font-serif">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-100 mt-6 pt-4 flex justify-between items-center text-lg">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-serif italic text-2xl">${viewingOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
