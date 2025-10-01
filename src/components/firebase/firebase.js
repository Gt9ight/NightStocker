// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5npIcH5qGtNk2f7I1mgHCo6ZXgSk8MFk",
  authDomain: "nightstocker-7b414.firebaseapp.com",
  projectId: "nightstocker-7b414",
  storageBucket: "nightstocker-7b414.appspot.com", // 👈 small correction
  messagingSenderId: "556948767845",
  appId: "1:556948767845:web:f6f09a9384e83dbf5af28c",
  measurementId: "G-Z4B2Z91L4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };
