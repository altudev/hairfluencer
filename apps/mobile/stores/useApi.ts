import useStore from './useStore';
import {
  logError,
  showErrorAlert,
  showSuccessAlert,
} from '@/utils/errorHandler';
import { SUCCESS_MESSAGES } from '@/constants';
import { authClient } from '@/lib/auth-client';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Mock API functions for now - will be replaced with real API calls
export const useApi = () => {
  const { setLoading, addTransformation } = useStore();

  const uploadImage = async (imageUri: string): Promise<string> => {
    // Mock upload - in real app, would upload to server
    return imageUri;
  };

  const generateHairstyle = async (
    imageUri: string,
    styleId: string,
    styleName: string
  ): Promise<ApiResponse<any>> => {
    setLoading(true);

    try {
      // Mock API delay for now
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful transformation
      const result = {
        id: Date.now().toString(),
        originalImage: imageUri,
        transformedImage: imageUri, // In real app, this would be the AI-generated image
        hairstyleId: styleId,
        hairstyleName: styleName,
        createdAt: new Date(),
      };

      // Store transformation result
      addTransformation(result);
      showSuccessAlert(SUCCESS_MESSAGES.TRANSFORMATION_COMPLETE);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logError(error, 'generateHairstyle');
      showErrorAlert(error);
      return {
        success: false,
        error: 'Failed to generate hairstyle',
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse<any>> => {
    setLoading(true);

    try {
      const data = await authClient.signIn.email({
        email,
        password,
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      logError(error, 'login');
      showErrorAlert(error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name?: string
  ): Promise<ApiResponse<any>> => {
    setLoading(true);

    try {
      const data = await authClient.signUp.email({
        email,
        password,
        name,
      });
      showSuccessAlert('Account created successfully!');
      return {
        success: true,
        data,
      };
    } catch (error) {
      logError(error, 'signup');
      showErrorAlert(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authClient.signOut();
    } catch (error) {
      logError(error, 'logout');
      // Don't show error for logout - just log it
    }
  };

  return {
    uploadImage,
    generateHairstyle,
    login,
    signup,
    logout,
  };
};

export default useApi;
