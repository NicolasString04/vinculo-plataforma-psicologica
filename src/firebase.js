import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "elora-tcc.firebaseapp.com",
  projectId: "elora-tcc",
  storageBucket: "elora-tcc.firebasestorage.app",
  messagingSenderId: "261855244220",
  appId: "1:261855244220:web:9e581f755b35363e6345b9",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);