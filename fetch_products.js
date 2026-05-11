import fs from 'fs';

async function fetchCollections() {
  const url = 'https://dopepk.com/collections.json';
  console.error('Fetching collections list...');
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.collections;
  } catch (e) {
    console.error('Error fetching collections:', e.message);
    return [];
  }
}

async function fetchProductsByCollection(handle) {
  const url = `https://dopepk.com/collections/${handle}/products.json?limit=250`;
  console.error(`Fetching products for collection: ${handle}...`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.products || [];
  } catch (e) {
    console.error(`Error fetching products for ${handle}:`, e.message);
    return [];
  }
}

async function main() {
  try {
    const collections = await fetchCollections();
    const productMap = new Map(); // handle -> product object

    for (const col of collections) {
      if (col.handle === 'frontpage') continue;
      
      const products = await fetchProductsByCollection(col.handle);
      for (const p of products) {
        if (!productMap.has(p.handle)) {
          productMap.set(p.handle, {
            ...p,
            customCollections: [col.title]
          });
        } else {
          const existing = productMap.get(p.handle);
          if (!existing.customCollections.includes(col.title)) {
            existing.customCollections.push(col.title);
          }
        }
      }
    }

    const determineColors = (p) => {
      const colors = new Set();
      p.options?.forEach(opt => {
        if (opt.name.toLowerCase().includes('color')) {
          opt.values?.forEach(val => colors.add(val));
        }
      });
      if (colors.size === 0) {
        const title = p.title.toLowerCase();
        const commonColors = ['black', 'white', 'grey', 'gray', 'navy', 'blue', 'green', 'red', 'maroon', 'charcoal', 'mustard', 'yellow', 'sky blue', 'gray', 'grey', 'olive', 'sand', 'beige'];
        commonColors.forEach(c => {
          if (title.includes(c)) colors.add(c.charAt(0).toUpperCase() + c.slice(1));
        });
      }
      return Array.from(colors);
    };

    const formattedProducts = Array.from(productMap.values()).map(p => ({
      id: p.handle,
      name: p.title,
      price: parseFloat(p.variants?.[0]?.price || 0),
      category: p.customCollections[0] || p.product_type || 'New Arrivals',
      image: p.images?.[0]?.src || '',
      images: p.images?.map(img => img.src) || [],
      video: '', 
      rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
      description: (p.body_html || '').replace(/<[^>]*>?/gm, ' ').substring(0, 500).trim() + '...',
      colors: determineColors(p),
      collections: p.customCollections
    }));

    process.stdout.write(JSON.stringify(formattedProducts, null, 2));
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
