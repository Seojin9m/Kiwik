import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD51UibCS_p7F-CTHqAqfjtZ56wtPEKrgE",
    authDomain: "kiwik-8e9fc.firebaseapp.com",
    projectId: "kiwik-8e9fc",
    storageBucket: "kiwik-8e9fc.appspot.com",
    messagingSenderId: "286038450400",
    appId: "1:286038450400:web:3b9059b28c7ab0b047b085",
    measurementId: "G-PCX4G1JKLF"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);