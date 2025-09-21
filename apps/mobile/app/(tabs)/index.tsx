import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import useStore from '@/stores/useStore';
import { HomeScreenSkeleton } from '@/components/LoadingSkeletons';
import ImageWithFallback from '@/components/ImageWithFallback';
import OptimizedImage from '@/components/OptimizedImage';
import { hairstyles as localHairstyles, avatarImage } from '@/assets/images/hairstyleData';

const { width } = Dimensions.get('window');

interface HairstyleCard {
  id: string;
  title: string;
  image: any;
  rating: number;
  isFavorite?: boolean;
}

// Map local hairstyles to the format used by the component
const trendingStyles: HairstyleCard[] = localHairstyles
  .filter(h => h.trending)
  .map(h => ({
    id: h.id,
    title: h.name,
    image: h.image,
    rating: h.rating,
    isFavorite: false,
  }));

const galleryStyles: HairstyleCard[] = localHairstyles
  .filter(h => !h.trending)
  .map(h => ({
    id: h.id,
    title: h.name,
    image: h.image,
    rating: h.rating,
    isFavorite: false,
  }));

const categories = ['All Styles', 'Short Hair', 'Long Hair', 'Curly', 'Braids', 'Updos'];

export default function HomeScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isLoading, setIsLoading] = useState(true);

  // Zustand store
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    favorites,
    toggleFavorite,
    setSelectedHairstyle,
  } = useStore();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      // In real app, this would be an API call
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    loadData();
  }, []);


  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesome key={`star-${i}`} name="star" size={10} color="#FFC107" />);
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(<FontAwesome key="star-half" name="star-o" size={10} color="#FFC107" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FontAwesome key={`star-empty-${i}`} name="star-o" size={10} color="#FFC107" />);
    }
    return stars;
  };

  const handleStylePress = (styleId: string, styleName: string) => {
    // Set selected hairstyle in store
    const selectedStyle = [...trendingStyles, ...galleryStyles].find(
      style => style.id === styleId
    );
    if (selectedStyle) {
      setSelectedHairstyle(selectedStyle);
    }

    router.push({
      pathname: '/upload',
      params: { styleId, styleName }
    });
  };

  const renderTrendingCard = ({ item }: { item: HairstyleCard }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.trendingCard}
      onPress={() => handleStylePress(item.id, item.title)}
    >
      <OptimizedImage source={item.image} style={styles.trendingImage} priority="high" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.trendingGradient}
      >
        <Text style={styles.trendingTitle}>{item.title}</Text>
        <View style={styles.trendingBottom}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>{renderStars(item.rating)}</View>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}>
            <FontAwesome
              name={favorites.has(item.id) ? 'heart' : 'heart-o'}
              size={16}
              color={favorites.has(item.id) ? '#FF6B6B' : 'white'}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderGalleryCard = ({ item, index }: { item: HairstyleCard; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.galleryCard, index % 2 === 1 && styles.galleryCardRight]}
      onPress={() => handleStylePress(item.id, item.title)}
    >
      <OptimizedImage
        source={item.image}
        style={styles.galleryImage}
        priority={index < 4 ? "normal" : "low"}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.galleryGradient}
      >
        <Text style={styles.galleryTitle}>{item.title}</Text>
        <View style={styles.galleryBottom}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>{renderStars(item.rating)}</View>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}>
            <FontAwesome
              name={favorites.has(item.id) ? 'heart' : 'heart-o'}
              size={14}
              color={favorites.has(item.id) ? '#FF6B6B' : 'white'}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#FFE4E1', '#FFFFFF', '#E6F3FF']}
        style={styles.backgroundGradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Header */}
          <LinearGradient
            colors={['#FFF0F5', '#FFF5EE', '#F0F8FF']}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#FF8C42', '#FFB366']}
                  style={styles.logoIcon}
                >
                  <MaterialIcons name="content-cut" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.appTitle}>Hairfluencer</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications-outline" size={22} color="#666" />
                </TouchableOpacity>
                <OptimizedImage
                  source={avatarImage}
                  style={styles.avatar}
                  priority="low"
                />
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search hairstyles..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.micButton}>
                <Ionicons name="mic" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Category Pills */}
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryPill,
                    selectedCategory === category && styles.categoryPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Trending Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingStyles}
              renderItem={renderTrendingCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.trendingList}
              getItemLayout={(data, index) => ({
                length: 280,
                offset: 280 * index,
                index,
              })}
              initialNumToRender={2}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>

          {/* Main Gallery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover Your Style</Text>
            <View style={styles.galleryGrid}>
              {galleryStyles.map((item, index) => (
                <View key={item.id} style={styles.galleryItemWrapper}>
                  {renderGalleryCard({ item, index })}
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <LinearGradient
            colors={['#FFF0F5', '#FFF5EE', '#F0F8FF']}
            style={styles.footer}
          >
            <Text style={styles.footerTitle}>✨ Discover your perfect style with Hairfluencer AI ✨</Text>
            <Text style={styles.footerSubtitle}>Your beauty journey starts here</Text>
          </LinearGradient>
        </ScrollView>

        {/* Floating Camera Button */}
        <Animated.View
          style={[
            styles.cameraButton,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#FF8C42', '#FFB366']}
              style={styles.cameraButtonGradient}
            >
              <Ionicons name="camera" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  micButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryPillActive: {
    backgroundColor: '#FF8C42',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  trendingList: {
    gap: 16,
  },
  trendingCard: {
    width: 280,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  trendingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItemWrapper: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  galleryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  galleryCard: {
    width: (width - 48) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  galleryCardRight: {
    marginLeft: 16,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  galleryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  cameraButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
