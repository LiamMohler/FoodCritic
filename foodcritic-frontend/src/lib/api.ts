import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, Restaurant, Review, User, ReviewRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url || '';
  
  // Define public endpoints that don't need authentication
  const isPublicEndpoint = (url.includes('/restaurants') && 
                          (config.method?.toUpperCase() === 'GET' || !config.method) &&
                          !url.includes('/reviews')) ||
                          url.includes('/reviews/recent') ||
                          url.includes('/auth/');
  
  // Only add auth header for non-public endpoints or if explicitly needed
  if (token && !isPublicEndpoint) {
    // Only set the Authorization header if it's not already set
    if (!config.headers['Authorization']) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    
    // Skip logging 404 errors for the my-review endpoint
    if (error.response?.status === 404 && url.includes('/reviews/my-review')) {
      return Promise.reject(new Error('REVIEW_NOT_FOUND'));
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only handle auth errors if there was a token and it's NOT a public endpoint
      const token = localStorage.getItem('token');
      
      // Define endpoints that should trigger logout on 401/403
      const isUserSpecificEndpoint = url.includes('/users/profile') || 
                                     url.includes('/users/my-reviews') || 
                                     url.includes('/users/') ||
                                     (url.includes('/reviews') && error.config?.method?.toUpperCase() !== 'GET') ||
                                     url.includes('/upload/');
      
      // Only logout if user was authenticated and it's a user-specific endpoint
      if (token && isUserSpecificEndpoint) {
        console.warn('Authentication expired, dispatching auth-expired event for:', url);
        // Dispatch event to let AuthContext handle cleanup
        window.dispatchEvent(new CustomEvent('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Restaurant API
export const restaurantApi = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants');
    return response.data;
  },

  getById: async (id: string): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  }
};

// Review API
export const reviewApi = {
  getByRestaurant: async (restaurantId: string): Promise<Review[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/reviews`);
    return response.data;
  },

  create: async (restaurantId: string, review: ReviewRequest): Promise<Review> => {
    const response = await api.post(`/restaurants/${restaurantId}/reviews`, {
      rating: review.rating,
      comment: review.comment || undefined
    });
    return response.data;
  },

  update: async (restaurantId: string, reviewId: number, review: ReviewRequest): Promise<Review> => {
    const response = await api.put(`/restaurants/${restaurantId}/reviews/${reviewId}`, {
      rating: review.rating,
      comment: review.comment || undefined
    });
    return response.data;
  },

  delete: async (restaurantId: string, reviewId: number): Promise<void> => {
    await api.delete(`/restaurants/${restaurantId}/reviews/${reviewId}`);
  },

  getUserReview: async (restaurantId: string): Promise<Review> => {
    const response = await api.get(`/restaurants/${restaurantId}/reviews/my-review`);
    return response.data;
  },

  getAllRecent: async (limit?: number): Promise<Review[]> => {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await api.get('/reviews/recent', { params });
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get('/users/my-reviews');
    return response.data;
  },

  updateProfilePhoto: async (photoUrl: string): Promise<User> => {
    const response = await api.put('/users/profile/photo', { photoUrl });
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ filename: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Google Places API
export interface GooglePlacesSearchRequest {
  latitude: number;
  longitude: number;
  query?: string;
  radius?: number;
  type?: string;
  minRating?: number;
  maxPriceLevel?: number;
  minPriceLevel?: number;
  cuisine?: string;
  pageToken?: string;
}

export interface GooglePlacesSearchResponse {
  results: GooglePlaceResult[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetails;
  status: string;
  error_message?: string;
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekday_text?: string[];
  };
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
}

export interface GooglePlacesSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GooglePlacesSuggestionsResponse {
  predictions: GooglePlacesSuggestion[];
  status: string;
  error_message?: string;
}

export interface GooglePlacesSuggestionsRequest {
  input: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  types?: string;
}

export const googlePlacesApi = {
  searchRestaurants: async (request: GooglePlacesSearchRequest): Promise<GooglePlacesSearchResponse> => {
    const response = await api.post('/google-places/search', request);
    return response.data;
  },

  getRestaurantDetails: async (placeId: string): Promise<GooglePlaceDetailsResponse> => {
    const response = await api.get(`/google-places/details/${placeId}`);
    return response.data;
  },

  getPhotoUrl: async (photoReference: string, maxWidth: number = 400): Promise<string> => {
    const response = await api.get(`/google-places/photo?photoReference=${photoReference}&maxWidth=${maxWidth}`);
    return response.data;
  },

  getSuggestions: async (request: GooglePlacesSuggestionsRequest): Promise<GooglePlacesSuggestionsResponse> => {
    const response = await api.post('/google-places/suggestions', request);
    return response.data;
  },
};