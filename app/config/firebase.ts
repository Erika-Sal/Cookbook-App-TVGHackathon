import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDt7fq3ItbDFPS5UZyNrMot0Owjh4J2TmY",
  authDomain: "hackathoncookingapp.firebaseapp.com",
  projectId: "hackathoncookingapp",
  storageBucket: "hackathoncookingapp.appspot.com",
  messagingSenderId: "33743403495",
  appId: "1:33743403495:web:a4047c88285d419c4ae542"
};

// Check if Firebase app already exists, if not, initialize it
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);