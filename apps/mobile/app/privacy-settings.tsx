import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  checkAllPermissions,
  getPermissionStatusText,
  openPrivacyPolicy,
  openTermsOfService,
  requestCameraPermission,
  requestGalleryPermission,
} from '@/utils/permissions';

interface PermissionStatus {
  camera: string;
  gallery: string;
}

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: 'undetermined',
    gallery: 'undetermined',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await checkAllPermissions();
    setPermissions(status);
  };

  const handleRefreshPermissions = async () => {
    setIsRefreshing(true);
    await checkPermissions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRequestPermission = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      await requestCameraPermission();
    } else {
      await requestGalleryPermission();
    }
    await checkPermissions();
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f0f23', '#1a1a3e', '#2d1b69']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy & Permissions</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshPermissions}
            >
              <Ionicons
                name="refresh"
                size={22}
                color="white"
                style={isRefreshing ? styles.rotating : undefined}
              />
            </TouchableOpacity>
          </View>

          {/* Privacy Notice */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.noticeTitle}>Your Privacy Matters</Text>
            </View>
            <Text style={styles.noticeText}>
              We respect your privacy and only request permissions necessary for app functionality.
              Your data is encrypted and never shared without your consent.
            </Text>
          </View>

          {/* Permissions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Permissions</Text>

            {/* Camera Permission */}
            <View style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <View style={styles.permissionIcon}>
                  <Ionicons name="camera" size={20} color="white" />
                </View>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>Camera</Text>
                  <Text style={styles.permissionStatus}>
                    {getPermissionStatusText(permissions.camera)}
                  </Text>
                </View>
              </View>
              <Text style={styles.permissionDescription}>
                Required to take photos for AI hairstyle transformation
              </Text>
              {permissions.camera !== 'granted' && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => handleRequestPermission('camera')}
                >
                  <Text style={styles.permissionButtonText}>Grant Access</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Gallery Permission */}
            <View style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <View style={styles.permissionIcon}>
                  <Ionicons name="images" size={20} color="white" />
                </View>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>Photo Library</Text>
                  <Text style={styles.permissionStatus}>
                    {getPermissionStatusText(permissions.gallery)}
                  </Text>
                </View>
              </View>
              <Text style={styles.permissionDescription}>
                Required to select photos from your gallery
              </Text>
              {permissions.gallery !== 'granted' && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => handleRequestPermission('gallery')}
                >
                  <Text style={styles.permissionButtonText}>Grant Access</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Data Usage Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Usage</Text>
            <View style={styles.dataCard}>
              <View style={styles.dataItem}>
                <Ionicons name="lock-closed" size={18} color="#FF8C42" />
                <Text style={styles.dataText}>End-to-end encryption for all photos</Text>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="time" size={18} color="#FF8C42" />
                <Text style={styles.dataText}>Temporary processing (deleted after 24h)</Text>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="shield" size={18} color="#FF8C42" />
                <Text style={styles.dataText}>GDPR and CCPA compliant</Text>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="ban" size={18} color="#FF8C42" />
                <Text style={styles.dataText}>No third-party data sharing</Text>
              </View>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={openPrivacyPolicy}
            >
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={18} color="#FF8C42" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={openTermsOfService}
            >
              <Text style={styles.linkText}>Terms of Service</Text>
              <Ionicons name="open-outline" size={18} color="#FF8C42" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleOpenSettings}
            >
              <Text style={styles.linkText}>Device Settings</Text>
              <Ionicons name="settings-outline" size={18} color="#FF8C42" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.footerText}>
              Version {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 20 : 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  noticeCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  permissionStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  permissionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF8C42',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  dataCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
});