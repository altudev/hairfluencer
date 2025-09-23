import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Svg, { Circle } from 'react-native-svg';
import { useApi } from '@/stores/useApi';

interface StatusStep {
  id: number;
  text: string;
  completed: boolean;
  active: boolean;
}

export default function GeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { generateHairstyle } = useApi();

  const { styleId, styleName, imageUri } = params as {
    styleId: string;
    styleName: string;
    imageUri: string;
  };

  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([
    { id: 1, text: 'Photo uploaded successfully', completed: true, active: false },
    { id: 2, text: 'Face detection completed', completed: false, active: true },
    { id: 3, text: 'AI analysis in progress', completed: false, active: false },
    { id: 4, text: 'Generating hairstyles', completed: false, active: false },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Start rotation animation for the progress ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const updateStatusSteps = useCallback((stepIndex: number) => {
    setStatusSteps(prev => prev.map((step, index) => ({
      ...step,
      completed: index < stepIndex,
      active: index === stepIndex,
    })));
  }, []);

  const mockApiCall = useCallback(async () => {
    // Use the API hook to generate hairstyle
    const result = await generateHairstyle(imageUri, styleId, styleName);

    if (result.success) {
      // Navigate to home screen with success message
      router.push({
        pathname: '/(tabs)',
        params: { success: 'true', transformationId: result.data?.id }
      });
    } else {
      // Handle error - navigate back with error message
      router.back();
    }
  }, [generateHairstyle, imageUri, router, styleId, styleName]);

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Mock API success - navigate to results
          setTimeout(() => {
            mockApiCall();
          }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [mockApiCall]);

  useEffect(() => {
    // Update status steps based on progress
    const stepProgress = [25, 50, 75, 100];
    const newStepIndex = stepProgress.findIndex(threshold => progress < threshold);

    if (newStepIndex !== currentStepIndex && newStepIndex >= 0) {
      setCurrentStepIndex(newStepIndex);
      updateStatusSteps(newStepIndex);
    }
  }, [currentStepIndex, progress, updateStatusSteps]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const strokeDashoffset = 283 - (283 * progress) / 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E0C36', '#2C1748']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FF7B2F', '#FF9A63']}
                style={styles.logo}
              >
                <MaterialIcons name="auto-fix-high" size={30} color="white" />
              </LinearGradient>
              <Text style={styles.appName}>Hairfluencer</Text>
              <Text style={styles.tagline}>AI Hair Transformation</Text>
            </View>

            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                Transform your look instantly with{'\n'}AI-powered hairstyle magic
              </Text>
            </View>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressRing,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <View style={styles.ringContainer}>
                <Svg width={128} height={128} viewBox="0 0 100 100">
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#2C1748"
                    strokeWidth="4"
                    fill="none"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#FF7B2F"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarSection}>
            <View style={styles.progressBarHeader}>
              <Text style={styles.progressBarLabel}>
                Processing your transformation
              </Text>
              <Text style={styles.progressBarCount}>
                {Math.floor(progress / 25)}/4
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          {/* Status Steps */}
          <View style={styles.statusSteps}>
            {statusSteps.map((step, index) => (
              <Animated.View
                key={step.id}
                style={[
                  styles.stepItem,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.stepIcon,
                    step.completed && styles.stepIconCompleted,
                    step.active && styles.stepIconActive,
                  ]}
                >
                  {step.completed ? (
                    <Ionicons name="checkmark" size={12} color="white" />
                  ) : step.active ? (
                    <View style={styles.activeIndicator} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    step.completed && styles.stepTextCompleted,
                    step.active && styles.stepTextActive,
                  ]}
                >
                  {step.text}
                </Text>
              </Animated.View>
            ))}
          </View>

          {/* Bottom Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Join 50K+ Happy Users</Text>
              <Text style={styles.statsSubtitle}>
                Experience the magic of AI transformation
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>App Rating</Text>
                <View style={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={10}
                      color="#FFBF00"
                      style={styles.star}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF7B2F' }]}>1M+</Text>
                <Text style={styles.statLabel}>Transformations</Text>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="auto-fix-high" size={12} color="#FF7B2F" />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 40 : 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 18,
    color: '#D0C5E4',
    fontWeight: '500',
  },
  subtitleContainer: {
    paddingHorizontal: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#D0C5E4',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressRing: {
    width: 128,
    height: 128,
  },
  ringContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  progressBarSection: {
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressBarLabel: {
    fontSize: 14,
    color: '#D0C5E4',
    fontWeight: '500',
  },
  progressBarCount: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#2C1748',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FF7B2F',
  },
  statusSteps: {
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D0C5E4',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCompleted: {
    backgroundColor: '#FF7B2F',
    borderColor: '#FF7B2F',
  },
  stepIconActive: {
    borderColor: '#FF7B2F',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0C5E4',
  },
  stepText: {
    fontSize: 16,
    color: '#D0C5E4',
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: 'white',
  },
  stepTextActive: {
    color: 'white',
  },
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#D0C5E4',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFBF00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#D0C5E4',
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 1,
  },
  iconContainer: {
    marginTop: 4,
  },
});
