import React, { useState, useEffect, useRef } from 'react';
import { useStore, Product, Order } from '../context/StoreContext';
import { X, Bell, Download, Menu } from 'lucide-react';
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
              icon: 'favicon.ico',
              badge: 'favicon.ico',
              vibrate: [200, 100, 200],
              tag: 'order-' + order.id,
              renotify: true,
              data: { url: window.location.href.split('#')[0] + '#/admin' }
            } as any);
          });
        } else {
          new Notification(title, {
            body,
            icon: 'favicon.ico'
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
          icon: 'favicon.ico',
          badge: 'favicon.ico',
          vibrate: [200, 100, 200],
          data: { url: window.location.href.split('#')[0] + '#/admin' }
        } as any);
      });
    } else {
      new Notification(title, {
        body,
        icon: 'favicon.ico'
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
      <div className="flex flex-col h-screen w-full items-center justify-center bg-theme-bg font-sans p-4">
        <div className="bg-theme-card p-8 border border-theme-border shadow-2xl max-w-sm w-full">
          <h2 className="text-3xl font-serif mb-6 text-center text-theme-accent uppercase tracking-widest">Urban Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-1">Passcode</label>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter 1234"
                className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" 
                required
              />
            </div>
            <button type="submit" className="w-full bg-theme-accent text-theme-bg py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors">
              Enter Dashboard
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-100">
            {deferredPrompt ? (
              <button 
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-blue-700 transition-colors"
              >
                <Download size={14} />
                Install Mobile App
              </button>
            ) : (
              <div className="text-center">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">To install as App on mobile:</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">
                  iOS: Tap Share ⎋ then "Add to Home Screen"
                  <br />
                  Android: Tap ⋮ then "Install app"
                </p>
              </div>
            )}
          </div>
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
      images: (formData.get('images-list') as string).split(',').map(s => s.trim()).filter(s => s !== ''),
      video: formData.get('video') as string || undefined,
      rating: parseFloat(formData.get('rating') as string) || 5,
      description: formData.get('description') as string,
    };

    // Ensure the main image is in the images array if not already there
    if (productData.image && !productData.images.includes(productData.image)) {
      productData.images.unshift(productData.image);
    }

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
    <div className="flex h-screen w-full bg-theme-bg font-sans overflow-hidden text-theme-text relative">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-64 bg-black text-theme-text/60 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0 border-r border-theme-border
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-start">
          <div>
            <h2 className="text-theme-accent font-serif text-3xl tracking-widest uppercase mb-1">URBAN</h2>
            <p className="text-[10px] tracking-[0.3em] font-bold opacity-30">ADMINISTRATOR</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-theme-accent p-2">
            <X size={20} />
          </button>
        </div>
        <ul className="flex-1 px-4 space-y-2 list-none m-0">
          <li 
            className={`border-l-[4px] ${activeTab === 'products' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent'} flex items-center px-4 py-4 text-xs uppercase tracking-widest cursor-pointer transition`} 
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
          >
            Inventory
          </li>
          <li 
            className={`border-l-[4px] ${activeTab === 'orders' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent'} flex items-center px-4 py-4 text-xs uppercase tracking-widest cursor-pointer transition`} 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
          >
            Orders
          </li>
          <li 
            className="border-l-[4px] border-transparent hover:text-red-500 flex items-center px-4 py-4 text-xs uppercase tracking-widest cursor-pointer transition mt-auto mb-10 opacity-60 hover:opacity-100"
            onClick={handleLogout}
          >
            Sign Out
          </li>
        </ul>
      </div>

      <div className="flex-1 flex flex-col overflow-auto relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-black text-white border-b border-theme-border">
          <h2 className="text-sm font-serif tracking-widest uppercase text-theme-accent">URBAN ADMIN</h2>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-theme-accent">
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-theme-accent font-bold">System Management</span>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <h1 className="text-4xl lg:text-5xl font-serif text-theme-text uppercase tracking-tight">Dashboard</h1>
                <div className="flex flex-wrap gap-3">
                  {notificationPermission !== 'granted' ? (
                    <button 
                      onClick={requestNotificationPermission}
                      className="flex items-center gap-2 px-4 py-2 bg-theme-accent/10 text-theme-accent text-[9px] uppercase tracking-widest font-bold border border-theme-accent/30 hover:bg-theme-accent/20 transition-all w-fit"
                    >
                      <Bell size={12} />
                      Enable Notifications
                    </button>
                  ) : (
                    <button 
                      onClick={testNotification}
                      className="flex items-center gap-2 px-4 py-2 bg-green-900/20 text-green-500 text-[9px] uppercase tracking-widest font-bold border border-green-500/20 hover:bg-green-900/30 transition-all w-fit"
                    >
                      <Bell size={12} />
                      Test Alert
                    </button>
                  )}
                  <button 
                    onClick={initDatabase}
                    className="flex items-center gap-2 px-4 py-2 bg-theme-card text-theme-text/60 text-[9px] uppercase tracking-widest font-bold border border-theme-border hover:border-theme-accent transition-all w-fit"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="px-10 py-5 bg-theme-accent text-theme-bg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg w-full lg:w-auto"
              >
                Add New Product
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12">
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-36">
              <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent font-bold">Inventory Units</span>
              <div className="text-3xl mt-1 font-serif text-theme-text">{products.length}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-36">
              <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent font-bold">Total Orders</span>
              <div className="text-3xl mt-1 font-serif text-theme-text">{orders.length}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-36">
              <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent font-bold">Active Customers</span>
              <div className="text-3xl mt-1 font-serif text-theme-text">1,240</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-36">
              <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent font-bold">Gross Revenue</span>
              <div className="text-3xl mt-1 font-serif text-theme-accent truncate">PKR {orders.reduce((acc, curr) => acc + curr.total, 0)}</div>
            </div>
          </div>

          <div className="bg-theme-card border border-theme-border flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-theme-border flex justify-between items-center bg-black/40">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-theme-accent">
                {activeTab === 'products' ? 'Inventory Catalogue' : 'Order Ledger'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                {activeTab === 'products' ? (
                  <>
                    <thead className="bg-black/60 text-[9px] uppercase tracking-widest text-theme-text/40 border-b border-theme-border">
                      <tr>
                        <th className="px-8 py-4 font-bold">Asset</th>
                        <th className="px-8 py-4 font-bold">Identity</th>
                        <th className="px-8 py-4 font-bold">Category</th>
                        <th className="px-8 py-4 font-bold text-right">Value (PKR)</th>
                        <th className="px-8 py-4 font-bold text-center">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-theme-border transition-colors hover:bg-theme-accent/5">
                          <td className="px-8 py-5">
                            <div className="w-12 h-16 bg-theme-bg overflow-hidden border border-theme-border">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="px-8 py-5 font-serif text-base text-theme-text">{product.name}</td>
                          <td className="px-8 py-5 text-[10px] text-theme-accent font-bold uppercase tracking-widest">{product.category}</td>
                          <td className="px-8 py-5 font-bold text-right text-theme-text/80">{product.price}</td>
                          <td className="px-8 py-5">
                            <div className="flex justify-center gap-6">
                              <button onClick={() => setEditingProduct(product)} className="text-theme-accent hover:text-white transition-colors text-[9px] uppercase tracking-widest font-bold">Modify</button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-400 transition-colors text-[9px] uppercase tracking-widest font-bold">Purge</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead className="bg-black/60 text-[9px] uppercase tracking-widest text-theme-text/40 border-b border-theme-border">
                      <tr>
                        <th className="px-8 py-4 font-bold">Order ID</th>
                        <th className="px-8 py-4 font-bold">Beneficiary</th>
                        <th className="px-8 py-4 font-bold hidden lg:table-cell">Shipping</th>
                        <th className="px-8 py-4 font-bold">Timestamp</th>
                        <th className="px-8 py-4 font-bold text-right">Total (PKR)</th>
                        <th className="px-8 py-4 font-bold text-center">Status</th>
                        <th className="px-8 py-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-theme-border transition-colors hover:bg-theme-accent/5">
                          <td className="px-8 py-5 font-bold text-theme-accent">{order.id}</td>
                          <td className="px-8 py-5">
                            <div className="font-serif text-sm text-theme-text">{order.customerName}</div>
                            <div className="text-[9px] text-theme-text/40 uppercase tracking-tighter">{order.email}</div>
                          </td>
                          <td className="px-8 py-5 text-[10px] text-theme-text/40 hidden lg:table-cell">
                            <div className="truncate">{order.city}</div>
                            <div className="truncate opacity-60">Express Delivery</div>
                          </td>
                          <td className="px-8 py-5 text-[9px] text-theme-text/40 tracking-wider uppercase">{order.date}</td>
                          <td className="px-8 py-5 font-bold text-right text-theme-text">{order.total}</td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-3 py-1.5 text-[8px] uppercase tracking-widest font-bold border ${
                              order.status === 'Delivered' ? 'text-green-500 border-green-500/20 bg-green-500/10' :
                              order.status === 'Shipped' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                              order.status === 'Pending' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                              'text-theme-text/40 border-theme-border bg-theme-bg'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col lg:flex-row justify-center gap-3">
                              <button onClick={() => setViewingOrder(order)} className="text-theme-text/60 hover:text-theme-text transition-colors text-[9px] uppercase tracking-widest font-bold">View</button>
                              <button onClick={() => setEditingOrder(order)} className="text-theme-accent hover:text-white transition-colors text-[9px] uppercase tracking-widest font-bold">Update</button>
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

        {/* Modal styling updates */}
        {(isAddingProduct || editingProduct) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-theme-card w-full max-w-lg p-10 relative shadow-2xl border border-theme-border mt-20 mb-20">
              <button 
                onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                className="absolute top-8 right-8 text-theme-text/40 hover:text-theme-text transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-serif mb-8 text-theme-accent uppercase tracking-widest">
                {editingProduct ? 'Edit Asset' : 'Manifest New Asset'}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Product Designation</label>
                  <input name="name" defaultValue={editingProduct?.name || ''} required className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Value (PKR)</label>
                    <input name="price" type="number" defaultValue={editingProduct?.price || ''} required className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Division</label>
                    <select name="category" defaultValue={editingProduct?.category || 'Slides'} className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent">
                      <option value="Slides">Slides</option>
                      <option value="Clogs">Clogs</option>
                      <option value="Traditional">Traditional</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Primary Visual URL</label>
                  <input name="image" defaultValue={editingProduct?.image || ''} required className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Slideshow Assets (comma separated)</label>
                  <input name="images-list" defaultValue={editingProduct?.images?.join(', ') || ''} className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" placeholder="url1, url2..." />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} required className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent resize-none"></textarea>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-theme-accent text-theme-bg py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-all">
                    {editingProduct ? 'Commit Changes' : 'Initialize Asset'}
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
