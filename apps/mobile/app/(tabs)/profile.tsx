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
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

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
      pathname: '/(tabs)',
      params: { templateId: template.id }
    });
  };

  const handleSettingsPress = () => {
    // Handle settings press
    console.log('Settings pressed');
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background ellipses */}
      <View style={styles.ellipse1} />
      <View style={styles.ellipse2} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <BlurView intensity={20} tint="dark" style={styles.profileCardInner}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={require('@/assets/icon.png')}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>

          {/* History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleHistoryPress}
          >
            <Ionicons name="time-outline" size={20} color="white" />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPress}
          >
            <Ionicons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Templates Section */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.templatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Templates</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Templates Grid */}
          <View style={styles.templatesGrid}>
            {templates.map((template, index) => (
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
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.templateGradient}
                >
                  <TouchableOpacity
                    style={[
                      styles.tryButton,
                      template.isPro && styles.tryButtonPro
                    ]}
                  >
                    {template.isPro && (
                      <Ionicons name="star" size={18} color="white" style={styles.proIcon} />
                    )}
                    <Ionicons name="play-circle-outline" size={18} color="white" />
                    <Text style={styles.tryText}>Try</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00020a',
  },
  ellipse1: {
    position: 'absolute',
    top: -87,
    left: -169,
    width: 417,
    height: 363,
    borderRadius: 200,
    backgroundColor: 'rgba(106, 90, 224, 0.3)',
    transform: [{ scaleX: 1.2 }],
  },
  ellipse2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 304,
    height: 325,
    borderRadius: 200,
    backgroundColor: 'rgba(106, 90, 224, 0.2)',
    transform: [{ scaleX: 1.2 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    marginTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
  },
  headerLeft: {
    width: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 22,
  },
  profileCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 32,
    position: 'relative',
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DFE2E6',
    borderWidth: 1.9,
    borderColor: '#F5F6F7',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    marginTop: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  historyButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  templatesSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 16,
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
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 18,
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 8,
    backdropFilter: 'blur(34px)',
  },
  tryButtonPro: {
    backgroundColor: 'rgba(61, 60, 65, 0.9)',
  },
  proIcon: {
    marginRight: -4,
  },
  tryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});