import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
  const { cart, wishlist } = useStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-black border-b border-white/5 sticky top-0 z-50 py-2">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#C2A46C] transition p-2"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
          
          {/* Logo Center */}
          <div className="flex-grow flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link to="/" className="text-2xl md:text-3xl font-serif text-[#C2A46C] tracking-[0.3em] font-black uppercase">
              URBAN
            </Link>
          </div>

          {/* Icons Right */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/track-order" className="text-white/60 hover:text-[#C2A46C] transition hidden sm:block p-2">
              <Package size={22} />
            </Link>
            <Link to="/wishlist" className="text-white/60 hover:text-[#C2A46C] transition relative p-2">
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#C2A46C] text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-white/60 hover:text-[#C2A46C] transition relative p-2">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-black z-50 p-6 flex flex-col gap-6 animate-in slide-in-from-left duration-300">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-white uppercase tracking-tighter border-b border-white/10 pb-4">Home</Link>
          <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-white uppercase tracking-tighter border-b border-white/10 pb-4">Shop All</Link>
          <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-white uppercase tracking-tighter border-b border-white/10 pb-4">Track Order</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-white uppercase tracking-tighter border-b border-white/10 pb-4">Support</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
