import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { HairstyleCard } from '@/components/hairstyle-card';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Sample data for hairstyles
const trendingStyles = [
  {
    id: '1',
    name: 'Pixie Perfection',
    rating: 4.8,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/be64cd2931-947e9871d4c77c2507b6.png',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Beach Waves',
    rating: 4.6,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2beb6a10f5-a3d954e519944b9a2e0e.png',
    isFavorite: false,
  },
];

const galleryStyles = [
  {
    id: '3',
    name: 'Classic Bob',
    rating: 4.9,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/caf64ff634-85b3d6d14184ab5b5420.png',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Messy Bun',
    rating: 4.7,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f19fbec6a2-a8286716688b1efc3e0d.png',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'French Braid',
    rating: 4.8,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/fdc4d1163d-f845c06cbf8e6d217cdc.png',
    isFavorite: false,
  },
  {
    id: '6',
    name: 'Layered Cut',
    rating: 4.5,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/34dec0899e-0ae9c003e72f0c865ff8.png',
    isFavorite: false,
  },
  {
    id: '7',
    name: 'Natural Afro',
    rating: 4.9,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/721e0d9859-38395ace31b83273673e.png',
    isFavorite: true,
  },
  {
    id: '8',
    name: 'High Ponytail',
    rating: 4.6,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7b3ed9f120-e8f99aadc54ffacd9a94.png',
    isFavorite: false,
  },
  {
    id: '9',
    name: 'Modern Shag',
    rating: 4.8,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/95fc1f0ab0-83aa427db37050c868f3.png',
    isFavorite: false,
  },
  {
    id: '10',
    name: 'Top Knot',
    rating: 4.4,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/6a01180e69-6cf9671b72cb85de0a7b.png',
    isFavorite: true,
  },
];

const categories = ['All Styles', 'Short Hair', 'Long Hair', 'Curly', 'Braids', 'Updos'];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All Styles');
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['7', '10']);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleCameraPress = () => {
    // Navigate to camera/upload screen
    console.log('Camera button pressed');
    // router.push('/camera');
  };

  const handleStylePress = (styleId: string) => {
    console.log('Style selected:', styleId);
    // router.push(`/style/${styleId}`);
  };

  const renderTrendingItem = ({ item }: { item: typeof trendingStyles[0] }) => (
    <HairstyleCard
      {...item}
      isFavorite={favorites.includes(item.id)}
      variant="trending"
      onPress={() => handleStylePress(item.id)}
      onToggleFavorite={toggleFavorite}
    />
  );

  const renderGalleryItem = ({ item, index }: { item: typeof galleryStyles[0], index: number }) => (
    <HairstyleCard
      {...item}
      isFavorite={favorites.includes(item.id)}
      variant="gallery"
      index={index}
      onPress={() => handleStylePress(item.id)}
      onToggleFavorite={toggleFavorite}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFE4E1', '#FFFFFF', '#E6F3FF']}
        style={styles.backgroundGradient}
      />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Header */}
        <LinearGradient
          colors={['#FFF0F5', '#FFF5E6', '#F0F8FF']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#FF8C42', '#FFB366']}
                style={styles.logoContainer}
              >
                <Ionicons name="cut" size={20} color="#FFF" />
              </LinearGradient>
              <Text style={styles.appName}>Hairfluencer</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color="#666" />
              </TouchableOpacity>
              <Image
                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' }}
                style={styles.profileImage}
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
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.micButton}>
              <LinearGradient
                colors={['#FF8C42', '#FFB366']}
                style={styles.micButtonGradient}
              >
                <Ionicons name="mic" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            renderItem={renderTrendingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.trendingList}
          />
        </View>

        {/* Main Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Your Style</Text>
          <FlatList
            data={galleryStyles}
            renderItem={renderGalleryItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.galleryRow}
            scrollEnabled={false}
          />
        </View>

        {/* Footer */}
        <LinearGradient
          colors={['#FFF0F5', '#FFF5E6', '#F0F8FF']}
          style={styles.footer}
        >
          <Text style={styles.footerTitle}>✨ Discover your perfect style with Hairfluencer ✨</Text>
          <Text style={styles.footerSubtitle}>Your beauty journey starts here</Text>
        </LinearGradient>
      </ScrollView>

      {/* Floating Camera Button */}
      <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8} onPress={handleCameraPress}>
        <LinearGradient
          colors={['#FF8C42', '#FFB366']}
          style={styles.cameraButtonGradient}
        >
          <Ionicons name="camera" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
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
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  micButton: {
    marginLeft: 8,
  },
  micButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
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
    color: '#FFF',
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
    paddingRight: 16,
  },
  galleryRow: {
    justifyContent: 'space-between',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 80,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});