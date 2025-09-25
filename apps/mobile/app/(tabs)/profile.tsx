import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2 - 8;

interface Template {
  id: string;
  image: any;
  isPro?: boolean;
}

// Template images - using placeholder images
const templates: Template[] = [
  { id: '1', image: require('@/assets/icon.png') },
  { id: '2', image: require('@/assets/icon.png') },
  { id: '3', image: require('@/assets/icon.png') },
  { id: '4', image: require('@/assets/icon.png') },
  { id: '5', image: require('@/assets/icon.png') },
  { id: '6', image: require('@/assets/icon.png'), isPro: true },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [userName, setUserName] = useState('Alex Warren');
  const [userEmail, setUserEmail] = useState('kenzi.lawson@example.com');

  useEffect(() => {
    if (user) {
      setUserName(user.name || user.email?.split('@')[0] || 'Alex Warren');
      setUserEmail(user.email || 'kenzi.lawson@example.com');
    }
  }, [user]);

  const handleTemplatePress = (template: Template) => {
    // Navigate to try-on with template
    router.push({
      pathname: '/upload',
      params: { templateId: template.id }
    });
  };

  const handleSettingsPress = () => {
    router.push('/privacy-settings');
  };

  const handleHistoryPress = () => {
    // Handle history press
    console.log('History pressed');
  };

  const handleEditPress = () => {
    // Handle edit profile press
    console.log('Edit profile pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={['#FFE4E1', '#FFFFFF', '#E6F3FF']}
        style={styles.backgroundGradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <LinearGradient
            colors={['#FFF0F5', '#FFF5EE', '#F0F8FF']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton}>
                {/* Empty for symmetry */}
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={handleSettingsPress}
              >
                <Ionicons name="settings-outline" size={22} color="#666" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={require('@/assets/icon.png')}
                style={styles.avatar}
                contentFit="cover"
              />
              <TouchableOpacity style={styles.avatarEditButton} onPress={handleEditPress}>
                <LinearGradient
                  colors={['#FF8C42', '#FFB366']}
                  style={styles.avatarEditGradient}
                >
                  <Ionicons name="camera" size={14} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleHistoryPress}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#FF8C42" />
                </View>
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEditPress}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#FF8C42" />
                </View>
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/favorites')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="heart-outline" size={20} color="#FF8C42" />
                </View>
                <Text style={styles.actionButtonText}>Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Templates Section */}
          <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Templates</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Templates Grid */}
            <View style={styles.templatesGrid}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  activeOpacity={0.8}
                  onPress={() => handleTemplatePress(template)}
                >
                  <Image
                    source={template.image}
                    style={styles.templateImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.templateGradient}
                  >
                    <View style={styles.tryButton}>
                      {template.isPro && (
                        <MaterialIcons name="star" size={16} color="#FFB366" />
                      )}
                      <Text style={styles.tryText}>Try Now</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pro Banner */}
          <TouchableOpacity activeOpacity={0.9} style={styles.proBannerContainer}>
            <LinearGradient
              colors={['#FF8C42', '#FFB366']}
              style={styles.proBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="star" size={28} color="white" />
              <View style={styles.proBannerText}>
                <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
                <Text style={styles.proBannerSubtitle}>
                  Unlock all templates & features
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ✨ Transform your look with AI-powered styling
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFE4E1',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  avatarEditGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF5F0',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  templatesSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '500',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  proBannerContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  proBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  proBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  proBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});