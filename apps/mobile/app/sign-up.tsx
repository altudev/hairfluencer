import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { showErrorAlert, showSuccessAlert } from '@/utils/errorHandler';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isAuthenticated, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showErrorAlert(new Error('Please complete all fields to create your account.'));
      return;
    }

    if (password !== confirmPassword) {
      showErrorAlert(new Error('Passwords do not match. Please re-enter them.'));
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp.email({
        email,
        password,
        name,
      });
      showSuccessAlert('Account created! You are now signed in.');
      router.replace('/');
    } catch (error) {
      showErrorAlert(error, 'Unable to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableSubmit = isSubmitting || !name || !email || !password || !confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a3e', '#2d1b69']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={18} color="#FF8C42" />
            <Text style={styles.badgeText}>Unlock premium try-ons and save your favorites</Text>
          </View>

          <Text style={styles.title}>Join Hairfluencer</Text>
          <Text style={styles.subtitle}>Sign up in seconds to start exploring your next hairstyle.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={18} color="rgba(255, 255, 255, 0.6)" />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={18} color="rgba(255, 255, 255, 0.6)" />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={18} color="rgba(255, 255, 255, 0.6)" />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={18} color="rgba(255, 255, 255, 0.6)" />
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, disableSubmit && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={disableSubmit}
          >
            <LinearGradient
              colors={['#FF8C42', '#FFB366']}
              style={styles.submitButtonGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="white" />
                  <Text style={styles.submitButtonText}>Create Account</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.replace('/sign-in')}
          >
            <Text style={styles.secondaryActionText}>
              Already have an account?{' '}
              <Text style={styles.secondaryActionHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.sessionSyncBanner}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.sessionSyncText}>Checking your session…</Text>
          </View>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryAction: {
    alignSelf: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  secondaryActionHighlight: {
    color: '#FFB366',
    fontWeight: '600',
  },
  sessionSyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sessionSyncText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
