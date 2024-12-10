import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
apiKey: "AIzaSyByi5OHN80LLDecPOfmrhplLAVk6ZSi01Q",
  authDomain: "pbased-33db7.firebaseapp.com",
  projectId: "pbased-33db7",
  storageBucket: "pbased-33db7.firebasestorage.app",
  messagingSenderId: "425878338771",
  appId: "1:425878338771:web:9f6f1ed01aae10d479e826",
  measurementId: "G-RNEPRE7YBW"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
