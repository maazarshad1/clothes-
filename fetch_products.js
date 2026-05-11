import fs from 'fs';

async function fetchProducts(page = 1) {
  const url = `https://dopepk.com/products.json?limit=50&page=${page}`;
  console.error(`Fetching page ${page}...`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.products;
  } catch (e) {
    console.error(`Error fetching page ${page}:`, e.message);
    return [];
  }
}

async function main() {
  let allProducts = [];
  try {
    for (let i = 1; i <= 10; i++) { // Fetch first 10 pages
      const products = await fetchProducts(i);
      if (!products || products.length === 0) break;
      allProducts = allProducts.concat(products);
    }

    const collectionsInfo = [
      { id: "basic-oversized-dropshoulder-tees", title: "Basic Oversized | Dropshoulder Tees" },
      { id: "casual-shirts", title: "Casual Shirts" },
      { id: "drop-needle-basic-tees", title: "Drop Needle Basic Tees" },
      { id: "drop-needle-zipper-polos", title: "Drop Needle Zipper Polos" },
      { id: "full-sleeves-t-shirts", title: "Full Sleeves T-Shirts" },
      { id: "graphic-tees", title: "Graphic Tees" },
      { id: "hoodies", title: "Hoodies" },
      { id: "men-s-bomber-jackets", title: "Men’s Bomber Jackets" },
      { id: "oversized-waffle-knit-raglan-t-shirts", title: "Oversized Waffle Knit Raglan T-shirts" },
      { id: "oversized-drop-shoulder", title: "Oversized | Drop Shoulder" },
      { id: "panel-zip-polo", title: "Panel Zip Polo" },
      { id: "sweatshirts", title: "Sweatshirts" },
      { id: "tracksuits", title: "Tracksuits" },
      { id: "two-tone-johnny-collar-polo", title: "Two Tone Johnny Collar Polo" },
      { id: "waffle-knit-dual-stripe-zip-polo-shirt", title: "Waffle Knit - Dual Stripe Zip Polo Shirt" },
      { id: "waffle-knit-cuban-shirts", title: "Waffle Knit Cuban Shirts" },
      { id: "waffle-knit-round-neck", title: "Waffle Knit Round Neck" },
      { id: "waffle-knit-textured-stripe-polos", title: "Waffle Knit Textured Stripe Polos" },
      { id: "waffle-knit-zipper-polo-t-shirts", title: "Waffle Knit Zipper Polo T-Shirts" },
      { id: "waffle-knitted-sweatshirts", title: "Waffle Knitted Sweatshirts" },
      { id: "wafflezip-mocknecks", title: "WaffleZip Mocknecks" }
    ];

    const determineCollections = (p) => {
      const pCollections = [];
      const title = p.title.toLowerCase();
      const type = (p.product_type || '').toLowerCase();
      const tags = (p.tags || []).map(t => t.toLowerCase());

      if (title.includes('dropshoulder') || title.includes('oversized tee')) pCollections.push("Basic Oversized | Dropshoulder Tees");
      if (title.includes('casual shirt')) pCollections.push("Casual Shirts");
      if (title.includes('drop needle') && title.includes('tee')) pCollections.push("Drop Needle Basic Tees");
      if (title.includes('drop needle') && title.includes('zipper')) pCollections.push("Drop Needle Zipper Polos");
      if (title.includes('full sleeves')) pCollections.push("Full Sleeves T-Shirts");
      if (title.includes('graphic')) pCollections.push("Graphic Tees");
      if (title.includes('hoodie')) pCollections.push("Hoodies");
      if (title.includes('bomber jacket')) pCollections.push("Men’s Bomber Jackets");
      if (title.includes('waffle knit raglan')) pCollections.push("Oversized Waffle Knit Raglan T-shirts");
      if (title.includes('oversized') || title.includes('drop shoulder')) pCollections.push("Oversized | Drop Shoulder");
      if (title.includes('panel zip')) pCollections.push("Panel Zip Polo");
      if (type.includes('sweatshirt')) pCollections.push("Sweatshirts");
      if (title.includes('tracksuit')) pCollections.push("Tracksuits");
      if (title.includes('two tone') || title.includes('johnny collar')) pCollections.push("Two Tone Johnny Collar Polo");
      if (title.includes('waffle knit') && title.includes('dual stripe')) pCollections.push("Waffle Knit - Dual Stripe Zip Polo Shirt");
      if (title.includes('cuban shirt')) pCollections.push("Waffle Knit Cuban Shirts");
      if (title.includes('round neck') && title.includes('waffle')) pCollections.push("Waffle Knit Round Neck");
      if (title.includes('textured stripe')) pCollections.push("Waffle Knit Textured Stripe Polos");
      if (title.includes('waffle') && title.includes('zipper polo')) pCollections.push("Waffle Knit Zipper Polo T-Shirts");
      if (title.includes('waffle') && title.includes('sweatshirt')) pCollections.push("Waffle Knitted Sweatshirts");
      if (title.includes('mockneck')) pCollections.push("WaffleZip Mocknecks");

      if (pCollections.length === 0) pCollections.push(p.product_type || "New Arrivals");
      return pCollections;
    };

    const determineCategory = (p) => {
      const cols = determineCollections(p);
      return cols[0];
    };

    const determineColors = (p) => {
      const colors = new Set();
      
      // Look in options (Standard Shopify way)
      p.options?.forEach(opt => {
        if (opt.name.toLowerCase().includes('color')) {
          opt.values?.forEach(val => colors.add(val));
        }
      });

      // Supplement from title if options are empty
      if (colors.size === 0) {
        const title = p.title.toLowerCase();
        const commonColors = ['black', 'white', 'grey', 'gray', 'navy', 'blue', 'green', 'red', 'maroon', 'charcoal', 'mustard', 'yellow', 'sky blue', 'gray', 'grey', 'olive', 'sand', 'beige'];
        commonColors.forEach(c => {
          if (title.includes(c)) colors.add(c.charAt(0).toUpperCase() + c.slice(1));
        });
      }

      return Array.from(colors);
    };

    const formattedProducts = allProducts.map(p => ({
      id: p.handle,
      name: p.title,
      price: parseFloat(p.variants?.[0]?.price || 0),
      category: determineCategory(p),
      image: p.images?.[0]?.src || '',
      images: p.images?.map(img => img.src) || [],
      video: '', 
      rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
      description: (p.body_html || '').replace(/<[^>]*>?/gm, ' ').substring(0, 500).trim() + '...',
      colors: determineColors(p),
      collections: determineCollections(p)
    }));

    process.stdout.write(JSON.stringify(formattedProducts, null, 2));
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
