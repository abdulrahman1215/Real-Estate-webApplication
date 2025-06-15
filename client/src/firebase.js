// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-d7ae7.firebaseapp.com",
  projectId: "real-estate-d7ae7",
  storageBucket: "real-estate-d7ae7.firebasestorage.app",
  messagingSenderId: "348815947694",
  appId: "1:348815947694:web:7a14c23a7fc1c2c41bfa3f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);