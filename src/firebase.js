import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBigpCll6CrAo7LTPgYwe8cJI0LwmC7FpM",
  authDomain: "chat-app-7bd74.firebaseapp.com",
  projectId: "chat-app-7bd74",
  storageBucket: "chat-app-7bd74.appspot.com",
  messagingSenderId: "556323308236",
  appId: "1:556323308236:web:602a26f3197668c502b869",
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
