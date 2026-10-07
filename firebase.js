// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

// Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "REMOVED_FIREBASE_API_KEY",
    authDomain: "taskflow-app-5b420.firebaseapp.com",
    projectId: "taskflow-app-5b420",
    storageBucket: "taskflow-app-5b420.firebasestorage.app",
    messagingSenderId: "941988575431",
    appId: "1:941988575431:web:5dffb053724685791766e2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Create Firestore database
export const db = getFirestore(app);