import useStore from './useStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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
      // Mock API delay
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

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Generation error:', error);
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
      // Mock API call
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Invalid email or password',
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
      // Mock API call
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Failed to create account',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
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