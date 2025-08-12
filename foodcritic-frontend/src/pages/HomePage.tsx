import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { googlePlacesApi, type GooglePlacesSearchRequest, type GooglePlaceResult } from '../lib/api';
import { locationService, type LocationCoords } from '../services/locationService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import toast from 'react-hot-toast';

export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationCoords>(locationService.getDefaultLocation());
  const [searchRequest, setSearchRequest] = useState<GooglePlacesSearchRequest | null>(null);
  const [allResults, setAllResults] = useState<GooglePlaceResult[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get current location and trigger initial search
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const coords = await locationService.getCurrentPosition();
      setLocation(coords);
      // Trigger initial search with location - filter for top-rated restaurants
      const request: GooglePlacesSearchRequest = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius: 5000,
        type: 'restaurant',
        minRating: 4.0, // Only show restaurants with 4+ stars
      };
      setSearchRequest(request);
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default location and search - filter for top-rated restaurants
      const request: GooglePlacesSearchRequest = {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000,
        type: 'restaurant',
        minRating: 4.0, // Only show restaurants with 4+ stars
      };
      setSearchRequest(request);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Search query
  const { data, isLoading, error } = useQuery({
    queryKey: ['homePageRestaurants', searchRequest],
    queryFn: () => searchRequest ? googlePlacesApi.searchRestaurants(searchRequest) : null,
    enabled: !!searchRequest,
  });

  // Handle search results
  useEffect(() => {
    if (data && data.status === 'OK') {
      // Sort by rating (highest first) and take top 12
      const sortedResults = data.results
        .filter(restaurant => restaurant.rating && restaurant.rating >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 12);
      setAllResults(sortedResults);
    } else if (data && data.status !== 'OK') {
      console.error('Search failed:', data);
      toast.error(data.error_message || 'Failed to load restaurants');
    }
  }, [data]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState 
            title="Error Loading Restaurants"
            description="Failed to load restaurants. Please try again."
            variant="error"
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍽️ Food Critic
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover great restaurants.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Top Rated Restaurants
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : allResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allResults.map((restaurant, index) => (
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No restaurants found nearby
            </h3>
            <p className="text-gray-600">
              We're searching for restaurants in your area...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
