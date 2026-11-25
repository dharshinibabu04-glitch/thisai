
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  type Auth,
} from "firebase/auth";

// @ts-ignore - Firebase 13.3.0 React Native export typing issue
import { getReactNativePersistence } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-4HTKlNbEi1xiZrGrDx9LJL1IXt-kF7Y",
  authDomain: "thisai-career-app.firebaseapp.com",
  projectId: "thisai-career-app",
  storageBucket: "thisai-career-app.firebasestorage.app",
  messagingSenderId: "30615654024",
  appId: "1:30615654024:web:9277eeb51c8de51f4ad93d",
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth: Auth;
console.log(
  "Firebase RN persistence:",
  typeof getReactNativePersistence
);

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.error("🔥 FIREBASE AUTH INITIALIZATION ERROR:", error);
  auth = getAuth(app);
}
console.log("THISAI PROJECT:", auth.app.options.projectId);
console.log("THISAI API KEY ENDING:", auth.app.options.apiKey?.slice(-6));

export { auth };
export const db = getFirestore(app);
export default app;
