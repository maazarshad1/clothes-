import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, CheckCircle, Shield, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { products as allProducts } from '../data/products';

const CategoryCard = ({ title, image, link }: { title: string; image: string; link: string }) => (
  <Link to={link} className="group relative overflow-hidden aspect-square">
    <img 
      src={image} 
      alt={title} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
    <div className="absolute inset-0 flex items-center justify-center">
      <h3 className="text-white font-serif text-2xl tracking-widest uppercase border-b-2 border-transparent group-hover:border-theme-accent p-2 transition-all">
        {title}
      </h3>
    </div>
  </Link>
);

const TestimonialCard = ({ name, comment, rating }: { name: string; comment: string; rating: number }) => (
  <div className="bg-theme-card p-8 border border-theme-border">
    <div className="flex text-theme-accent mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} fill={i < rating ? "currentColor" : "none"} stroke="currentColor" />
      ))}
    </div>
    <p className="text-theme-text/80 italic mb-6 font-serif">"{comment}"</p>
    <p className="text-theme-accent uppercase tracking-widest text-xs font-bold">— {name}</p>
  </div>
);

const Home = () => {
  const { addToCart } = useStore();
  const bestSellers = allProducts.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h4 className="text-theme-accent tracking-[0.3em] font-semibold uppercase mb-4">Welcome to Zurban</h4>
            <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">Comfort Meets Premium Craftsmanship</h1>
            <p className="text-lg text-theme-text/70 mb-10 font-serif max-w-lg">
              Footwear should be more than just stylish — it should provide exceptional comfort and care for your feet.
            </p>
            <Link to="/shop" className="bg-theme-accent text-theme-bg px-10 py-4 uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300">
              Shop Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Our Collections */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl mb-4">Our Collections</h2>
          <div className="w-20 h-1 bg-theme-accent mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard title="Clogs" image="https://images.unsplash.com/photo-1592862902946-b3e8241ae203?w=800" link="/shop?category=Clogs" />
          <CategoryCard title="Slides" image="https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800" link="/shop?category=Slides" />
          <CategoryCard title="Traditional" image="https://images.unsplash.com/photo-1605733513597-a8f8d410fe3e?w=800" link="/shop?category=Traditional" />
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl mb-2">Our Best Sellers</h2>
              <p className="text-theme-accent uppercase tracking-widest text-xs">Customer Favourites</p>
            </div>
            <Link to="/shop" className="text-theme-text hover:text-theme-accent transition flex items-center gap-2 uppercase tracking-widest text-xs font-bold">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -10 }}
                className="bg-theme-card border border-theme-border group"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => addToCart(product)}
                    className="absolute bottom-0 left-0 right-0 bg-theme-accent text-theme-bg py-4 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest"
                  >
                    Add to Cart
                  </button>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-serif text-lg mb-2 truncate">{product.name}</h3>
                  <p className="text-theme-accent font-bold">PKR {product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Brand */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1544816153-1574d6c4125b?w=1200&auto=format&fit=crop&q=80" 
              alt="About Zurban" 
              className="w-full h-[600px] object-cover shadow-2xl"
            />
          </div>
          <div className="lg:w-1/2">
            <h4 className="text-theme-accent tracking-widest uppercase font-bold text-sm mb-4">About Our Brand</h4>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">Quality and Elegance in Every Step</h2>
            <p className="text-theme-text/80 text-lg font-serif mb-8 leading-relaxed">
              At Zurban, we believe that premium quality shouldn't come with an unreachable price tag. Our mission is to provide the perfect balance between style, durability, and comfort for the modern individual who values authentic craftsmanship.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-theme-accent">
                <CheckCircle size={20} /> <span className="text-theme-text uppercase tracking-widest text-sm font-bold">Premium Materials</span>
              </div>
              <div className="flex items-center gap-4 text-theme-accent">
                <Shield size={20} /> <span className="text-theme-text uppercase tracking-widest text-sm font-bold">Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-4 text-theme-accent">
                <Truck size={20} /> <span className="text-theme-text uppercase tracking-widest text-sm font-bold">Fast Delivery Nationwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-theme-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl mb-4">Customers Talk</h2>
            <p className="text-theme-accent uppercase tracking-widest text-xs">Real Feedback From Real People</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard name="Waseem Riaz" comment="The Skecher OG Slides are incredibly comfortable. Best purchase for daily use!" rating={5} />
            <TestimonialCard name="Usman Rashid" comment="Superior quality and fast delivery. Highly recommended for premium footwear." rating={5} />
            <TestimonialCard name="Arham Butt" comment="Classy design and very durable. Zurban never disappoints." rating={4} />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 container mx-auto px-4 border-t border-theme-border">
        <div className="bg-theme-accent p-12 lg:p-24 text-theme-bg text-center">
          <h2 className="font-serif text-4xl mb-6">GET 10% DISCOUNT</h2>
          <p className="uppercase tracking-[0.2em] mb-10 opacity-80">Subscribe to our email list to unlock exclusive deals</p>
          <div className="max-w-md mx-auto flex">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-white border-none px-6 py-4 text-theme-bg focus:ring-0"
            />
            <button className="bg-theme-bg text-theme-accent px-8 py-4 font-bold uppercase tracking-widest hover:opacity-90 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
