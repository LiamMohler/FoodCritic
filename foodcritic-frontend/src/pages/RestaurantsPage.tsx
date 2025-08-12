import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { googlePlacesApi, type GooglePlacesSearchRequest, type GooglePlaceResult } from '../lib/api';
import { locationService, type LocationCoords } from '../services/locationService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { SearchSuggestions } from '../components/search/SearchSuggestions';
import toast from 'react-hot-toast';

interface SearchFilters {
  query: string;
  location: LocationCoords;
  radius: number;
  minRating?: number;
  maxPriceLevel?: number;
  minPriceLevel?: number;
  useCurrentLocation: boolean;
  sortBy?: 'relevance' | 'distance' | 'rating';
}


export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: locationService.getDefaultLocation(),
    radius: 25000, // Increased to 25km for better coverage
    useCurrentLocation: true,
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchRequest, setSearchRequest] = useState<GooglePlacesSearchRequest | null>(null);
  const [allResults, setAllResults] = useState<GooglePlaceResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get current location on component mount (but don't auto-search)
  useEffect(() => {
    if (filters.useCurrentLocation) {
      toggleLocation();
    }
  }, []);

  const toggleLocation = async () => {
    if (filters.useCurrentLocation) {
      // Switch to default location
      const defaultLocation = locationService.getDefaultLocation();
      setFilters(prev => ({
        ...prev,
        location: defaultLocation,
        useCurrentLocation: false
      }));
      // Trigger search with default location immediately
      handleSearchWithLocation(defaultLocation);
    } else {
      // Switch to current location
      setIsLoadingLocation(true);
      try {
        const coords = await locationService.getCurrentPosition();
        setFilters(prev => ({ ...prev, location: coords, useCurrentLocation: true }));
        // Trigger search with current location immediately
        handleSearchWithLocation(coords);
      } catch (error) {
        console.error('Error getting location:', error);
        toast.error('Could not detect location, using default');
      } finally {
        setIsLoadingLocation(false);
      }
    }
  };

  const handleSearchWithLocation = (location: LocationCoords) => {
    const request: GooglePlacesSearchRequest = {
      latitude: location.latitude,
      longitude: location.longitude,
      query: filters.query.trim() || undefined,
      radius: filters.radius,
      type: 'restaurant',
      minRating: filters.minRating,
      maxPriceLevel: filters.maxPriceLevel,
      minPriceLevel: filters.minPriceLevel,
    };
    
    setSearchRequest(request);
    setAllResults([]);
    setNextPageToken(undefined);
    setCurrentPage(1);
  };

  // Search query
  const { data, isLoading, error } = useQuery({
    queryKey: ['googlePlacesSearch', searchRequest],
    queryFn: () => searchRequest ? googlePlacesApi.searchRestaurants(searchRequest) : null,
    enabled: !!searchRequest,
  });

  // Handle search results
  useEffect(() => {
    if (data && data.status === 'OK') {
      
      if (searchRequest?.pageToken) {
        // Append results for pagination
        setAllResults(prev => [...prev, ...data.results]);
      } else {
        // New search, replace results
        setAllResults(data.results);
        setCurrentPage(1);
      }
      setNextPageToken(data.next_page_token);
    } else if (data && data.status !== 'OK') {
      console.error('Search failed:', data);
      if (data.status === 'ZERO_RESULTS') {
      }
      toast.error(data.error_message || `Search failed: ${data.status}`);
    }
  }, [data, searchRequest?.pageToken]);

  const handleSearch = () => {
    const request: GooglePlacesSearchRequest = {
      latitude: filters.location.latitude,
      longitude: filters.location.longitude,
      query: filters.query.trim() || undefined,
      radius: filters.radius,
      type: 'restaurant',
      minRating: filters.minRating,
      maxPriceLevel: filters.maxPriceLevel,
      minPriceLevel: filters.minPriceLevel,
    };
    
    setSearchRequest(request);
    setAllResults([]);
    setNextPageToken(undefined);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    
    if (hasMoreLocalResults) {
      // Just show more of the already loaded results
      setCurrentPage(prev => prev + 1);
    } else if (nextPageToken && searchRequest) {
      // Fetch more results from Google Places API
      const request: GooglePlacesSearchRequest = {
        ...searchRequest,
        pageToken: nextPageToken,
      };
      setSearchRequest(request);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFilterChange = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSuggestionSelect = () => {
    // When a suggestion is selected, perform a search automatically
    handleSearch();
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      location: locationService.getDefaultLocation(),
      radius: 25000,
      useCurrentLocation: true,
    });
    setSearchRequest(null);
    setAllResults([]);
    setNextPageToken(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(filters.minRating || filters.maxPriceLevel || filters.minPriceLevel || (filters.sortBy && filters.sortBy !== 'relevance'));

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

  const calculateDistance = (restaurant: GooglePlaceResult): string | null => {
    if (!filters.useCurrentLocation || !restaurant.geometry?.location) {
      return null;
    }
    
    const distance = locationService.calculateDistance(
      filters.location.latitude,
      filters.location.longitude,
      restaurant.geometry.location.lat,
      restaurant.geometry.location.lng
    );
    
    return locationService.formatDistance(distance);
  };

  // Sort restaurants based on selected criteria
  const sortRestaurants = (restaurants: GooglePlaceResult[]): GooglePlaceResult[] => {
    if (!filters.sortBy || filters.sortBy === 'relevance') {
      return restaurants; // Keep original order (Google's relevance)
    }

    return [...restaurants].sort((a, b) => {
      if (filters.sortBy === 'distance' && filters.useCurrentLocation) {
        if (!a.geometry?.location || !b.geometry?.location) return 0;
        
        const distanceA = locationService.calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          a.geometry.location.lat,
          a.geometry.location.lng
        );
        const distanceB = locationService.calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          b.geometry.location.lat,
          b.geometry.location.lng
        );
        
        return distanceA - distanceB; // Closest first
      }
      
      if (filters.sortBy === 'rating') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA; // Highest rating first
      }
      
      return 0;
    });
  };

  // Display all loaded restaurants, limit to 12 initially 
  const sortedResults = sortRestaurants(allResults);
  const displayedRestaurants = sortedResults.slice(0, 12 * currentPage);
  const hasMoreLocalResults = displayedRestaurants.length < sortedResults.length;
  const canLoadMore = !!nextPageToken || hasMoreLocalResults;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Restaurants
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find amazing restaurants near you with real-time data from Google
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <SearchSuggestions
              value={filters.query}
              onChange={(value) => handleFilterChange('query', value)}
              onSuggestionSelect={handleSuggestionSelect}
              onSearch={handleSearch}
              isSearching={isLoading}
              latitude={filters.location.latitude}
              longitude={filters.location.longitude}
              radius={filters.radius}
              placeholder="Search restaurants, cuisine, or keywords..."
            />
          </div>


          {/* Basic Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleLocation}
                disabled={isLoadingLocation}
                variant={filters.useCurrentLocation ? "primary" : "outline"}
                size="sm"
                className={filters.useCurrentLocation ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              >
                {isLoadingLocation ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <MapPinIcon className={`h-4 w-4 mr-2 ${filters.useCurrentLocation ? 'text-white' : 'text-gray-500'}`} />
                    {filters.useCurrentLocation ? 'Location Active' : 'Use Current Location'}
                  </>
                )}
              </Button>
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>
              
              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as 'relevance' | 'distance' | 'rating')}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="relevance">Relevance</option>
                  {filters.useCurrentLocation && (
                    <option value="distance">Distance</option>
                  )}
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius: {(filters.radius / 1000).toFixed(1)}km
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange('minRating', 
                          filters.minRating === rating ? undefined : rating)}
                        className={`p-1 rounded transition-colors ${
                          (filters.minRating || 0) >= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      >
                        <StarIconSolid className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Level
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={filters.minPriceLevel || ''}
                      onChange={(e) => handleFilterChange('minPriceLevel', 
                        e.target.value ? parseInt(e.target.value) : undefined)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Min</option>
                      <option value="1">$</option>
                      <option value="2">$$</option>
                      <option value="3">$$$</option>
                      <option value="4">$$$$</option>
                    </select>
                    <select
                      value={filters.maxPriceLevel || ''}
                      onChange={(e) => handleFilterChange('maxPriceLevel', 
                        e.target.value ? parseInt(e.target.value) : undefined)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Max</option>
                      <option value="1">$</option>
                      <option value="2">$$</option>
                      <option value="3">$$$</option>
                      <option value="4">$$$$</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {displayedRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {displayedRestaurants.map((restaurant, index) => (
              <div
                key={`${restaurant.place_id}-${index}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (restaurant.place_id) {
                    navigate(`/restaurant/${restaurant.place_id}`);
                  } else {
                    console.error('No place_id for restaurant:', restaurant);
                  }
                }}
              >
                {restaurant.photos && restaurant.photos[0] && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={`http://localhost:8080/api/google-places/photo?photoReference=${restaurant.photos[0].photo_reference}&maxWidth=400`}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
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
                  
                  {/* Distance display when using current location */}
                  {calculateDistance(restaurant) && (
                    <div className="flex items-center mb-2">
                      <MapPinIcon className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-blue-600">
                        {calculateDistance(restaurant)} away
                      </span>
                    </div>
                  )}
                  
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
        )}

        {/* Load More Button */}
        {canLoadMore && displayedRestaurants.length > 0 && (
          <div className="flex justify-center">
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Load More'}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && displayedRestaurants.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* No Results */}
        {!isLoading && displayedRestaurants.length === 0 && searchRequest && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No restaurants found</p>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria or location</p>
            <Button onClick={resetFilters} variant="outline">
              Reset Filters
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-800">
              Error loading restaurants. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}