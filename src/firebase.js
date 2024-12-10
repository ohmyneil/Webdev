import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCK5OViKo8LEfbirkDflqhECZnkHieFBAQ",
  authDomain: "parkbased12.firebaseapp.com",
  projectId: "parkbased12",
  storageBucket: "parkbased12.firebasestorage.app",
  messagingSenderId: "4340703627",
  appId: "1:4340703627:web:f778ea6764485593d3cf8e",
  measurementId: "G-CX3JQYED12",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
