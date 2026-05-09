import React, { createContext, useContext, useState, ReactNode } from 'react';
import { products as initialProducts } from '../data/products';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  description: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
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
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addOrder: (order: Order) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialOrders: Order[] = [
  { id: 'ORD-001', customerName: 'John Doe', email: 'john@example.com', address: '123 Main St', city: 'New York', postalCode: '10001', items: [{ id: '1', name: 'Product 1', price: 120.0, category: 'Men', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 5, description: 'Test', quantity: 1 }], paymentMethod: 'Card', total: 120.0, status: 'Pending', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: 'ORD-002', customerName: 'Jane Smith', email: 'jane@example.com', address: '456 Elm St', city: 'Los Angeles', postalCode: '90001', items: [{ id: '2', name: 'Product 2', price: 345.5, category: 'Women', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 4, description: 'Test', quantity: 1 }], paymentMethod: 'Cash on Delivery', total: 345.5, status: 'Shipped', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  { id: 'ORD-003', customerName: 'Alice Johnson', email: 'alice@example.com', address: '789 Oak St', city: 'Chicago', postalCode: '60001', items: [{ id: '3', name: 'Product 3', price: 45.0, category: 'Kids', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', rating: 5, description: 'Test', quantity: 1 }], paymentMethod: 'Card', total: 45.0, status: 'Delivered', date: new Date(Date.now() - 259200000).toISOString().split('T')[0] },
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
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('store_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
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
  
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };
  
  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const clearCart = () => setCart([]);

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
        orders,
        updateOrderStatus,
        addOrder,
        clearCart,
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
