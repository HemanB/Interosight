import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlM8UBZhUAL58rTzUVExyBzEwZYMP075c",
  authDomain: "interosight.firebaseapp.com",
  projectId: "interosight",
  storageBucket: "interosight.appspot.com",
  messagingSenderId: "59145049208",
  appId: "1:59145049208:web:8f45426fde7cd857ff098d",
  measurementId: "G-SCZ1NY6DK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 