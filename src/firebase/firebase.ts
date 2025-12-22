import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtOtfuFKRHD6DdyTuAThdrqR8lG_kZm7I",
  authDomain: "campus360-34d71.firebaseapp.com",
  projectId: "campus360-34d71",
  storageBucket: "campus360-34d71.firebasestorage.app",
  messagingSenderId: "576176962920",
  appId: "1:576176962920:web:435c1888978210754c2add"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
