import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
  const { cart, wishlist } = useStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="border-b border-black/10 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:text-gray-600 transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="text-2xl font-serif text-black tracking-widest font-semibold uppercase">
              Urban Style
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <Link to="/shop?category=Women" className="text-sm font-medium tracking-widest uppercase hover:text-[#d4af37] transition">Women</Link>
            <Link to="/shop?category=Men" className="text-sm font-medium tracking-widest uppercase hover:text-[#d4af37] transition">Men</Link>
            <Link to="/shop?category=Kids" className="text-sm font-medium tracking-widest uppercase hover:text-[#d4af37] transition">Kids</Link>
            <Link to="/shop?category=Accessories" className="text-sm font-medium tracking-widest uppercase hover:text-[#d4af37] transition">Accessories</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/track-order" className="text-black hover:text-[#d4af37] transition hidden md:block" title="Track Order">
              <Package size={20} />
            </Link>
            <Link to="/wishlist" className="text-black hover:text-[#d4af37] transition relative">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d4af37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-black hover:text-[#d4af37] transition relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-black/10">
          <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
            <Link to="/shop?category=Women" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-black/5">Women</Link>
            <Link to="/shop?category=Men" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-black/5">Men</Link>
            <Link to="/shop?category=Kids" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-black/5">Kids</Link>
            <Link to="/shop?category=Accessories" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-black/5">Accessories</Link>
            <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-black/5">Track Order</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
