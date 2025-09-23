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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { showErrorAlert, showSuccessAlert } from '@/utils/errorHandler';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    if (!email || !password) {
      showErrorAlert(new Error('Please enter your email and password'));
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn.email({
        email,
        password,
      });
      showSuccessAlert('Welcome back to Hairfluencer!');
      router.replace('/');
    } catch (error) {
      showErrorAlert(error, 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableSubmit = isSubmitting || !email || !password;

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleForgotPassword = () => {
    showErrorAlert(new Error('Password reset is coming soon.'));
  };

  const handleGoogleSignIn = () => {
    showErrorAlert(new Error('Google sign-in is not available yet.'));
  };

  const handleAppleSignIn = () => {
    showErrorAlert(new Error('Apple sign-in is not available yet.'));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#FFE4E1', '#FFFFFF', '#E6F3FF']} style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#FFE4E1', '#FFF5EE', '#E6F3FF']}
            style={styles.hero}
          >
            <View style={styles.heroHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#4A2C83" />
              </TouchableOpacity>
            </View>
            <View style={styles.heroIconWrapper}>
              <LinearGradient
                colors={['#FF8C42', '#FFB366']}
                style={styles.heroIcon}
              >
                <Ionicons name="cut-outline" size={24} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Hairfluencer</Text>
            <Text style={styles.heroSubtitle}>Welcome back to your beauty journey</Text>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.fieldInputWrapper}>
                <Ionicons name="mail" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.fieldInputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                  onPress={handleTogglePasswordVisibility}
                  style={styles.toggleButton}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, disableSubmit && styles.primaryButtonDisabled]}
              activeOpacity={0.9}
              onPress={handleSubmit}
              disabled={disableSubmit}
            >
              <LinearGradient
                colors={['#FF8C42', '#FFB366']}
                style={styles.primaryButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-google" size={18} color="#ea4335" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-apple" size={20} color="#ffffff" />
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/sign-up')}
            >
              <Text style={styles.secondaryActionText}>
                Don't have an account?{' '}
                <Text style={styles.secondaryActionHighlight}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.sessionSyncBanner}>
            <ActivityIndicator color="#4A2C83" size="small" />
            <Text style={styles.sessionSyncText}>Restoring your session…</Text>
          </View>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4E1',
  },
  background: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    marginHorizontal: 24,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heroIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  card: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    gap: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1f2937',
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  fieldInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  toggleButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF8C42',
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  secondaryAction: {
    alignSelf: 'center',
    marginTop: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  secondaryActionHighlight: {
    color: '#FF8C42',
    fontWeight: '600',
  },
  sessionSyncBanner: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  sessionSyncText: {
    fontSize: 13,
    color: '#4A2C83',
  },
});
