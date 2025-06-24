// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, Firestore } from "firebase/firestore";
import { Platform } from "react-native";

// Suppress Firebase Auth warnings about AsyncStorage persistence
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('AsyncStorage') || 
       message.includes('persistence') || 
       message.includes('memory persistence'))) {
    // Suppress AsyncStorage and persistence warnings
    return;
  }
  originalWarn.apply(console, args);
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlM8UBZhUAL58rTzUVExyBzEwZYMP075c",
  authDomain: "interosight.firebaseapp.com",
  projectId: "interosight",
  storageBucket: "interosight.firebasestorage.app",
  messagingSenderId: "59145049208",
  appId: "1:59145049208:web:8f45426fde7cd857ff098d",
  measurementId: "G-SCZ1NY6DK6"
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check your config.');
  // Don't throw error, just log it to prevent app crash
}

console.log('Initializing Firebase with project:', firebaseConfig.projectId);

// Initialize Firebase only if no apps exist
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app:', app.name);
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  // Don't throw error, just log it to prevent app crash
}

// Initialize Auth with proper error handling
let auth;
try {
  if (app) {
    // Use getAuth which works reliably with Firebase v11+
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
    
    // Set auth timeout for slow connections
    auth.useDeviceLanguage();
    
    // Test auth connection with timeout
    const authTimeout = setTimeout(() => {
      console.warn('Auth connection test timed out - continuing anyway');
    }, 5000);
    
    auth.onAuthStateChanged((user) => {
      clearTimeout(authTimeout);
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    }, (error) => {
      clearTimeout(authTimeout);
      console.error('Auth state change error:', error);
    });
  } else {
    console.error('Firebase app not initialized, cannot initialize Auth');
  }
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  // Don't throw error, just log it to prevent app crash
}

// Initialize Firestore
let db: Firestore | null = null;
try {
  if (app) {
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully');
    
    // Enable network by default
    enableNetwork(db).then(() => {
      console.log('Firestore network enabled');
    }).catch((error) => {
      console.error('Error enabling Firestore network:', error);
    });
  } else {
    console.error('Firebase app not initialized, cannot initialize Firestore');
  }
} catch (error) {
  console.error('Error initializing Firebase Firestore:', error);
  // Don't throw error, just log it to prevent app crash
}

// Connect to emulators in development (optional)
if (__DEV__) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

// Only initialize analytics on web platform
let analytics = null;
if (Platform.OS === 'web') {
  try {
    const { getAnalytics } = require("firebase/analytics");
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized successfully');
  } catch (error) {
    console.warn('Analytics not available:', error);
  }
}

// Export with fallbacks to prevent app crashes
export { app, analytics, auth, db };

// Utility functions for network management
export const enableFirestoreNetwork = async () => {
  if (db) {
    try {
      await enableNetwork(db);
      console.log('Firestore network enabled');
      return true;
    } catch (error) {
      console.error('Error enabling Firestore network:', error);
      return false;
    }
  }
  return false;
};

export const disableFirestoreNetwork = async () => {
  if (db) {
    try {
      await disableNetwork(db);
      console.log('Firestore network disabled');
      return true;
    } catch (error) {
      console.error('Error disabling Firestore network:', error);
      return false;
    }
  }
  return false;
};