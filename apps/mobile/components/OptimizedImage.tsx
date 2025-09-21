import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageProps['source'];
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  showLoading?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  fallbackIcon = 'image',
  showLoading = false,
  priority = 'normal',
  placeholder,
  transition = 200,
  cachePolicy = 'memory-disk',
  ...props
}) => {
  // Blurhash placeholders for better perceived performance
  const defaultBlurhash = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';

  return (
    <Image
      {...props}
      source={source}
      style={style}
      placeholder={placeholder || defaultBlurhash}
      contentFit="cover"
      transition={transition}
      cachePolicy={cachePolicy}
      priority={priority}
      recyclingKey={typeof source === 'object' && 'uri' in source ? source.uri : undefined}
      onError={(error) => {
        console.log('Image loading error:', error);
      }}
    />
  );
};

export default OptimizedImage;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});