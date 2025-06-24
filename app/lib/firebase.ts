// Expo Go compatible Firebase setup: Only web SDK is used. No persistence or native modules. Auth state will not persist across restarts in Expo Go.
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAlM8UBZhUAL58rTzUVExyBzEwZYMP075c",
  authDomain: "interosight.firebaseapp.com",
  projectId: "interosight",
  storageBucket: "interosight.firebasestorage.app",
  messagingSenderId: "59145049208",
  appId: "1:59145049208:web:8f45426fde7cd857ff098d",
  measurementId: "G-SCZ1NY6DK6"
};

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth: In-memory persistence for all platforms (Expo Go compatible)
const auth: Auth = getAuth(app);

// Firestore
const db: Firestore = getFirestore(app);

export { app, auth, db };