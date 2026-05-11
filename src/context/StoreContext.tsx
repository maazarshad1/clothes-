import React, { createContext, useContext, useState, ReactNode } from 'react';
import { products as initialProducts } from '../data/products';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  video?: string;
  rating: number;
  description: string;
  colors?: string[];
  collections?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  items: CartItem[];
  paymentMethod: 'Card' | 'Cash on Delivery';
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}

interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
  cartItemId: string;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  syncProducts: (syncedProducts: Product[]) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addOrder: (order: Order) => void;
  syncOrders: (syncedOrders: Order[]) => void;
  clearCart: () => void;
  collections: Collection[];
  addCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialOrders: Order[] = [
  { id: 'ORD-001', customerName: 'John Doe', email: 'john@example.com', phoneNumber: '(555) 123-4567', address: '123 Main St', city: 'New York', postalCode: '10001', items: [{ id: '1', name: 'Product 1', price: 120.0, category: 'Men', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 5, description: 'Test', quantity: 1, size: 'M', cartItemId: '1-M' }], paymentMethod: 'Card', total: 120.0, status: 'Pending', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: 'ORD-002', customerName: 'Jane Smith', email: 'jane@example.com', phoneNumber: '(555) 987-6543', address: '456 Elm St', city: 'Los Angeles', postalCode: '90001', items: [{ id: '2', name: 'Product 2', price: 345.5, category: 'Women', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4, description: 'Test', quantity: 1, size: 'S', cartItemId: '2-S' }], paymentMethod: 'Cash on Delivery', total: 345.5, status: 'Shipped', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  { id: 'ORD-003', customerName: 'Alice Johnson', email: 'alice@example.com', phoneNumber: '(555) 555-5555', address: '789 Oak St', city: 'Chicago', postalCode: '60001', items: [{ id: '3', name: 'Product 3', price: 45.0, category: 'Kids', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 5, description: 'Test', quantity: 1, size: 'L', cartItemId: '3-L' }], paymentMethod: 'Card', total: 45.0, status: 'Delivered', date: new Date(Date.now() - 259200000).toISOString().split('T')[0] },
];

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('store_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('store_collections');
    return saved ? JSON.parse(saved) : [];
  });
  const [isInitializing, setIsInitializing] = useState(true);

  // Sync collections with Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'collections'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const syncedCollections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
      if (syncedCollections.length === 0 && !snapshot.metadata.fromCache) {
        // Initialization if empty
        const defaults = [
          { name: 'Winter Collection' },
          { name: 'New Arrivals' },
          { name: 'Featured' }
        ];
        defaults.forEach(async (col) => {
          const docRef = doc(collection(db, 'collections'));
          await setDoc(docRef, col);
        });
      } else {
        setCollections(syncedCollections);
        localStorage.setItem('store_collections', JSON.stringify(syncedCollections));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'collections');
    });
    return () => unsubscribe();
  }, []);

  // Sync products with Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const syncedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      if (syncedProducts.length === 0 && initialProducts.length > 0 && !snapshot.metadata.fromCache) {
        // Initialization if empty - Push local data to Firestore
        initialProducts.forEach(async (p) => {
          await setDoc(doc(db, 'products', p.id), p);
        });
      } else if (syncedProducts.length > 0) {
        setProducts(syncedProducts);
        localStorage.setItem('store_products', JSON.stringify(syncedProducts));
      }
      setIsInitializing(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  // Sync orders with Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const syncedOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      setOrders(syncedOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    localStorage.setItem('store_cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    localStorage.setItem('store_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  React.useEffect(() => {
    localStorage.setItem('store_products', JSON.stringify(products));
  }, [products]);

  React.useEffect(() => {
    localStorage.setItem('store_orders', JSON.stringify(orders));
  }, [orders]);

  React.useEffect(() => {
    localStorage.setItem('store_collections', JSON.stringify(collections));
  }, [collections]);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart((prev) => {
      const cartItemId = `${product.id}-${size || 'na'}-${color || 'na'}`;
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, size, color, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const updateProduct = (id: string, updated: Product) => setProducts(prev => prev.map(p => p.id === id ? updated : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const syncProducts = (syncedProducts: Product[]) => setProducts(syncedProducts);
  
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };
  
  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const syncOrders = (syncedOrders: Order[]) => setOrders(syncedOrders);
  const clearCart = () => setCart([]);

  const addCollection = async (name: string) => {
    try {
      const docRef = doc(collection(db, 'collections'));
      await setDoc(docRef, { name });
    } catch (error) {
      console.error('Error adding collection:', error);
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'collections', id));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        wishlist,
        toggleWishlist,
        isDarkMode,
        toggleDarkMode,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        syncProducts,
        orders,
        updateOrderStatus,
        addOrder,
        syncOrders,
        clearCart,
        collections,
        addCollection,
        deleteCollection,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
