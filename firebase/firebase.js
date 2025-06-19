import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAIf3ofQHrq2ss6owI8_6vrMsKtm8WNm3s",
  authDomain: "agentsync-5ab53.firebaseapp.com",
  projectId: "agentsync-5ab53",
  storageBucket: "agentsync-5ab53.firebasestorage.app",
  messagingSenderId: "876675261002",
  appId: "1:876675261002:web:b99da1f8ebf5cdac1f7cb3"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)
const provider = new GoogleAuthProvider();
export { auth, provider , db };
