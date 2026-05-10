/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import Admin from './pages/Admin';
import { useStore } from './context/StoreContext';
import { db } from './lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

function ProductFetcher() {
  const { syncProducts } = useStore();

  React.useEffect(() => {
    // Customers can always see products, no auth needed for read
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const syncedProducts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      syncProducts(syncedProducts);
    }, (error) => {
      console.error("Error syncing products:", error);
    });

    return () => unsubscribe();
  }, [syncProducts]);

  return null;
}

export default function App() {
  return (
    <StoreProvider>
      <ProductFetcher />
      <Toaster position="top-right" />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="track-order" element={<TrackOrder />} />
          </Route>
          {/* Admin has no standard Layout (Navbar/Footer) */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}

