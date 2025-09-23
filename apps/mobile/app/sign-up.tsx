import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { VALIDATION } from '@/constants';
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

    const minPasswordLength = VALIDATION.MIN_PASSWORD_LENGTH;

    if (password.length < minPasswordLength) {
      showErrorAlert(new Error(`Password must be at least ${minPasswordLength} characters.`));
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
        colors={['#FFE4E1', '#FFFFFF', '#E6F3FF']}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#4A2C83" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <LinearGradient
              colors={['#FF8C42', '#FFB366']}
              style={styles.logoIcon}
            >
              <MaterialIcons name="content-cut" size={26} color="white" />
            </LinearGradient>
            <Text style={styles.appTitle}>Hairfluencer</Text>
            <Text style={styles.appSubtitle}>Create your account to start styling</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign Up</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
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
                <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <Text style={styles.helperText}>Must be at least {VALIDATION.MIN_PASSWORD_LENGTH} characters</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor="#9CA3AF"
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
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimerText}>
              By creating an account you agree to our <Text style={styles.highlightedText}>Terms of Service</Text> and <Text style={styles.highlightedText}>Privacy Policy</Text>.
            </Text>

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
        </ScrollView>

        {isLoading && (
          <View style={styles.sessionSyncBanner}>
            <ActivityIndicator color="#4A2C83" size="small" />
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
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: Platform.OS === 'android' ? 56 : 32,
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 44, 131, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74, 44, 131, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
  },
  formCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimerText: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  highlightedText: {
    color: '#FF8C42',
    fontWeight: '600',
  },
  secondaryAction: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  secondaryActionHighlight: {
    color: '#FF8C42',
    fontWeight: '600',
  },
  sessionSyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: Platform.OS === 'android' ? 24 : 32,
  },
  sessionSyncText: {
    fontSize: 13,
    color: '#4A2C83',
    marginLeft: 10,
  },
});
