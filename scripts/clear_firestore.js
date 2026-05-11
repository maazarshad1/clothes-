
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clearCollection(collectionName) {
  console.log(`Clearing ${collectionName}...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, collectionName, document.id)));
  await Promise.all(deletePromises);
  console.log(`Finished clearing ${collectionName}. Deleted ${snapshot.size} documents.`);
}

async function main() {
  try {
    await clearCollection('products');
    await clearCollection('collections');
    console.log('Database cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

main();
