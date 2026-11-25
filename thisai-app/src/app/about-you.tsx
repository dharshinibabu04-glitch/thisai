
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { auth, db } from "../lib/firebase";

export default function AboutYouScreen() {
  const [story, setStory] = useState("");
  const [aiConsent, setAiConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const baseStoryRef = useRef("");
  const finalTranscriptRef = useRef("");

  const appendText = (base: string, addition: string) => {
    if (!addition.trim()) return base;
    return base.trim()
      ? `${base.trim()} ${addition.trim()}`
      : addition.trim();
  };

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setSpeechError("");
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript || "";

    if (event.isFinal) {
      finalTranscriptRef.current = appendText(
        finalTranscriptRef.current,
        transcript
      );
    }

    const combined = appendText(
      baseStoryRef.current,
      appendText(
        finalTranscriptRef.current,
        event.isFinal ? "" : transcript
      )
    );

    setStory(combined);
    setSaved(false);
  });

  useSpeechRecognitionEvent("error", (event) => {
    setRecognizing(false);

    if (event.error === "aborted") return;

    const messages: Record<string, string> = {
      "not-allowed": "Please allow microphone permission in your phone settings.",
      "no-speech": "We couldn't hear any speech. Please try again.",
      "network": "Speech recognition needs an internet connection.",
      "service-not-allowed": "Speech recognition service is unavailable on your phone.",
      "language-not-supported": "The selected recognition language is unavailable.",
      "busy": "Speech recognition is busy. Please try again.",
    };

    setSpeechError(
      messages[event.error] ||
      "Something went wrong with voice recognition. Please try again."
    );
  });

  const startListening = async () => {
    try {
      setSpeechError("");

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission needed",
          "Please allow microphone access to speak your story."
        );
        return;
      }

      baseStoryRef.current = story;
      finalTranscriptRef.current = "";

      ExpoSpeechRecognitionModule.start({
        lang: "en-IN",
        interimResults: true,
        continuous: true,
      });
    } catch (error) {
      console.error("SPEECH START ERROR:", error);
      setSpeechError("Unable to start voice recognition. Please try again.");
    }
  };

  const stopListening = () => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error("SPEECH STOP ERROR:", error);
      setRecognizing(false);
    }
  };

  const saveStory = async () => {
    if (recognizing) {
      Alert.alert(
        "Finish speaking first",
        "Please stop voice recognition before saving your story."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Sign in required",
        "Please sign in to save your story."
      );
      router.replace("/auth");
      return;
    }

    if (!story.trim()) {
      Alert.alert(
        "Your story is waiting",
        "Write a little about yourself before saving."
      );
      return;
    }

    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          aboutYou: {
            story: story.trim(),
            aiAnalysisConsent: aiConsent,
            updatedAt: serverTimestamp(),
          },
          aboutYouUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSaved(true);

      Alert.alert(
        "Your story is saved ❤️",
        "Thank you for trusting THISAI with a little piece of your story."
      );
    } catch (error) {
      console.error("STORY SAVE ERROR:", error);

      Alert.alert(
        "Couldn't save your story",
        "Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" backgroundColor="#EAF5F7" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>
          THISAI · YOUR PERSONAL SPACE
        </Text>

        {/* Short welcome message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.heading}>
            A little space,{"\n"}just for you.
          </Text>

          <Text style={styles.subheading}>
            You don't have to hide anything here.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.storySection}>
          <Text style={styles.sectionTitle}>
            Your story, in your own words.
          </Text>

          <Text style={styles.helper}>
            Start anywhere. Take your time. This space is yours.
          </Text>

          {/* Voice input ABOVE the writing box */}
          <View style={styles.voiceCard}>
            <View style={styles.voiceHeader}>
              <View style={styles.voiceIcon}>
                <Text style={styles.voiceIconText}>🎙️</Text>
              </View>

              <View style={styles.voiceHeading}>
                <Text style={styles.voiceTitle}>
                  Prefer speaking?
                </Text>

                <Text style={styles.voiceDescription}>
                  Speak naturally. Your words will appear in the box below.
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.voiceButton,
                recognizing && styles.voiceButtonActive,
              ]}
              onPress={recognizing ? stopListening : startListening}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={
                recognizing ? "Stop speaking" : "Start speaking"
              }
            >
              <Text style={styles.voiceButtonText}>
                {recognizing ? "■  Stop speaking" : "🎙️  Start speaking"}
              </Text>
            </Pressable>

            <Text style={styles.voiceStatus}>
              {recognizing
                ? "Listening... Speak clearly. Tap Stop when finished."
                : "Your voice becomes editable text. You can change it anytime."}
            </Text>

            {speechError ? (
              <Text style={styles.speechError}>
                {speechError}
              </Text>
            ) : null}
          </View>

          {/* Writing box */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.storyInput}
              multiline
              textAlignVertical="top"
              placeholder="Start wherever you feel comfortable. You can write about your experiences, interests, dreams, challenges, or anything that matters to you..."
              placeholderTextColor="#899FA1"
              value={story}
              onChangeText={(value) => {
                setStory(value);
                setSaved(false);
              }}
              editable={!loading && !recognizing}
              selectionColor="#2C7880"
              accessibilityLabel="Write your personal story"
            />

            <View style={styles.inputFooter}>
              <Text style={styles.inputHint}>
                Your words. Your experiences. Your story.
              </Text>

              <Text style={styles.characterCount}>
                {story.length} characters
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy and AI consent */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Text style={styles.privacyIconText}>♡</Text>
          </View>

          <Text style={styles.privacyTitle}>
            Your story belongs to you.
          </Text>

          <Text style={styles.privacyText}>
            Your story is saved to your account. You can
            choose whether to give THISAI permission to
            use it for personalised AI analysis. Saving
            your story does not automatically analyse it.
          </Text>

          <Pressable
            style={styles.consentRow}
            onPress={() => setAiConsent(!aiConsent)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: aiConsent }}
          >
            <View
              style={[
                styles.checkbox,
                aiConsent && styles.checkedBox,
              ]}
            >
              {aiConsent && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>

            <Text style={styles.consentText}>
              I give permission for THISAI to use my story
              for personalised AI analysis when that feature
              is available. I understand this is optional.
            </Text>
          </Pressable>
        </View>

        {/* Save */}
        <Pressable
          style={[
            styles.saveButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={saveStory}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {saved ? "Save changes" : "Save my story"}
            </Text>
          )}
        </Pressable>

        <Text style={styles.footer}>
          Take your time. You don't have to figure
          everything out today.
        </Text>

        <Text style={styles.footerBrand}>
          THISAI · FIND YOUR DIRECTION
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EAF5F7",
  },

  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 55,
  },

  brand: {
    color: "#4F9297",
    fontSize: 11,
    letterSpacing: 2.2,
    fontWeight: "800",
    marginBottom: 32,
  },

  welcomeSection: {
    marginBottom: 4,
  },

  heading: {
    color: "#174B59",
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 45,
    letterSpacing: -0.8,
    marginBottom: 17,
  },

  subheading: {
    color: "#286773",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 29,
  },

  divider: {
    height: 1,
    backgroundColor: "#C9DFDF",
    marginVertical: 28,
  },

  storySection: {
    marginBottom: 4,
  },

  sectionTitle: {
    color: "#174B59",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 9,
  },

  helper: {
    color: "#64858A",
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 17,
  },

  voiceCard: {
    backgroundColor: "#D9ECEC",
    borderRadius: 20,
    padding: 17,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#B9D8D8",
  },

  voiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0CC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  voiceIconText: {
    fontSize: 21,
  },

  voiceHeading: {
    flex: 1,
  },

  voiceTitle: {
    color: "#174B59",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  voiceDescription: {
    color: "#64858A",
    fontSize: 12,
    lineHeight: 18,
  },

  voiceButton: {
    backgroundColor: "#17616B",
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: "center",
  },

  voiceButtonActive: {
    backgroundColor: "#B56B4E",
  },

  voiceButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  voiceStatus: {
    color: "#64858A",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 12,
  },

  speechError: {
    color: "#A14F4F",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
  },

  inputCard: {
    backgroundColor: "#FFFDF7",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E9DDBF",
    shadowColor: "#174B59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  storyInput: {
    minHeight: 320,
    color: "#244C50",
    fontSize: 15,
    lineHeight: 27,
    padding: 0,
  },

  inputFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0E8D7",
    marginTop: 14,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  inputHint: {
    color: "#4F9297",
    fontSize: 11,
    fontWeight: "600",
  },

  characterCount: {
    color: "#899FA1",
    fontSize: 10,
  },

  privacyCard: {
    backgroundColor: "#D9ECEC",
    borderRadius: 19,
    padding: 19,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#B9D8D8",
  },

  privacyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF0CC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  privacyIconText: {
    color: "#A47A35",
    fontSize: 23,
    lineHeight: 27,
  },

  privacyTitle: {
    color: "#174B59",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 9,
  },

  privacyText: {
    color: "#52757A",
    fontSize: 13,
    lineHeight: 22,
  },

  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 19,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#4F9297",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF7",
  },

  checkedBox: {
    backgroundColor: "#17616B",
    borderColor: "#17616B",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  consentText: {
    flex: 1,
    color: "#41666A",
    fontSize: 12,
    lineHeight: 21,
  },

  saveButton: {
    backgroundColor: "#174B59",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    shadowColor: "#174B59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  footer: {
    color: "#64858A",
    fontSize: 12,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 24,
  },

  footerBrand: {
    color: "#4F9297",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },
});
