import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { UploadScreenSkeleton } from '@/components/LoadingSkeletons';

const { width, height } = Dimensions.get('window');

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { styleId, styleName } = params as { styleId: string; styleName: string };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to continue.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera to continue.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleContinue = () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    // Navigate to generating screen with params
    setTimeout(() => {
      setIsProcessing(false);
      router.push({
        pathname: '/generating',
        params: {
          styleId,
          styleName,
          imageUri: selectedImage,
        }
      });
    }, 500);
  };

  if (isLoading) {
    return <UploadScreenSkeleton />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f0f23', '#1a1a3e', '#2d1b69']}
        style={styles.gradient}
      >

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Upload Photo</Text>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="help-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Selected Style Info */}
          {styleName && (
            <View style={styles.selectedStyleContainer}>
              <Text style={styles.selectedStyleLabel}>Selected Style:</Text>
              <Text style={styles.selectedStyleName}>{styleName}</Text>
            </View>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Ready for Your Transformation?</Text>
              <Text style={styles.subtitle}>
                Upload a clear photo of your face to see amazing hairstyle suggestions
              </Text>
            </View>

            {!selectedImage ? (
              <View style={styles.uploadArea}>
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload" size={60} color="#FF8C42" />
                  <Text style={styles.uploadTitle}>Choose Your Photo</Text>
                  <Text style={styles.uploadSubtitle}>
                    Tap to select from gallery or take a new photo
                  </Text>
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cameraButton]}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.buttonText}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.galleryButton]}
                    onPress={pickImageFromGallery}
                  >
                    <Ionicons name="images" size={20} color="white" />
                    <Text style={styles.buttonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.previewSection}>
                <View style={styles.previewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={removeImage}
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.previewText}>Perfect! Your photo looks great</Text>
              </View>
            )}


            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedImage && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!selectedImage || isProcessing}
            >
              <LinearGradient
                colors={selectedImage ? ['#ff6b35', '#f7931e'] : ['#666', '#555']}
                style={styles.continueButtonGradient}
              >
                {isProcessing ? (
                  <>
                    <MaterialIcons name="autorenew" size={20} color="white" />
                    <Text style={styles.continueButtonText}>Processing...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.continueButtonText}>Apply the hairstyle</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 20 : 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  selectedStyleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  selectedStyleLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  selectedStyleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF8C42',
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(247, 147, 30, 0.3)',
    borderStyle: 'dashed',
    padding: 30,
    marginBottom: 30,
  },
  uploadIconContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 15,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#FF8C42',
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  previewSection: {
    marginBottom: 30,
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});