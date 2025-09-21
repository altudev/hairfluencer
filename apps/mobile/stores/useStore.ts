import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User related types
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}

// Hairstyle related types
interface Hairstyle {
  id: string;
  title: string;
  image: string;
  rating: number;
  category?: string;
}

interface TransformationResult {
  id: string;
  originalImage: string;
  transformedImage: string;
  hairstyleId: string;
  hairstyleName: string;
  createdAt: Date;
}

// App state interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Hairstyle state
  favorites: Set<string>;
  selectedHairstyle: Hairstyle | null;
  recentTransformations: TransformationResult[];

  // UI state
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  // User actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;

  // Hairstyle actions
  toggleFavorite: (hairstyleId: string) => void;
  setSelectedHairstyle: (hairstyle: Hairstyle | null) => void;
  addTransformation: (result: TransformationResult) => void;
  clearTransformations: () => void;

  // UI actions
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

// Create the store with persistence
const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      favorites: new Set(),
      selectedHairstyle: null,
      recentTransformations: [],
      selectedCategory: 'All Styles',
      searchQuery: '',
      isLoading: false,

      // User actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          favorites: new Set(),
          recentTransformations: [],
        }),

      // Hairstyle actions
      toggleFavorite: (hairstyleId) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(hairstyleId)) {
            newFavorites.delete(hairstyleId);
          } else {
            newFavorites.add(hairstyleId);
          }
          return { favorites: newFavorites };
        }),

      setSelectedHairstyle: (hairstyle) =>
        set({ selectedHairstyle: hairstyle }),

      addTransformation: (result) =>
        set((state) => ({
          recentTransformations: [result, ...state.recentTransformations].slice(0, 10), // Keep last 10
        })),

      clearTransformations: () =>
        set({ recentTransformations: [] }),

      // UI actions
      setSelectedCategory: (category) =>
        set({ selectedCategory: category }),

      setSearchQuery: (query) =>
        set({ searchQuery: query }),

      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'hairfluencer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        favorites: Array.from(state.favorites), // Convert Set to Array for storage
        recentTransformations: state.recentTransformations,
        selectedCategory: state.selectedCategory,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert favorites array back to Set after rehydration
        if (state && Array.isArray(state.favorites)) {
          state.favorites = new Set(state.favorites);
        }
      },
    }
  )
);

export default useStore;
export type { User, Hairstyle, TransformationResult, AppState };