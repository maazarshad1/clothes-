import React, { useState, useEffect, useRef } from 'react';
import { useStore, Product, Order } from '../context/StoreContext';
import { X, Bell, Download, Menu, Receipt, Clock, CheckCircle, Package, Search, Plus, Filter, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_auth') === 'true';
    }
    return false;
  });
  const [passcode, setPasscode] = useState('');
  const { 
    products, addProduct, updateProduct, deleteProduct, 
    orders, updateOrderStatus, addOrder, syncOrders, syncProducts,
    collections, addCollection, deleteCollection 
  } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'transactions' | 'collections'>('products');
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending' | 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled'>('all');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isProcessingColors, setIsProcessingColors] = useState(false);

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'transactions') {
      return o.status === 'Delivered';
    }
    if (activeTab === 'orders') {
      if (orderFilter === 'all') return true;
      return o.status === orderFilter;
    }
    return true;
  });

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((acc, curr) => acc + curr.total, 0);

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

  // Products are now synced globally in StoreContext
  // We don't need a local listener here unless we want specific admin-only logic
  // Same for orders, but Admin has notification logic
  
  // Update order synchronization to not duplicate effort but still handle notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    // Use a fresh listener for notifications to handle the docChanges specifically
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const isInitial = isFirstSyncRef.current;
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isInitial) {
          const data = change.doc.data() as Order;
          triggerNotification({ ...data, id: change.doc.id });
          toast.success(`New Order Received: ${change.doc.id}`, {
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
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

  const processProductColors = async () => {
    if (!products.length) return;
    setIsProcessingColors(true);
    const toastId = toast.loading('AI analyzing colors...');
    
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const batchSize = 10;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const prompt = `Analyze these clothing products and return a JSON list of identified colors for each.
        Products: ${batch.map(p => `ID: ${p.id}, Name: ${p.name}, Description: ${p.description}`).join(' | ')}
        Return only JSON like: [{"id": "...", "colors": ["Black", "White"]}]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  colors: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['id', 'colors']
              }
            }
          }
        });

        const colorData = JSON.parse(response.text);
        for (const data of colorData) {
          const product = products.find(p => p.id === data.id);
          if (product) {
            await updateDoc(doc(db, 'products', product.id), { 
              colors: data.colors,
              // If product name doesn't include color, we keep it as is, but we'll show colors in UI
            });
          }
        }
        toast.loading(`Processed ${Math.min(i + batchSize, products.length)}/${products.length} products...`, { id: toastId });
      }
      
      toast.success('AI Color Detection Complete!', { id: toastId });
    } catch (error) {
      console.error('AI Processing Error:', error);
      toast.error('AI color detection failed', { id: toastId });
    } finally {
      setIsProcessingColors(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = editingProduct ? editingProduct.id : Date.now().toString();
    
    const selectedCollections = Array.from(formData.getAll('collections') as string[]);
    const colorInput = formData.get('colors') as string;
    const colors = colorInput.split(',').map(s => s.trim()).filter(s => s !== '');

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
      colors: colors,
      collections: selectedCollections,
    };

    if (productData.image && !productData.images.includes(productData.image)) {
      productData.images.unshift(productData.image);
    }

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData as any);
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
            className={`flex items-center gap-3 px-4 py-4 text-[10px] uppercase tracking-widest cursor-pointer transition border-l-[4px] ${activeTab === 'products' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent hover:bg-white/5'}`} 
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
          >
            <Package size={16} /> Inventory
          </li>
          <li 
            className={`flex items-center gap-3 px-4 py-4 text-[10px] uppercase tracking-widest cursor-pointer transition border-l-[4px] ${activeTab === 'collections' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent hover:bg-white/5'}`} 
            onClick={() => { setActiveTab('collections'); setIsSidebarOpen(false); }}
          >
            <Filter size={16} /> Custom Collections
          </li>
          <li 
            className={`flex items-center gap-3 px-4 py-4 text-[10px] uppercase tracking-widest cursor-pointer transition border-l-[4px] ${activeTab === 'transactions' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent hover:bg-white/5'}`} 
            onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }}
          >
            <Receipt size={16} /> Transactions
          </li>
          <div className="py-2 px-4">
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-30 font-bold mb-2">Order Management</p>
            <li 
              className={`flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest cursor-pointer transition border-l-[4px] mb-1 rounded-sm ${activeTab === 'orders' && orderFilter === 'Pending' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent hover:bg-white/5'}`} 
              onClick={() => { setActiveTab('orders'); setOrderFilter('Pending'); setIsSidebarOpen(false); }}
            >
              <div className="flex items-center gap-3"><Clock size={14} /> Pending</div>
              {pendingOrdersCount > 0 && <span className="bg-amber-500 text-black text-[8px] font-bold px-1.5 rounded-full">{pendingOrdersCount}</span>}
            </li>
            <li 
              className={`flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest cursor-pointer transition border-l-[4px] rounded-sm ${activeTab === 'orders' && orderFilter === 'Delivered' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent hover:bg-white/5'}`} 
              onClick={() => { setActiveTab('orders'); setOrderFilter('Delivered'); setIsSidebarOpen(false); }}
            >
              <CheckCircle size={14} /> Delivered
            </li>
            <li 
              className={`flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest cursor-pointer transition border-l-[4px] rounded-sm ${activeTab === 'orders' && orderFilter === 'all' ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold' : 'border-transparent hover:text-theme-accent hover:bg-white/5'}`} 
              onClick={() => { setActiveTab('orders'); setOrderFilter('all'); setIsSidebarOpen(false); }}
            >
              <Filter size={14} /> All Orders
            </li>
          </div>
          <li 
            className="border-l-[4px] border-transparent hover:text-red-500 flex items-center gap-3 px-4 py-4 text-[10px] uppercase tracking-widest cursor-pointer transition mt-auto mb-10 opacity-60 hover:opacity-100"
            onClick={handleLogout}
          >
            <X size={16} /> Sign Out
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
                  <button 
                    onClick={processProductColors}
                    disabled={isProcessingColors}
                    className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-bg text-[9px] uppercase tracking-widest font-bold border border-theme-accent hover:bg-white transition-all w-fit disabled:opacity-50"
                  >
                    {isProcessingColors ? 'AI Processing...' : 'Auto-Detect Colors'}
                  </button>
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
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-40 group hover:border-theme-accent transition-all duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent font-bold">Total Inventory</span>
                <Package size={16} className="text-theme-text/20 group-hover:text-theme-accent transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl mt-1 font-serif text-theme-text">{products.length}</div>
                <span className="text-[9px] text-theme-text/40 font-bold uppercase">SKUs</span>
              </div>
            </div>
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-40 group hover:border-theme-accent transition-all duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">Pending Orders</span>
                <Clock size={16} className="text-amber-500/20 group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="text-4xl mt-1 font-serif text-theme-text">{pendingOrdersCount}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-40 group hover:border-theme-accent transition-all duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] text-green-500 font-bold">Successful Deliveries</span>
                <CheckCircle size={16} className="text-green-500/20 group-hover:text-green-500 transition-colors" />
              </div>
              <div className="text-4xl mt-1 font-serif text-theme-text">{deliveredOrdersCount}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-6 flex flex-col justify-between h-40 group hover:border-theme-accent transition-all duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent font-bold">Revenue (Finalized)</span>
                <Receipt size={16} className="text-theme-accent/20 group-hover:text-theme-accent transition-colors" />
              </div>
              <div className="text-3xl mt-1 font-serif text-theme-accent truncate">PKR {totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-theme-card border border-theme-border flex flex-col overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-theme-border flex flex-col md:flex-row justify-between items-center bg-black/40 gap-4">
              <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-theme-accent">
                {activeTab === 'products' ? 'Inventory Catalogue' : 
                 activeTab === 'collections' ? 'Custom Collections' :
                 activeTab === 'transactions' ? 'Collection Transactions' : 
                 `Order Ledger: ${orderFilter}`}
              </h3>
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text/40" />
                <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  className="w-full bg-theme-bg border border-theme-border py-2 pl-9 pr-4 text-[10px] uppercase tracking-widest text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                {activeTab === 'products' ? (
                  <>
                    <thead className="bg-black/60 text-[9px] uppercase tracking-widest text-theme-text/40 border-b border-theme-border">
                      <tr>
                        <th className="px-8 py-5 font-black">Visual Asset</th>
                        <th className="px-8 py-5 font-black">Product Details</th>
                        <th className="px-8 py-5 font-black">Division / Collections</th>
                        <th className="px-8 py-5 font-black text-right">Valuation (PKR)</th>
                        <th className="px-8 py-5 font-black text-center">Active Colors</th>
                        <th className="px-8 py-5 font-black text-center">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-theme-border transition-all hover:bg-theme-accent/5 group">
                          <td className="px-8 py-6">
                            <div className="relative w-16 h-20 bg-theme-bg overflow-hidden border border-theme-border group-hover:border-theme-accent transition-colors">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-serif text-lg text-theme-text group-hover:text-theme-accent transition-colors mb-1">{product.name}</div>
                            <div className="text-[9px] text-theme-text/30 font-bold uppercase tracking-widest max-w-[200px]">
                              SKU: {product.id.substring(0, 8)}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[9px] text-theme-accent font-black uppercase tracking-wider border border-theme-accent/20 px-2 py-0.5 rounded-sm bg-theme-accent/5">
                                {product.category}
                              </span>
                              {product.collections?.map(cId => {
                                const col = collections.find(c => c.id === cId || c.name === cId);
                                return (
                                  <span key={cId} className="text-[9px] text-white/40 font-bold uppercase tracking-wider border border-white/10 px-2 py-0.5 rounded-sm">
                                    {col ? col.name : cId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-8 py-6 font-black text-right text-lg text-theme-text/90">
                            {product.price.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {product.colors && product.colors.length > 0 ? (
                                product.colors.map((color, idx) => (
                                  <span key={idx} className="text-[8px] px-1.5 py-0.5 border border-white/10 bg-white/5 uppercase font-bold text-white/60">
                                    {color}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[8px] text-white/20 uppercase">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center gap-3">
                              <button 
                                onClick={() => setEditingProduct(product)} 
                                className="p-2 bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent hover:text-white transition-all shadow-sm"
                                title="Edit Asset"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)} 
                                className="p-2 bg-theme-bg border border-theme-border text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                title="Purge Asset"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : activeTab === 'collections' ? (
                  <>
                    <thead className="bg-black/60 text-[9px] uppercase tracking-widest text-theme-text/40 border-b border-theme-border">
                      <tr>
                        <th className="px-8 py-5 font-black">Collection ID</th>
                        <th className="px-8 py-5 font-black">Display Name</th>
                        <th className="px-8 py-5 font-black text-center">Attached Products</th>
                        <th className="px-8 py-5 font-black text-center">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {/* Add New Collection Row */}
                      <tr className="border-b border-theme-border bg-theme-accent/5">
                        <td className="px-8 py-4 opacity-50 italic">Auto-generated</td>
                        <td className="px-8 py-4">
                          <input 
                            type="text" 
                            placeholder="New Collection Name..." 
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            className="bg-transparent border-b border-theme-accent/30 focus:border-theme-accent outline-none py-1 w-full uppercase tracking-widest font-bold"
                          />
                        </td>
                        <td className="px-8 py-4 text-center">0</td>
                        <td className="px-8 py-4 text-center">
                          <button 
                            onClick={() => {
                              if (newCollectionName) {
                                addCollection(newCollectionName);
                                setNewCollectionName('');
                                toast.success('Collection created');
                              }
                            }}
                            className="p-2 bg-theme-accent text-theme-bg rounded-full hover:scale-110 transition-transform"
                          >
                            <Plus size={16} />
                          </button>
                        </td>
                      </tr>
                      {collections.map(col => (
                        <tr key={col.id} className="border-b border-theme-border hover:bg-white/5 transition-colors">
                          <td className="px-8 py-5 font-mono text-[10px] opacity-40">{col.id}</td>
                          <td className="px-8 py-5 font-serif text-lg tracking-wider text-theme-text">{col.name}</td>
                          <td className="px-8 py-5 text-center font-bold">
                            {products.filter(p => p.collections?.includes(col.id) || p.collections?.includes(col.name)).length}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button 
                              onClick={() => deleteCollection(col.id)}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead className="bg-black/60 text-[9px] uppercase tracking-widest text-theme-text/40 border-b border-theme-border">
                      <tr>
                        <th className="px-8 py-5 font-black">Transaction ID</th>
                        <th className="px-8 py-5 font-black">End Customer</th>
                        <th className="px-8 py-5 font-black hidden lg:table-cell">Logistics</th>
                        <th className="px-8 py-5 font-black">Registry Date</th>
                        <th className="px-8 py-5 font-black text-right">Settlement (PKR)</th>
                        <th className="px-8 py-5 font-black text-center">System State</th>
                        <th className="px-8 py-5 font-black text-center">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="border-b border-theme-border transition-all hover:bg-theme-accent/5 group">
                          <td className="px-8 py-6">
                            <span className="font-mono text-[10px] font-bold text-theme-accent group-hover:text-white transition-colors">
                              {order.id}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-theme-text/80">
                            <div className="font-serif text-lg text-theme-text mb-1">{order.customerName}</div>
                            <div className="text-[9px] text-theme-text/40 uppercase tracking-widest font-bold">{order.email}</div>
                          </td>
                          <td className="px-8 py-6 text-[10px] text-theme-text/40 hidden lg:table-cell">
                            <div className="flex flex-col gap-1">
                              <span className="uppercase tracking-tighter text-theme-text/60 font-bold group-hover:text-theme-text transition-colors">{order.city}</span>
                              <span className="text-[8px] opacity-40 uppercase font-black">{order.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] text-theme-text/40 tracking-widest uppercase font-bold">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 font-black text-right text-lg text-theme-text">
                            {order.total.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                              order.status === 'Delivered' ? 'text-green-500 border-green-500/20 bg-green-500/10' :
                              order.status === 'Shipped' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                              order.status === 'Pending' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                              'text-theme-text/40 border-theme-border bg-theme-bg'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center gap-3">
                              <button 
                                onClick={() => setViewingOrder(order)} 
                                className="p-2 bg-theme-bg border border-theme-border text-theme-text/40 hover:text-theme-accent transition-all shadow-sm"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => setEditingOrder(order)} 
                                className="p-2 bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent hover:text-white transition-all shadow-sm"
                                title="Update State"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-theme-text/20 uppercase tracking-[0.4em] font-black">
                <Package size={64} className="mb-6 opacity-10" />
                No records found in current view
              </div>
            )}
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
                    <select name="category" defaultValue={editingProduct?.category || 'Dual Stripe Zip Polos'} className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent">
                      <option value="Dual Stripe Zip Polos">Dual Stripe Zip Polos</option>
                      <option value="Two Tone Polos">Two Tone Polos</option>
                      <option value="Textured Stripe Polos">Textured Stripe Polos</option>
                      <option value="WaffleZip Mocknecks">WaffleZip Mocknecks</option>
                      <option value="Panel Zip Polos">Panel Zip Polos</option>
                      <option value="Sweatshirts">Sweatshirts</option>
                      <option value="Bomber Jackets">Bomber Jackets</option>
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Polos">Polos</option>
                      <option value="Winter Arrivals">Winter Arrivals</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Primary Visual URL</label>
                    <input name="image" defaultValue={editingProduct?.image || ''} required className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Available Colors (comma separated)</label>
                    <input name="colors" defaultValue={editingProduct?.colors?.join(', ') || ''} className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" placeholder="e.g. Black, White, Navy" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Slideshow Assets (comma separated)</label>
                    <input name="images-list" defaultValue={editingProduct?.images?.join(', ') || ''} className="w-full border border-theme-border bg-theme-bg text-theme-text p-4 text-sm focus:outline-none focus:border-theme-accent" placeholder="url1, url2..." />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-accent mb-2">Assign to Collections</label>
                    <div className="max-h-32 overflow-y-auto border border-theme-border p-2 space-y-2 bg-theme-bg">
                      {collections.map(col => (
                        <label key={col.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            name="collections" 
                            value={col.id}
                            defaultChecked={editingProduct?.collections?.includes(col.id) || editingProduct?.collections?.includes(col.name)}
                            className="accent-theme-accent"
                          />
                          <span className="text-[10px] uppercase tracking-widest text-theme-text/60 group-hover:text-theme-accent transition-colors">{col.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
