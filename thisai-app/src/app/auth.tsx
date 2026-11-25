
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function AuthScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      } else {
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      router.replace("/priorities");
    } catch (err: any) {
      console.log("THISAI AUTH ERROR:", err.code, err.message);

      const messages: Record<string, string> = {
        "auth/email-already-in-use":
          "This email already has an account. Please log in.",
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/invalid-credential":
          "Email or password is incorrect.",
        "auth/user-not-found":
          "No account found. Please create an account.",
        "auth/wrong-password":
          "Incorrect password. Please try again.",
        "auth/weak-password":
          "Please choose a stronger password.",
        "auth/network-request-failed":
          "Check your internet connection.",
        "auth/operation-not-allowed":
          "Email login is not enabled in Firebase.",
        "auth/invalid-api-key":
          "Firebase API key is invalid. Check your Firebase configuration.",
        "auth/too-many-requests":
          "Too many attempts. Please try again later.",
      };

      setError(
        messages[err.code] ||
          `Login error: ${err.code || err.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>திசை · THISAI</Text>

          <Text style={styles.eyebrow}>
            YOUR JOURNEY STARTS HERE
          </Text>

          <Text style={styles.title}>
            {isLogin ? "Welcome back." : "Let's begin."}
          </Text>

          <Text style={styles.subtitle}>
            {isLogin
              ? "Continue discovering your direction."
              : "Create your personal space to discover your future."}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9292A3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
            onFocus={() =>
              setTimeout(() => {
                scrollRef.current?.scrollTo({ y: 100, animated: true });
              }, 250)
            }
          />

          <Text style={styles.label}>PASSWORD</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="At least 6 characters"
              placeholderTextColor="#9292A3"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              textContentType={
                isLogin ? "password" : "newPassword"
              }
              returnKeyType="done"
              onSubmitEditing={handleAuth}
              onFocus={() =>
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 180, animated: true });
                }, 250)
              }
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>
                {showPassword ? "HIDE" : "SHOW"}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#514568" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "LOG IN" : "CREATE ACCOUNT"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              setError("");
              setShowPassword(false);
            }}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "New to THISAI? Create an account"
                : "Already have an account? Log in"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Your direction. Your journey. Your future.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17172E",
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 30,
  },
  header: {
    width: "100%",
  },
  brand: {
    color: "#B8E7D1",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 35,
  },
  eyebrow: {
    color: "#B8E7D1",
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 14,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#C7C7D5",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 22,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#B8E7D1",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#17172E",
    borderRadius: 12,
    padding: 17,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    color: "#17172E",
    padding: 17,
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  eyeText: {
    color: "#514568",
    fontSize: 12,
    fontWeight: "bold",
  },
  error: {
    color: "#FF9C9C",
    marginTop: 16,
    lineHeight: 21,
  },
  button: {
    backgroundColor: "#B8E7D1",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#514568",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  switchText: {
    color: "#B8E7D1",
    textAlign: "center",
    marginTop: 22,
    fontSize: 14,
  },
  footer: {
    color: "#9292A3",
    textAlign: "center",
    marginTop: 35,
    fontSize: 12,
  },
});
