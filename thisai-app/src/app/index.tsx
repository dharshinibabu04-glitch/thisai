
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen() {
  const [checking, setChecking] = useState(false);

  const beginJourney = async () => {
    if (checking) return;

    setChecking(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        router.push("/auth");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();

      if (!data?.priorities || data.priorities.length !== 3) {
        router.push("/priorities");
        return;
      }

      const assessmentDoc = await getDoc(
        doc(db, "users", user.uid, "assessments", "initial")
      );

      if (!assessmentDoc.exists() || !assessmentDoc.data()?.completed) {
        router.push("/assessment");
        return;
      }

      if (!data?.aboutYou?.story?.trim()) {
        router.push("/about-you");
        return;
      }

      router.push("/explore");
    } catch (error) {
      console.error("THISAI JOURNEY ERROR:", error);
      router.push("/auth");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/thisai-welcome.png")}
      style={styles.background}
      resizeMode="contain"
    >
      <StatusBar hidden />

      <Pressable
        style={styles.button}
        onPress={beginJourney}
        disabled={checking}
        accessibilityRole="button"
        accessibilityLabel="Begin your THISAI journey"
      >
        {checking && (
          <View style={styles.loader}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#17172E",
  },
  button: {
    position: "absolute",
    width: "85%",
    height: 65,
    bottom: "7%",
    alignSelf: "center",
    justifyContent: "center",
  },
  loader: {
    alignItems: "center",
  },
});
