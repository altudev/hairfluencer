import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface HairstyleCardProps {
  id: string;
  name: string;
  rating: number;
  image: string;
  isFavorite: boolean;
  variant?: 'trending' | 'gallery';
  index?: number;
  onPress?: () => void;
  onToggleFavorite?: (id: string) => void;
}

const renderStars = (rating: number, size: number = 10) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Ionicons key={`star-${i}`} name="star" size={size} color="#FFD700" />
    );
  }
  if (hasHalfStar) {
    stars.push(
      <Ionicons key="star-half" name="star-outline" size={size} color="#FFD700" />
    );
  }
  for (let i = stars.length; i < 5; i++) {
    stars.push(
      <Ionicons key={`star-empty-${i}`} name="star-outline" size={size} color="#FFD700" />
    );
  }
  return stars;
};

export const HairstyleCard: React.FC<HairstyleCardProps> = ({
  id,
  name,
  rating,
  image,
  isFavorite,
  variant = 'gallery',
  index = 0,
  onPress,
  onToggleFavorite,
}) => {
  const isTrending = variant === 'trending';

  const cardStyle = isTrending
    ? styles.trendingCard
    : [styles.galleryCard, index % 2 === 1 ? styles.galleryCardRight : {}];

  const imageStyle = isTrending ? styles.trendingImage : styles.galleryImage;
  const gradientStyle = isTrending ? styles.trendingGradient : styles.galleryGradient;
  const contentStyle = isTrending ? styles.trendingContent : styles.galleryContent;
  const titleStyle = isTrending ? styles.trendingTitle : styles.galleryTitle;
  const footerStyle = isTrending ? styles.trendingFooter : styles.galleryFooter;
  const ratingTextStyle = isTrending ? styles.ratingText : styles.galleryRatingText;
  const heartSize = isTrending ? 20 : 18;

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      <Image source={{ uri: image }} style={imageStyle} />
      <LinearGradient
        colors={
          isTrending
            ? ['transparent', 'rgba(0,0,0,0.5)']
            : ['transparent', 'transparent', 'rgba(0,0,0,0.6)']
        }
        style={gradientStyle}
      />
      <View style={contentStyle}>
        <Text style={titleStyle}>{name}</Text>
        <View style={footerStyle}>
          <View style={styles.ratingContainer}>
            <View style={styles.starContainer}>{renderStars(rating)}</View>
            <Text style={ratingTextStyle}>{rating}</Text>
          </View>
          {onToggleFavorite && (
            <TouchableOpacity onPress={() => onToggleFavorite(id)}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={heartSize}
                color={isFavorite ? '#FF6B6B' : '#FFF'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trendingCard: {
    width: 280,
    height: 128,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  galleryCard: {
    width: (width - 48) / 2,
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  galleryCardRight: {
    marginLeft: 16,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  galleryGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  trendingContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  galleryContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 4,
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
  },
  galleryRatingText: {
    fontSize: 11,
    color: '#FFF',
    marginLeft: 4,
  },
});