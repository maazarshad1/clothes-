import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import fallbackConfig from '../../firebase-applet-config.json';

// Use environment variables if available (prefixed with VITE_ for client-side)
// This patterns helps avoid "leaking" secrets in source code by allowing users
// to set these values in the platform's secret manager or environment.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID
};

const isConfigMissing = Object.values(config).some(v => !v || v.startsWith('Set VITE_'));

// Determine source of truth
const firebaseConfig = {
  apiKey: config.apiKey || fallbackConfig.apiKey,
  authDomain: config.authDomain || fallbackConfig.authDomain,
  projectId: config.projectId || fallbackConfig.projectId,
  storageBucket: config.storageBucket || fallbackConfig.storageBucket,
  messagingSenderId: config.messagingSenderId || fallbackConfig.messagingSenderId,
  appId: config.appId || fallbackConfig.appId,
  firestoreDatabaseId: config.firestoreDatabaseId || fallbackConfig.firestoreDatabaseId
};

if (isConfigMissing) {
  console.warn("Firebase configuration is incomplete. Please add VITE_FIREBASE_* variables to the Settings > Secrets menu.");
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check as per guidelines
async function testConnection() {
  if (isConfigMissing) return;
  
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('invalid-api-key'))) {
      console.error("Firebase connection failed. Please verify your API Key and Project ID in Settings > Secrets.");
    } else {
      console.error("Firebase initialization error:", error);
    }
  }
}

testConnection();
