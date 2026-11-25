import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function RootLayout() {
  useEffect(() => {
    console.log("🔐 Checking THISAI authentication session...");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ SESSION RESTORED:", user.uid);
      } else {
        console.log("ℹ️ NO ACTIVE SESSION");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}