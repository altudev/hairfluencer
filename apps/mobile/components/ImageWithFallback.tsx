import React, { useState } from 'react';
import {
  Image,
  ImageProps,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageWithFallbackProps extends ImageProps {
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackText?: string;
  showLoading?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  style,
  fallbackIcon = 'image',
  fallbackText = 'Image unavailable',
  showLoading = true,
  onError,
  onLoad,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = (error: any) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  if (hasError) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Ionicons name={fallbackIcon} size={40} color="rgba(255, 255, 255, 0.3)" />
        <Text style={styles.fallbackText}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        {...props}
        source={source}
        style={[style, { position: 'absolute' }]}
        onError={handleError}
        onLoad={handleLoad}
      />
      {showLoading && isLoading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color="#FF8C42" />
        </View>
      )}
    </View>
  );
};

export default ImageWithFallback;

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});