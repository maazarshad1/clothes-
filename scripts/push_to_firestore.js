
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';

const productsPath = path.resolve(process.cwd(), 'src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function pushData() {
  console.log(`Starting push of ${products.length} products...`);
  
  // Extract unique collections
  const uniqueCollections = new Set();
  products.forEach(p => {
    if (p.collections) {
      p.collections.forEach(c => uniqueCollections.add(c));
    }
  });

  console.log(`Found ${uniqueCollections.size} collections.`);

  // Push Collections
  for (const colName of uniqueCollections) {
    const colRef = doc(collection(db, 'collections'));
    await setDoc(colRef, { name: colName });
    console.log(`Pushed collection: ${colName}`);
  }

  // Push Products
  let count = 0;
  for (const product of products) {
    await setDoc(doc(db, 'products', product.id), product);
    count++;
    if (count % 50 === 0) console.log(`Pushed ${count} products...`);
  }

  console.log('Complete sync successful.');
  process.exit(0);
}

pushData().catch(err => {
  console.error('Error during push:', err);
  process.exit(1);
});
