import React, { useState, useEffect, useRef } from 'react';
import { useStore, Product, Order } from '../context/StoreContext';
import { X, Bell, Download } from 'lucide-react';
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

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
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
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_auth') === 'true';
    }
    return false;
  });
  const [passcode, setPasscode] = useState('');
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus, addOrder, syncOrders, syncProducts } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isFirstSyncRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const triggerNotification = (order: Order) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = 'New Order Received!';
      const body = `Order ID: ${order.id}\nCustomer: ${order.customerName}\nTotal: $${order.total.toFixed(2)}`;
      
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              vibrate: [200, 100, 200],
              tag: 'order-' + order.id,
              renotify: true,
              data: { url: window.location.origin + '/#/admin' }
            } as any);
          });
        } else {
          new Notification(title, {
            body,
            icon: '/favicon.ico'
          });
        }
      } catch (e) {
        // Fallback for some browsers or standalone modes
        console.error('Notification failed:', e);
      }
      
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  };

  const testNotification = () => {
    if (notificationPermission !== 'granted') {
      alert('Please grant notification permission first.');
      return;
    }
    
    const title = 'Test Notification';
    const body = 'If you see this, your notifications are working!';

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          data: { url: window.location.origin + '/#/admin' }
        } as any);
      });
    } else {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
    
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio test failed:', e));
    }
    toast.success('Test notification sent!');
  };

  // Sync orders with Firestore in real-time
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const isInitial = isFirstSyncRef.current;
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isInitial) {
          const data = change.doc.data() as Order;
          // Verify we aren't notifying for an order that's already in the local state's initial batch
          triggerNotification(data);
          toast.success(`New Order Received: ${data.id}`, {
            duration: 8000,
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
      });

      if (isInitial) isFirstSyncRef.current = false;

      const syncedOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      syncOrders(syncedOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Sync products with Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const syncedProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      syncProducts(syncedProducts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Incorrect passcode');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
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

  const initDatabase = async () => {
    if (products.length > 0 && !window.confirm('Products already exist. Do you want to re-initialize? (This might create duplicates)')) {
      return;
    }
    
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      const { products: defaultProducts } = await import('../data/products');
      
      for (const product of defaultProducts) {
        await setDoc(doc(db, 'products', product.id), product);
      }
      toast.success('Database initialized with default products!');
    } catch (error) {
      toast.error('Initialization failed');
      handleFirestoreError(error, OperationType.WRITE, 'products/initialization');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = editingProduct ? editingProduct.id : Date.now().toString();
    const productData = {
      id: productId,
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: formData.get('image') as string,
      rating: parseFloat(formData.get('rating') as string) || 5,
      description: formData.get('description') as string,
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated');
      } else {
        const { setDoc, doc } = await import('firebase/firestore');
        await setDoc(doc(db, 'products', productId), productData);
        toast.success('Product added');
      }
      setEditingProduct(null);
      setIsAddingProduct(false);
    } catch (error) {
      toast.error('Failed to save product');
      handleFirestoreError(error, OperationType.WRITE, `products/${productId}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
      } catch (error) {
        toast.error('Delete failed');
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error(`Update failed: ${errorMsg}`);
        handleFirestoreError(error, OperationType.UPDATE, `orders/${editingOrder.id}`);
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F2ED] font-sans overflow-hidden text-[#111111] relative">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-64 bg-[#111111] text-zinc-400 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-start">
          <div>
            <h2 className="text-white font-serif italic text-2xl tracking-widest uppercase">Fashion<br/>Admin</h2>
            <p className="text-[10px] tracking-[0.2em] mt-2 opacity-50">ADMINISTRATOR</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white p-2">
            <X size={20} />
          </button>
        </div>
        <ul className="flex-1 px-4 space-y-1 list-none m-0">
          <li 
            className={`border-l-[3px] ${activeTab === 'products' ? 'border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white' : 'border-transparent hover:text-white'} flex items-center px-4 py-3 text-sm cursor-pointer transition`} 
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
          >
            Products
          </li>
          <li 
            className={`border-l-[3px] ${activeTab === 'orders' ? 'border-[#C5A059] bg-[rgba(255,255,255,0.05)] text-white' : 'border-transparent hover:text-white'} flex items-center px-4 py-3 text-sm cursor-pointer transition`} 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
          >
            Orders
          </li>
          <li 
            className="border-l-[3px] border-transparent hover:text-white flex items-center px-4 py-3 text-sm cursor-pointer transition mt-auto opacity-50 hover:opacity-100"
            onClick={handleLogout}
          >
            Logout
          </li>
        </ul>
      </div>

      <div className="flex-1 flex flex-col overflow-auto relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#111111] text-white">
          <h2 className="text-sm font-serif italic tracking-widest uppercase">Urban Style</h2>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-4 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">Overview</span>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <h1 className="text-3xl lg:text-4xl font-serif italic">Admin Dashboard</h1>
                <div className="flex flex-wrap gap-2">
                  {notificationPermission !== 'granted' ? (
                    <button 
                      onClick={requestNotificationPermission}
                      className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] uppercase tracking-widest font-bold border border-amber-200 hover:bg-amber-100 transition-colors w-fit"
                    >
                      <Bell size={12} />
                      Enable Browser Notifications
                    </button>
                  ) : (
                    <button 
                      onClick={testNotification}
                      className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[10px] uppercase tracking-widest font-bold border border-green-200 hover:bg-green-100 transition-colors w-fit"
                    >
                      <Bell size={12} />
                      Test Notification
                    </button>
                  )}
                  {deferredPrompt && (
                    <button 
                      onClick={handleInstallClick}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase tracking-widest font-bold border border-blue-200 hover:bg-blue-100 transition-colors w-fit"
                    >
                      <Download size={12} />
                      Install App
                    </button>
                  )}
                  <button 
                    onClick={initDatabase}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-700 text-[10px] uppercase tracking-widest font-bold border border-zinc-200 hover:bg-zinc-200 transition-colors w-fit"
                  >
                    Restore Default Items
                  </button>
                </div>
              </div>
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="px-6 py-3 lg:py-2 bg-[#111111] text-white text-xs uppercase tracking-widest hover:bg-black transition-colors w-full lg:w-auto"
              >
                Add Product
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            <div className="bg-white border border-[rgba(0,0,0,0.05)] p-4 lg:p-6 flex flex-col justify-between h-28 lg:h-32">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Products</span>
              <div className="text-xl lg:text-2xl mt-1 font-serif tracking-tight font-medium">{products.length}</div>
            </div>
            <div className="bg-white border border-[rgba(0,0,0,0.05)] p-4 lg:p-6 flex flex-col justify-between h-28 lg:h-32">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Orders</span>
              <div className="text-xl lg:text-2xl mt-1 font-serif tracking-tight font-medium">{orders.length}</div>
            </div>
            <div className="bg-white border border-[rgba(0,0,0,0.05)] p-4 lg:p-6 flex flex-col justify-between h-28 lg:h-32">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Customers</span>
              <div className="text-xl lg:text-2xl mt-1 font-serif tracking-tight font-medium">890</div>
            </div>
            <div className="bg-white border border-[rgba(0,0,0,0.05)] p-4 lg:p-6 flex flex-col justify-between h-28 lg:h-32">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold font-bold">Revenue</span>
              <div className="text-xl lg:text-2xl mt-1 font-serif tracking-tight font-medium truncate">${orders.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="min-h-0 bg-white border border-zinc-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold">
                {activeTab === 'products' ? 'Inventory' : 'Recent Orders'}
              </h3>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
                {activeTab === 'products' ? (
                  <>
                    <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 font-semibold">Image</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold">Product</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold">Category</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-right">Price</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                          <td className="px-4 lg:px-6 py-4">
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover" />
                          </td>
                          <td className="px-4 lg:px-6 py-4 font-medium">{product.name}</td>
                          <td className="px-4 lg:px-6 py-4 text-xs opacity-70">{product.category}</td>
                          <td className="px-4 lg:px-6 py-4 font-serif text-right">${product.price.toFixed(2)}</td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex justify-center gap-4">
                              <button onClick={() => setEditingProduct(product)} className="text-[#C5A059] hover:underline text-xs uppercase tracking-widest font-semibold">Edit</button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="text-rose-600 hover:underline text-xs uppercase tracking-widest font-semibold">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-left">ID</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-left">Customer</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-left hidden lg:table-cell">Address</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-left">Date</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-right">Total</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-center">Status</th>
                        <th className="px-4 lg:px-6 py-3 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50">
                          <td className="px-4 lg:px-6 py-4 font-medium">{order.id}</td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="truncate max-w-[100px] lg:max-w-none">{order.customerName}</div>
                            <div className="text-[10px] opacity-60 truncate lg:max-w-none">{order.email}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-xs opacity-70 hidden lg:table-cell">
                            <div className="truncate">{order.address}</div>
                            <div className="truncate">{order.city}, {order.postalCode}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-[10px] lg:text-xs opacity-70">{order.date}</td>
                          <td className="px-4 lg:px-6 py-4 font-serif text-right">${order.total.toFixed(2)}</td>
                          <td className="px-4 lg:px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-[8px] lg:text-[10px] uppercase tracking-widest font-bold ${
                              order.status === 'Delivered' ? 'text-green-600 bg-green-50' :
                              order.status === 'Shipped' ? 'text-blue-600 bg-blue-50' :
                              order.status === 'Pending' ? 'text-amber-600 bg-amber-50' :
                              'text-zinc-600 bg-zinc-100'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-center">
                            <div className="flex flex-col lg:flex-row justify-center gap-2 lg:gap-4">
                              <button onClick={() => setViewingOrder(order)} className="text-blue-600 hover:underline text-[10px] lg:text-xs uppercase tracking-widest font-semibold">View</button>
                              <button onClick={() => setEditingOrder(order)} className="text-[#C5A059] hover:underline text-[10px] lg:text-xs uppercase tracking-widest font-semibold">Update</button>
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
