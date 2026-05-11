import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
  const { cart, wishlist } = useStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="border-b border-theme-border bg-theme-bg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-theme-text hover:text-theme-accent transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="text-2xl font-serif text-theme-accent tracking-widest font-semibold uppercase">
              URBAN
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <Link to="/shop?category=Slides" className="text-sm font-medium tracking-widest uppercase hover:text-theme-accent transition">Slides</Link>
            <Link to="/shop?category=Clogs" className="text-sm font-medium tracking-widest uppercase hover:text-theme-accent transition">Clogs</Link>
            <Link to="/shop?category=Traditional" className="text-sm font-medium tracking-widest uppercase hover:text-theme-accent transition">Traditional</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <Link to="/track-order" className="text-theme-text hover:text-theme-accent transition hidden md:block" title="Track Order">
              <Package size={20} />
            </Link>
            <Link to="/wishlist" className="text-theme-text hover:text-theme-accent transition relative">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-theme-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-theme-text hover:text-theme-accent transition relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-theme-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-theme-bg border-t border-theme-border">
          <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
            <Link to="/shop?category=Slides" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-theme-border text-theme-text">Slides</Link>
            <Link to="/shop?category=Clogs" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-theme-border text-theme-text">Clogs</Link>
            <Link to="/shop?category=Traditional" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-theme-border text-theme-text">Traditional</Link>
            <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium tracking-widest uppercase p-2 border-b border-theme-border text-theme-text">Track Order</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
