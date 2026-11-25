
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { assessmentQuestions } from "../data/assessment-questions";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function QuestionsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = assessmentQuestions[currentIndex];
  const total = assessmentQuestions.length;
  const selected = answers[question.id] || [];
  const isMulti = question.type === "multi_choice";
  const maxSelections = question.maxSelections || 1;

  function chooseOption(option: string) {
    setAnswers((previous) => {
      const old = previous[question.id] || [];

      if (!isMulti) {
        return { ...previous, [question.id]: [option] };
      }

      if (old.includes(option)) {
        return {
          ...previous,
          [question.id]: old.filter((item) => item !== option),
        };
      }

      if (old.length >= maxSelections) return previous;

      return {
        ...previous,
        [question.id]: [...old, option],
      };
    });
  }

  async function nextQuestion() {
    if (selected.length === 0 || saving) return;

    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login required", "Please log in again to save your assessment.");
      router.replace("/auth");
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "users", user.uid, "assessments", "initial"),
        {
          answers,
          totalQuestions: total,
          completed: true,
          completedAt: serverTimestamp(),
        },
        { merge: true }
      );

     router.replace("/about-you");
    } catch (error: any) {
      console.error("THISAI ASSESSMENT SAVE ERROR:", error);
      Alert.alert(
        "Couldn't save your assessment",
        error?.message || "Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function previousQuestion() {
    if (currentIndex > 0 && !saving) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completion}>
          <Text style={styles.brand}>திசை · THISAI</Text>
          <Text style={styles.success}>✓</Text>
          <Text style={styles.heading}>
            You completed your assessment.
          </Text>
          <Text style={styles.subtitle}>
            Your answers have been saved. They are ready for the next stage
            of your journey.
          </Text>
          <Text style={styles.note}>
            Your assessment responses are stored securely in your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>திசை · THISAI</Text>
        <Text style={styles.step}>SELF DISCOVERY</Text>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / total) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          QUESTION {currentIndex + 1} OF {total}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>{question.question}</Text>

        {isMulti ? (
          <Text style={styles.hint}>
            Choose up to {maxSelections} options
            {" · "}
            {selected.length}/{maxSelections} selected
          </Text>
        ) : (
          <Text style={styles.hint}>Choose one option</Text>
        )}

        <View style={styles.options}>
          {question.options.map((option, index) => {
            const active = selected.includes(option);

            return (
              <Pressable
                key={`${question.id}-${index}`}
                onPress={() => chooseOption(option)}
                disabled={saving}
                style={[
                  styles.option,
                  active && styles.optionActive,
                ]}
              >
                <View
                  style={[
                    styles.circle,
                    active && styles.circleActive,
                  ]}
                >
                  {active && <View style={styles.dot} />}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    active && styles.optionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={previousQuestion}
          disabled={currentIndex === 0 || saving}
          style={[
            styles.backButton,
            (currentIndex === 0 || saving) && styles.disabledButton,
          ]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Pressable
          onPress={nextQuestion}
          disabled={selected.length === 0 || saving}
          style={[
            styles.nextButton,
            (selected.length === 0 || saving) && styles.disabledNext,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#514568" />
          ) : (
            <Text style={styles.nextText}>
              {currentIndex === total - 1 ? "Finish" : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17172E",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  brand: {
    color: "#B8E7D1",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 1,
  },
  step: {
    color: "#C7C7D5",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 12,
  },
  progressArea: {
    paddingHorizontal: 24,
    marginTop: 25,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#38384F",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    backgroundColor: "#B8E7D1",
    borderRadius: 10,
  },
  progressText: {
    color: "#C7C7D5",
    fontSize: 11,
    marginTop: 10,
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
    marginTop: 30,
  },
  contentInner: {
    paddingHorizontal: 24,
    paddingBottom: 25,
  },
  question: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
    lineHeight: 35,
  },
  hint: {
    color: "#B8E7D1",
    fontSize: 13,
    marginTop: 16,
    marginBottom: 18,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#44445B",
    backgroundColor: "#24243D",
  },
  optionActive: {
    borderColor: "#B8E7D1",
    backgroundColor: "#303F45",
  },
  circle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#A6A6B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  circleActive: {
    borderColor: "#B8E7D1",
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#B8E7D1",
  },
  optionText: {
    flex: 1,
    color: "#E5E5ED",
    fontSize: 15,
    lineHeight: 22,
  },
  optionTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#38384F",
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#77778D",
  },
  backText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B8E7D1",
  },
  nextText: {
    color: "#514568",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.35,
  },
  disabledNext: {
    opacity: 0.4,
  },
  completion: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },
  success: {
    color: "#B8E7D1",
    fontSize: 65,
    marginTop: 35,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: 20,
    lineHeight: 38,
  },
  subtitle: {
    color: "#C7C7D5",
    fontSize: 16,
    lineHeight: 25,
    marginTop: 14,
  },
  note: {
    color: "#B8E7D1",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 24,
  },
});
