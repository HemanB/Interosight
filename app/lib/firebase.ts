// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);