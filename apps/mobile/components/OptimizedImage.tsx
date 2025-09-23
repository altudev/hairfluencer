import React, { useState, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState(showLoading);
  const [hasError, setHasError] = useState(false);

  const containerStyle = useMemo(() => StyleSheet.flatten([styles.container, style]), [style]);
  const imageStyle = useMemo(() => StyleSheet.flatten([StyleSheet.absoluteFillObject, style]), [style]);

  return (
    <View style={containerStyle}>
      {!hasError && (
        <Image
          {...props}
          source={source}
          style={imageStyle}
          placeholder={placeholder || defaultBlurhash}
          contentFit="cover"
          transition={transition}
          cachePolicy={cachePolicy}
          priority={priority}
          recyclingKey={typeof source === 'object' && 'uri' in source ? source.uri : undefined}
          onLoadStart={() => showLoading && setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(error) => {
            setHasError(true);
            setIsLoading(false);
            console.log('Image loading error:', error);
          }}
        />
      )}

      {showLoading && isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="white" />
        </View>
      )}

      {hasError && (
        <View style={styles.errorFallback}>
          <Ionicons name={fallbackIcon} size={24} color="rgba(255, 255, 255, 0.7)" />
        </View>
      )}
    </View>
  );
};

export default OptimizedImage;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorFallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
