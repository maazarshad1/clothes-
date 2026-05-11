import fs from 'fs';

const products = JSON.parse(fs.readFileSync('products_data.json', 'utf8'));

const tsContent = `import { Product } from '../context/StoreContext';

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/data/products.ts', tsContent);
console.log('Successfully updated src/data/products.ts');
