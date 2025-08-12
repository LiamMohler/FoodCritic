export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profilePhoto?: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  userRatingsTotal?: number;
  priceLevel?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  openNow?: boolean;
  openingHoursJson?: string;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Review {
  id: number;
  user: User;
  restaurant: Restaurant;
  restaurantId: string;
  rating: number;
  comment?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  id: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}