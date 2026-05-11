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
    for (let i = 1; i <= 5; i++) { // Fetch first 5 pages (250 products)
      const products = await fetchProducts(i);
      if (!products || products.length === 0) break;
      allProducts = allProducts.concat(products);
    }

    const determineCategory = (p) => {
      const title = p.title.toLowerCase();
      const tags = (p.tags || []).map(t => t.toLowerCase());
      
      if (title.includes('two tone') || title.includes('johnny collar')) return 'Two Tone Polos';
      if (title.includes('textured stripe')) return 'Textured Stripe Polos';
      if (title.includes('wafflezip') || title.includes('mockneck')) return 'WaffleZip Mocknecks';
      if (title.includes('dual stripe') || title.includes('zip polo')) return 'Dual Stripe Zip Polos';
      if (title.includes('panel zip')) return 'Panel Zip Polos';
      if (title.includes('sweatshirt')) return 'Sweatshirts';
      if (title.includes('bomber jacket')) return 'Bomber Jackets';
      if (title.includes('t-shirt') || title.includes('tee')) return 'T-Shirts';
      if (title.includes('polo')) return 'Polos';
      if (title.includes('winter')) return 'Winter Arrivals';
      
      return p.product_type || 'New Arrivals';
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
      description: (p.body_html || '').replace(/<[^>]*>?/gm, ' ').substring(0, 500).trim() + '...'
    }));

    process.stdout.write(JSON.stringify(formattedProducts, null, 2));
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
