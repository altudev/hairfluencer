import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Base Skeleton component with shimmer animation
const Skeleton: React.FC<SkeletonProps> = ({
  width: customWidth = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        {
          width: customWidth,
          height,
          borderRadius,
          backgroundColor: '#E1E1E1',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#E1E1E1', '#F2F2F2', '#E1E1E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// Skeleton for trending cards
export const TrendingCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.trendingCard}>
    <Skeleton width={280} height={140} borderRadius={16} />
    <View style={skeletonStyles.trendingCardContent}>
      <Skeleton width={150} height={16} borderRadius={4} />
      <View style={skeletonStyles.trendingCardBottom}>
        <Skeleton width={80} height={12} borderRadius={4} />
        <Skeleton width={30} height={30} borderRadius={15} />
      </View>
    </View>
  </View>
);

// Skeleton for gallery cards
export const GalleryCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.galleryCard}>
    <Skeleton width={(width - 48) / 2} height={200} borderRadius={16} />
  </View>
);

// Skeleton for category pills
export const CategoryPillSkeleton: React.FC = () => (
  <View style={skeletonStyles.categoryPill}>
    <Skeleton width={80} height={40} borderRadius={20} />
  </View>
);

// Full home screen skeleton
export const HomeScreenSkeleton: React.FC = () => (
  <View style={skeletonStyles.container}>
    {/* Header Skeleton */}
    <View style={skeletonStyles.header}>
      <View style={skeletonStyles.headerTop}>
        <View style={skeletonStyles.logoSection}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={100} height={24} borderRadius={4} style={{ marginLeft: 12 }} />
        </View>
        <View style={skeletonStyles.headerActions}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginLeft: 12 }} />
        </View>
      </View>
      <Skeleton width="100%" height={50} borderRadius={25} style={{ marginTop: 16 }} />
    </View>

    {/* Categories Skeleton */}
    <View style={skeletonStyles.categoriesContainer}>
      <View style={skeletonStyles.categoriesList}>
        {[1, 2, 3, 4, 5].map((i) => (
          <CategoryPillSkeleton key={i} />
        ))}
      </View>
    </View>

    {/* Trending Section Skeleton */}
    <View style={skeletonStyles.section}>
      <Skeleton width={120} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
      <View style={skeletonStyles.trendingList}>
        {[1, 2].map((i) => (
          <TrendingCardSkeleton key={i} />
        ))}
      </View>
    </View>

    {/* Gallery Section Skeleton */}
    <View style={skeletonStyles.section}>
      <Skeleton width={150} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
      <View style={skeletonStyles.galleryGrid}>
        {[1, 2, 3, 4].map((i) => (
          <GalleryCardSkeleton key={i} />
        ))}
      </View>
    </View>
  </View>
);

// Upload screen skeleton
export const UploadScreenSkeleton: React.FC = () => (
  <View style={skeletonStyles.uploadContainer}>
    <View style={skeletonStyles.uploadHeader}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <Skeleton width={120} height={24} borderRadius={4} />
      <Skeleton width={40} height={40} borderRadius={20} />
    </View>

    <View style={skeletonStyles.uploadContent}>
      <Skeleton width={200} height={28} borderRadius={4} style={{ alignSelf: 'center' }} />
      <Skeleton width="100%" height={16} borderRadius={4} style={{ marginTop: 12 }} />

      <View style={skeletonStyles.uploadArea}>
        <Skeleton width={80} height={80} borderRadius={40} style={{ alignSelf: 'center' }} />
        <Skeleton width={180} height={20} borderRadius={4} style={{ alignSelf: 'center', marginTop: 16 }} />
        <Skeleton width={240} height={14} borderRadius={4} style={{ alignSelf: 'center', marginTop: 8 }} />

        <View style={skeletonStyles.uploadButtons}>
          <Skeleton width={100} height={44} borderRadius={12} />
          <Skeleton width={100} height={44} borderRadius={12} />
        </View>
      </View>

      <Skeleton width="100%" height={56} borderRadius={16} style={{ marginTop: 20 }} />
    </View>
  </View>
);

// Generating screen skeleton (for initial load)
export const GeneratingScreenSkeleton: React.FC = () => (
  <View style={skeletonStyles.generatingContainer}>
    <View style={skeletonStyles.generatingHeader}>
      <Skeleton width={80} height={80} borderRadius={16} style={{ alignSelf: 'center' }} />
      <Skeleton width={150} height={32} borderRadius={4} style={{ alignSelf: 'center', marginTop: 16 }} />
      <Skeleton width={200} height={20} borderRadius={4} style={{ alignSelf: 'center', marginTop: 8 }} />
    </View>

    <Skeleton width={128} height={128} borderRadius={64} style={{ alignSelf: 'center', marginTop: 40 }} />

    <View style={skeletonStyles.progressSection}>
      <Skeleton width="100%" height={8} borderRadius={4} />
    </View>

    <View style={skeletonStyles.statusSteps}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={skeletonStyles.stepItem}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <Skeleton width={200} height={16} borderRadius={4} style={{ marginLeft: 16 }} />
        </View>
      ))}
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryPill: {
    marginRight: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  trendingList: {
    flexDirection: 'row',
    gap: 16,
  },
  trendingCard: {
    marginRight: 16,
  },
  trendingCardContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  trendingCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryCard: {
    marginBottom: 16,
  },
  uploadContainer: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    padding: 20,
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadContent: {
    flex: 1,
  },
  uploadArea: {
    marginTop: 30,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 25,
  },
  generatingContainer: {
    flex: 1,
    backgroundColor: '#1E0C36',
    padding: 20,
  },
  generatingHeader: {
    marginTop: 40,
  },
  progressSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  statusSteps: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default Skeleton;