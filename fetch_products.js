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

    const formattedProducts = allProducts.map(p => ({
      id: p.handle,
      name: p.title,
      price: parseFloat(p.variants?.[0]?.price || 0),
      category: p.product_type || 'Uncategorized',
      image: p.images?.[0]?.src || '',
      images: p.images?.map(img => img.src) || [],
      video: '', 
      rating: (Math.random() * (5 - 4) + 4).toFixed(1),
      description: (p.body_html || '').replace(/<[^>]*>?/gm, ' ').substring(0, 500).trim() + '...'
    }));

    process.stdout.write(JSON.stringify(formattedProducts, null, 2));
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
