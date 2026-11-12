import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoq88m_bContWKO3pfa9vNhJowZV3hBsQ",
  authDomain: "elora-tcc.firebaseapp.com",
  projectId: "elora-tcc",
  storageBucket: "elora-tcc.firebasestorage.app",
  messagingSenderId: "261855244220",
  appId: "1:261855244220:web:9e581f755b35363e6345b9",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);