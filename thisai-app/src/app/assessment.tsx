
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function AssessmentScreen() {
  return (
    <ImageBackground
      source={require('../../assets/questions-mirror.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar style="light" />

        <Text style={styles.logo}>திசை · THISAI</Text>

        <Text style={styles.step}>
          YOUR JOURNEY · STEP 02
        </Text>

        <Text style={styles.heading}>
          Let's discover{"\n"}who you are.
        </Text>

        <Text style={styles.subtitle}>
          Your interests, personality, strengths and values
          can reveal possibilities you may not have considered.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Your discovery journey
          </Text>

          <Text style={styles.infoText}>
            ✦ Understand your personality
          </Text>

          <Text style={styles.infoText}>
            ✦ Explore your interests
          </Text>

          <Text style={styles.infoText}>
            ✦ Recognize your strengths
          </Text>

          <Text style={styles.infoText}>
            ✦ Discover what matters to you
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/questions')}
        >
          <Text style={styles.buttonText}>
            Begin self-discovery →
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          There is no perfect answer. Be yourself.
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#263126',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 18, 0.38)',
    padding: 25,
    justifyContent: 'center',
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },

  step: {
    color: '#B8E7D1',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginTop: 30,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 46,
  },

  subtitle: {
    color: '#000000',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 15,
  },

  infoCard: {
    backgroundColor: 'rgba(20, 25, 20, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(184, 231, 209, 0.5)',
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
  },

  infoTitle: {
    color: '#B8E7D1',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#B8E7D1',
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 22,
  },

  buttonText: {
    color: '#514568',
    fontSize: 15,
    fontWeight: 'bold',
  },

  footer: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 13,
  },
});
