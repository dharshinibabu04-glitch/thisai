
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { StatusBar } from "expo-status-bar";

type DashboardData = {
  name: string;
  priorities: string[];
  assessmentCompleted: boolean;
  storyCompleted: boolean;
};

export default function ExploreScreen() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData>({
    name: "there",
    priorities: [],
    assessmentCompleted: false,
    storyCompleted: false,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/auth");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const assessmentRef = doc(
        db,
        "users",
        user.uid,
        "assessments",
        "initial"
      );

      const [userSnapshot, assessmentSnapshot] = await Promise.all([
        getDoc(userRef),
        getDoc(assessmentRef),
      ]);

      const userData = userSnapshot.data();
      const assessmentData = assessmentSnapshot.data();

      setDashboard({
        name:
          userData?.profile?.name ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "there",
        priorities: Array.isArray(userData?.priorities)
          ? userData.priorities
          : [],
        assessmentCompleted: assessmentData?.completed === true,
        storyCompleted: Boolean(userData?.aboutYou?.story?.trim()),
      });
    } catch (error) {
      console.error("THISAI DASHBOARD ERROR:", error);
      Alert.alert(
        "Unable to load your dashboard",
        "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = [
    dashboard.priorities.length === 3,
    dashboard.assessmentCompleted,
    dashboard.storyCompleted,
  ].filter(Boolean).length;

  const progress = Math.round((completedSteps / 3) * 100);

  const steps = [
    {
      number: "01",
      title: "Your priorities",
      description: "What matters most to your future",
      completed: dashboard.priorities.length === 3,
      route: "/priorities",
    },
    {
      number: "02",
      title: "Self-discovery",
      description: "Understand your interests and strengths",
      completed: dashboard.assessmentCompleted,
      route: "/assessment",
    },
    {
      number: "03",
      title: "Your story",
      description: "Share your experiences and aspirations",
      completed: dashboard.storyCompleted,
      route: "/about-you",
    },
  ];

  const continueJourney = () => {
    if (dashboard.priorities.length !== 3) {
      router.push("/priorities");
    } else if (!dashboard.assessmentCompleted) {
      router.push("/assessment");
    } else if (!dashboard.storyCompleted) {
      router.push("/about-you");
    } else {
      Alert.alert(
        "Your discovery journey",
        "Your information is ready. Career analysis will be available when we connect the AI engine."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#315C49" />
        <Text style={styles.loadingText}>Preparing your direction...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>திசை · THISAI</Text>
            <Text style={styles.tagline}>
              Find your direction. Create your future.
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/about-you")}
          >
            <Text style={styles.profileInitial}>
              {dashboard.name.charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        </View>

        {/* GREETING */}
        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>YOUR PERSONAL SPACE</Text>
          <Text style={styles.heading}>
            Welcome back,{"\n"}
            <Text style={styles.headingAccent}>{dashboard.name}.</Text>
          </Text>
          <Text style={styles.description}>
            Your future isn't something you have to guess.
            Let's discover it, one step at a time.
          </Text>
        </View>

        {/* PRIORITIES */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>WHAT MATTERS TO YOU</Text>
              <Text style={styles.cardTitle}>Your priorities</Text>
            </View>
            <Pressable onPress={() => router.push("/priorities")}>
              <Text style={styles.editText}>EDIT ↗</Text>
            </Pressable>
          </View>

          {dashboard.priorities.length > 0 ? (
            <View style={styles.priorityList}>
              {dashboard.priorities.map((priority, index) => (
                <View key={priority} style={styles.priorityItem}>
                  <Text style={styles.priorityNumber}>0{index + 1}</Text>
                  <Text style={styles.priorityName}>{priority}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>
              Your priorities haven't been selected yet.
            </Text>
          )}
        </View>

        {/* JOURNEY PROGRESS */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>YOUR DISCOVERY</Text>
              <Text style={styles.cardTitle}>The journey so far</Text>
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>

          <Text style={styles.mutedText}>
            {completedSteps} of 3 discovery stages completed
          </Text>

          <View style={styles.steps}>
            {steps.map((step) => (
              <Pressable
                key={step.number}
                style={styles.step}
                onPress={() => router.push(step.route as never)}
              >
                <View
                  style={[
                    styles.stepNumber,
                    step.completed && styles.stepNumberCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberText,
                      step.completed && styles.completedNumberText,
                    ]}
                  >
                    {step.completed ? "✓" : step.number}
                  </Text>
                </View>

                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>
                    {step.description}
                  </Text>
                </View>

                <Text style={styles.stepStatus}>
                  {step.completed ? "DONE" : "OPEN"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* CONTINUE */}
        <Pressable
          style={styles.primaryButton}
          onPress={continueJourney}
        >
          <Text style={styles.primaryButtonText}>
            Continue your journey →
          </Text>
        </Pressable>

        {/* CAREER DIRECTION */}
        <View style={styles.darkCard}>
          <Text style={styles.darkEyebrow}>YOUR NEXT CHAPTER</Text>
          <Text style={styles.darkTitle}>Career direction</Text>
          <Text style={styles.darkDescription}>
            Your career possibilities will take shape from your
            interests, values, strengths and personal story.
          </Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>
              AI CAREER ANALYSIS · NOT YET GENERATED
            </Text>
          </View>
        </View>

        {/* ROADMAP */}
        <View style={styles.roadmapCard}>
          <Text style={styles.eyebrow}>YOUR FUTURE, IN MOTION</Text>
          <Text style={styles.cardTitle}>12-month roadmap</Text>
          <Text style={styles.mutedText}>
            A personalized plan with learning goals, practical
            projects and career milestones will appear here
            after your career analysis.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>THISAI</Text>
          <Text style={styles.footerText}>
            Your direction. Your decisions. Your future.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F0",
  },
  loading: {
    flex: 1,
    backgroundColor: "#F7F6F0",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    color: "#315C49",
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 21,
    fontWeight: "800",
    color: "#244B3B",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 10,
    color: "#777D73",
    marginTop: 5,
  },
  profileButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#DDE9DC",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#315C49",
  },
  greeting: {
    marginBottom: 30,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "#789080",
    letterSpacing: 2,
    marginBottom: 12,
  },
  heading: {
    fontSize: 39,
    lineHeight: 47,
    fontWeight: "700",
    color: "#263B32",
  },
  headingAccent: {
    color: "#59836B",
  },
  description: {
    color: "#737B73",
    fontSize: 14,
    lineHeight: 23,
    marginTop: 15,
    maxWidth: 310,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 21,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E8EAE2",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#293D33",
  },
  editText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#527C63",
    letterSpacing: 1,
  },
  priorityList: {
    marginTop: 18,
    gap: 11,
  },
  priorityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6F0",
    padding: 13,
    borderRadius: 12,
    gap: 15,
  },
  priorityNumber: {
    color: "#79917E",
    fontSize: 12,
    fontWeight: "700",
  },
  priorityName: {
    color: "#30483A",
    fontSize: 15,
    fontWeight: "600",
  },
  mutedText: {
    fontSize: 13,
    color: "#82877F",
    lineHeight: 21,
    marginTop: 12,
  },
  progressSection: {
    marginBottom: 28,
  },
  progressPercent: {
    color: "#315C49",
    fontSize: 24,
    fontWeight: "700",
  },
  progressTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor: "#E2E8DE",
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: 7,
    borderRadius: 5,
    backgroundColor: "#648D70",
  },
  steps: {
    marginTop: 22,
    gap: 20,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  stepNumber: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#E9EAE2",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberCompleted: {
    backgroundColor: "#D9E8D9",
  },
  stepNumberText: {
    color: "#777E73",
    fontSize: 12,
    fontWeight: "700",
  },
  completedNumberText: {
    color: "#315C49",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#35483D",
  },
  stepDescription: {
    fontSize: 11,
    color: "#858A81",
    marginTop: 4,
  },
  stepStatus: {
    fontSize: 9,
    color: "#66856F",
    fontWeight: "700",
    letterSpacing: 1,
  },
  primaryButton: {
    backgroundColor: "#315C49",
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  darkCard: {
    backgroundColor: "#243D32",
    borderRadius: 21,
    padding: 23,
    marginBottom: 22,
  },
  darkEyebrow: {
    color: "#B4CBB7",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 13,
  },
  darkTitle: {
    fontSize: 27,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  darkDescription: {
    color: "#D0DDD1",
    fontSize: 13,
    lineHeight: 22,
    marginTop: 12,
  },
  comingSoon: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#78917E",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 20,
  },
  comingSoonText: {
    fontSize: 9,
    color: "#D3E1D3",
    letterSpacing: 1,
    fontWeight: "700",
  },
  roadmapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 21,
    borderWidth: 1,
    borderColor: "#E8EAE2",
  },
  footer: {
    alignItems: "center",
    marginTop: 42,
  },
  footerLogo: {
    color: "#315C49",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 3,
  },
  footerText: {
    color: "#93968C",
    fontSize: 11,
    marginTop: 7,
  },
});
