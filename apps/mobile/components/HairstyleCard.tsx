import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';

const { width } = Dimensions.get('window');

export interface HairstyleData {
  id: string;
  title: string;
  image: any;
  rating: number;
  price?: string;
  category?: string;
}

interface HairstyleCardProps {
  item: HairstyleData;
  variant: 'trending' | 'gallery';
  index?: number;
  isFavorite?: boolean;
  onPress: (id: string, title: string) => void;
  onFavoritePress?: (id: string) => void;
  style?: ViewStyle;
}

const HairstyleCard: React.FC<HairstyleCardProps> = ({
  item,
  variant,
  index = 0,
  isFavorite = false,
  onPress,
  onFavoritePress,
  style,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesome
          key={`star-${i}`}
          name="star"
          size={variant === 'trending' ? 10 : 9}
          color="#FFC107"
        />
      );
    }

    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <FontAwesome
          key="star-half"
          name="star-half-o"
          size={variant === 'trending' ? 10 : 9}
          color="#FFC107"
        />
      );
    }

    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <FontAwesome
          key={`star-empty-${i}`}
          name="star-o"
          size={variant === 'trending' ? 10 : 9}
          color="#FFC107"
        />
      );
    }

    return stars;
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onFavoritePress?.(item.id);
  };

  if (variant === 'trending') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.trendingCard, style]}
        onPress={() => onPress(item.id, item.title)}
      >
        <OptimizedImage
          source={item.image}
          style={styles.trendingImage}
          priority="high"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.trendingGradient}
        >
          <Text style={styles.trendingTitle}>{item.title}</Text>
          <View style={styles.trendingBottom}>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(item.rating)}
              </View>
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            {onFavoritePress && (
              <TouchableOpacity onPress={handleFavoritePress}>
                <FontAwesome
                  name={isFavorite ? 'heart' : 'heart-o'}
                  size={16}
                  color={isFavorite ? '#FF6B6B' : 'white'}
                />
              </TouchableOpacity>
            )}
          </View>
          {item.price && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Gallery variant
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.galleryCard,
        index % 2 === 1 && styles.galleryCardRight,
        style
      ]}
      onPress={() => onPress(item.id, item.title)}
    >
      <OptimizedImage
        source={item.image}
        style={styles.galleryImage}
        priority={index < 4 ? 'normal' : 'low'}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.galleryGradient}
      >
        <Text style={styles.galleryTitle}>{item.title}</Text>
        <View style={styles.galleryBottom}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(item.rating)}
            </View>
            <Text style={styles.galleryRatingText}>{item.rating}</Text>
          </View>
          {onFavoritePress && (
            <TouchableOpacity onPress={handleFavoritePress}>
              <FontAwesome
                name={isFavorite ? 'heart' : 'heart-o'}
                size={14}
                color={isFavorite ? '#FF6B6B' : 'white'}
              />
            </TouchableOpacity>
          )}
        </View>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default HairstyleCard;

const styles = StyleSheet.create({
  // Trending Card Styles
  trendingCard: {
    width: 280,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  trendingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF8C42',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },

  // Gallery Card Styles
  galleryCard: {
    width: (width - 48) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryCardRight: {
    marginLeft: 16,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  galleryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  galleryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryRatingText: {
    fontSize: 11,
    color: 'white',
    marginLeft: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 140, 66, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },

  // Common Styles
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
});