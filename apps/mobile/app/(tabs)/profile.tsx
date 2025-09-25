import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/useAuth';
import useStore from '@/stores/useStore';
import { authClient } from '@/lib/auth-client';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Template {
  id: string;
  image: string;
  title: string;
  isNew?: boolean;
}

const templates: Template[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    title: 'Neon Vibes',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    title: 'Blue Dreams',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    title: 'Street Style',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    title: 'Glamour',
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const { recentTransformations, logout: storeLogout } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    authLogout();
    storeLogout();
    router.replace('/sign-in');
  };

  const handleSettingsPress = () => {
    setShowSettings(!showSettings);
  };

  const menuItems = [
    {
      id: 'history',
      label: 'History',
      icon: 'time-outline' as const,
      onPress: () => console.log('History'),
    },
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: 'create-outline' as const,
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: 'privacy',
      label: 'Privacy Settings',
      icon: 'shield-checkmark-outline' as const,
      onPress: () => router.push('/privacy-settings'),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: () => console.log('Help'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: 'log-out-outline' as const,
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  const renderTemplate = ({ item }: { item: Template }) => (
    <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.templateImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.templateGradient}
      >
        <TouchableOpacity style={styles.tryButton}>
          <Feather name="play-circle" size={20} color="white" />
          <Text style={styles.tryText}>Try</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const displayName = user?.name || user?.email?.split('@')[0] || 'Guest User';
  const displayEmail = user?.email || 'guest@hairfluencer.app';
  const avatarUrl = user?.image || `https://ui-avatars.com/api/?name=${displayName}&background=6B46C1&color=fff`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#6B46C1', '#342671', '#1A1A2E']}
        style={styles.backgroundGradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileSection}>
            <BlurView intensity={20} tint="dark" style={styles.profileCard}>
              {/* Settings Menu Dropdown */}
              {showSettings && (
                <View style={styles.settingsMenu}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.menuItem,
                        index === menuItems.length - 1 && styles.menuItemLast,
                      ]}
                      onPress={item.onPress}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.isDestructive ? '#FF6B6B' : '#fff'}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          item.isDestructive && styles.menuItemTextDestructive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Avatar and Info */}
              <TouchableOpacity style={styles.avatarContainer}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.avatarBadge}>
                  <Ionicons name="camera" size={14} color="white" />
                </View>
              </TouchableOpacity>

              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </BlurView>
          </View>

          {/* Templates Section */}
          <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Templates</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.templatesGrid}>
              {templates.map((template) => (
                <View key={template.id} style={styles.templateWrapper}>
                  {renderTemplate({ item: template })}
                </View>
              ))}
            </View>
          </View>

          {/* Recent Transformations */}
          {recentTransformations.length > 0 && (
            <View style={styles.templatesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentScroll}
              >
                {recentTransformations.slice(0, 4).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentCard}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.transformedImage }}
                      style={styles.recentImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {recentTransformations.length}
              </Text>
              <Text style={styles.statLabel}>Styles Tried</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {useStore.getState().favorites.size}
              </Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
          </View>

          {/* Pro Banner */}
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={['#FFB366', '#FF8C42']}
              style={styles.proBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.proBannerContent}>
                <MaterialIcons name="star" size={24} color="white" />
                <View style={styles.proBannerText}>
                  <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
                  <Text style={styles.proBannerSubtitle}>
                    Unlock all styles & features
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'visible',
  },
  settingsMenu: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: 'rgba(30,30,40,0.98)',
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  menuItemTextDestructive: {
    color: '#FF6B6B',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  templatesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  templateCard: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  templateImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  templateGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentScroll: {
    paddingRight: 20,
    gap: 12,
  },
  recentCard: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  recentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  proBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  proBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  proBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});