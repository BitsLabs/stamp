import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6NP_jDbxPsMz0r1ItHJYRrcE5JlbWv18",
  authDomain: "stamp-4c525.firebaseapp.com",
  projectId: "stamp-4c525",
  storageBucket: "stamp-4c525.firebasestorage.app",
  messagingSenderId: "759454052430",
  appId: "1:759454052430:web:f0581868180f8fa262531f",
  measurementId: "G-FTGPKGD633"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc };
