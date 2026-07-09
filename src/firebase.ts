import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEjB77ZgnHQaL1QW50DHLxTmVyZYFm6yk",
  authDomain: "internetfibre-8113d.firebaseapp.com",
  databaseURL: "https://internetfibre-8113d-default-rtdb.firebaseio.com",
  projectId: "internetfibre-8113d",
  storageBucket: "internetfibre-8113d.firebasestorage.app",
  messagingSenderId: "472917611473",
  appId: "1:472917611473:web:6aeaaa52bc1f702800c6f0",
  measurementId: "G-6SW5YKRBNT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export default app;