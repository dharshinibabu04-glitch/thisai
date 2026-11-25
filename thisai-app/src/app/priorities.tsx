
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const priorities = [
  { id: "money", emoji: "💰", title: "Money", desc: "Financial success and income" },
  { id: "passion", emoji: "❤️", title: "Passion", desc: "Doing what I truly love" },
  { id: "growth", emoji: "📈", title: "Growth", desc: "Learning and improving" },
  { id: "stability", emoji: "🛡️", title: "Stability", desc: "Security and consistency" },
  { id: "impact", emoji: "🌍", title: "Impact", desc: "Making a difference" },
  { id: "freedom", emoji: "🦋", title: "Freedom", desc: "Independence and flexibility" },
];

export default function PrioritiesScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function togglePriority(id: string) {
    if (saving) return;

    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  }

  async function continueToAssessment() {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login required", "Please log in to continue.");
      router.replace("/auth");
      return;
    }

    if (selected.length !== 3 || saving) return;

    try {
      setSaving(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          priorities: selected,
          prioritiesUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push("/assessment");
    } catch (error: any) {
      console.error("THISAI PRIORITIES SAVE ERROR:", error);
      Alert.alert(
        "Couldn't save your priorities",
        error?.message || "Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ImageBackground
      source={require("../../assets/priorities-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar style="light" />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.logo}>திசை · THISAI</Text>
          <Text style={styles.step}>YOUR JOURNEY · STEP 01</Text>

          <Text style={styles.heading}>
            What matters{"\n"}most to you?
          </Text>

          <Text style={styles.subtitle}>
            Your future should reflect what you value.
            Choose your top three priorities.
          </Text>

          <Text style={styles.counter}>
            {selected.length} OF 3 SELECTED
          </Text>

          {priorities.map((item) => {
            const active = selected.includes(item.id);

            return (
              <Pressable
                key={item.id}
                onPress={() => togglePriority(item.id)}
                style={[
                  styles.card,
                  active && styles.selectedCard,
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>

                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.description}>{item.desc}</Text>
                </View>

                <Text style={styles.check}>
                  {active ? "✓" : "+"}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            style={[
              styles.button,
              (selected.length !== 3 || saving) && styles.disabledButton,
            ]}
            disabled={selected.length !== 3 || saving}
            onPress={continueToAssessment}
          >
            {saving ? (
              <ActivityIndicator color="#17172E" />
            ) : (
              <Text style={styles.buttonText}>
                {selected.length === 3
                  ? "Continue →"
                  : `Choose ${3 - selected.length} more`}
              </Text>
            )}
          </Pressable>

          <Text style={styles.footer}>
            There is no right or wrong choice.
          </Text>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#17172E",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23,23,46,0.48)",
  },
  content: {
    padding: 25,
    paddingTop: 65,
    paddingBottom: 40,
  },
  logo: {
    color: "#B8E7D1",
    fontSize: 19,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 2,
  },
  step: {
    color: "#B8E7D1",
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 45,
  },
  heading: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 18,
    lineHeight: 44,
  },
  subtitle: {
    color: "#EEEEF5",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
    marginTop: 15,
    marginBottom: 30,
  },
  counter: {
    color: "#B8E7D1",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(190, 225, 240, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(220, 245, 255, 0.8)",
    borderRadius: 15,
    padding: 17,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: "#B8E7D1",
    backgroundColor: "rgba(210, 240, 248, 0.88)",
  },
  emoji: {
    fontSize: 27,
    marginRight: 15,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    color: "#D0D0DF",
    fontSize: 12,
    marginTop: 5,
  },
  check: {
    color: "#B8E7D1",
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#B8E7D1",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 18,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: "#17172E",
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    color: "#EEEEF5",
    textAlign: "center",
    fontSize: 12,
    marginTop: 18,
  },
});
