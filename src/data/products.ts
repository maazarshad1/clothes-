import { Product } from '../context/StoreContext';

export const products: Product[] = [
  {
    id: 'skecher-og-slides',
    name: 'Skecher OG Slides - By Zurban',
    price: 1550,
    category: 'Slides',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-beach-33987-large.mp4',
    rating: 4.8,
    description: 'Welcome to Your Ultimate Comfort & Style Destination! Designed to provide exceptional comfort and care for your feet with premium materials.',
  },
  {
    id: 'skechers-premium-slides',
    name: 'Skechers Premium Slides - by Zurban',
    price: 1850,
    category: 'Slides',
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&auto=format&fit=crop&q=80'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-front-of-a-classic-building-44755-large.mp4',
    rating: 4.9,
    description: 'Elevate your daily walk with Zurban Premium Slides. Crafted for durability and ultimate cushioning.',
  },
  {
    id: 'zurban-formal-slides',
    name: 'Zurban Formal Slides',
    price: 1250,
    category: 'Slides',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    description: 'Sophisticated formal slides for occasions where comfort meets class. Hand-finished details.',
  },
  {
    id: 'classy-slides',
    name: 'Classy Slides - By Zurban',
    price: 1450,
    category: 'Slides',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    description: 'The everyday essential. Lightweight, durable, and effortlessly classy design from the Zurban collection.',
  },
  {
    id: 'zurban-clogs-v1',
    name: 'Zurban Pro Clogs',
    price: 2100,
    category: 'Clogs',
    image: 'https://images.unsplash.com/photo-1592862902946-b3e8241ae203?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1592862902946-b3e8241ae203?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    description: 'Versatile clogs for all-day wear. Breathable and comfortable for active lifestyle.',
  },
  {
    id: 'traditional-peshawari',
    name: 'Handmade traditional peshawari chappal',
    price: 2850,
    category: 'Traditional',
    image: 'https://images.unsplash.com/photo-1605733513597-a8f8d410fe3e?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1605733513597-a8f8d410fe3e?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    description: 'Premium quality handmade Peshawari Chappal (Kheri). Authentic craftsmanship with pure leather.',
  }
];
