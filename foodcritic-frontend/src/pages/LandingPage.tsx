import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { googlePlacesApi, type GooglePlacesSearchRequest, type GooglePlaceResult } from '../lib/api';
import { locationService, type LocationCoords } from '../services/locationService';
import type { Restaurant } from '../types';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredRestaurants, setFeaturedRestaurants] = useState<GooglePlaceResult[]>([]);
  const [location, setLocation] = useState<LocationCoords>(locationService.getDefaultLocation());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get current location, fallback to default
        try {
          const coords = await locationService.getCurrentPosition();
          setLocation(coords);
        } catch (error) {
          console.error('Error getting location:', error);
          // Use default location
        }
        
        // Search for top-rated restaurants
        const searchRequest: GooglePlacesSearchRequest = {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000,
          type: 'restaurant',
          minRating: 4.0, // Only show restaurants with 4+ stars
        };
        
        const response = await googlePlacesApi.searchRestaurants(searchRequest);
        
        if (response.status === 'OK') {
          // Sort by rating and take top 3
          const topRated = response.results
            .filter(restaurant => restaurant.rating && restaurant.rating >= 4.0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);
          
          setFeaturedRestaurants(topRated);
        } else {
          console.error('Search failed:', response);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.latitude, location.longitude]);

  const renderPriceLevel = (level?: number) => {
    if (!level) return 'N/A';
    return '$'.repeat(level);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIconSolid
              key={star}
              className={`h-4 w-4 ${
                star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Food Review Community
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover the best restaurants in your area. Share reviews and connect with fellow food lovers.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {!user ? (
            <>
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link 
                to="/restaurants" 
                className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-50 transition-colors"
              >
                Browse Restaurants
              </Link>
            </>
          ) : (
            <Link 
              to="/restaurants" 
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Restaurants
            </Link>
          )}
        </div>
      </div>

      {/* Featured Restaurants Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Top Rated Restaurants</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant, index) => (
                <div
                  key={`${restaurant.place_id}-${index}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (restaurant.place_id) {
                      navigate(`/restaurant/${restaurant.place_id}`);
                    }
                  }}
                >
                  {restaurant.photos && restaurant.photos[0] && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={`http://localhost:8080/api/google-places/photo?photoReference=${restaurant.photos[0].photo_reference}&maxWidth=400`}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {restaurant.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-2">
                      {renderRating(restaurant.rating)}
                      <span className="text-sm font-medium text-gray-600">
                        {renderPriceLevel(restaurant.price_level)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{restaurant.vicinity}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {restaurant.types?.slice(0, 2).map((type, typeIndex) => (
                        <span
                          key={`${type}-${typeIndex}`}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    
                    {restaurant.user_ratings_total && (
                      <p className="text-xs text-gray-500">
                        {restaurant.user_ratings_total} reviews
                      </p>
                    )}
                    
                    {restaurant.opening_hours?.open_now !== undefined && (
                      <div className="mt-2">
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded ${
                            restaurant.opening_hours.open_now
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {restaurant.opening_hours.open_now ? 'Open now' : 'Closed'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured restaurants yet. Add some restaurants to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FoodCritic?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Discover Great Restaurants',
                description: 'Find the best restaurants in your area with location-based search and authentic reviews.',
                icon: '🔍'
              },
              {
                title: 'Share Your Experience',
                description: 'Write detailed reviews and rate your favorite restaurants to help the community.',
                icon: '✍️'
              },
              {
                title: 'Local Community',
                description: 'Get authentic reviews from real food enthusiasts in your neighborhoods.',
                icon: '👥'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to discover amazing food?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of food lovers and start exploring the best restaurants in your area.
          </p>
          <Link 
            to={user ? "/restaurants" : "/register"} 
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-50 transition-colors"
          >
            {user ? 'Find Restaurants' : 'Sign Up Now'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;