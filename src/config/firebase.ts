import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDSJVbb1dmG8egUWXq2iudIcOmPowWWnr4",
  authDomain: "hd-v3-efb1e.firebaseapp.com",
  projectId: "hd-v3-efb1e",
  storageBucket: "hd-v3-efb1e.firebasestorage.app",
  messagingSenderId: "1049462091138",
  appId: "1:1049462091138:web:ced10271a3340d820d739b",
  measurementId: "G-Q4BNBF8V4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;