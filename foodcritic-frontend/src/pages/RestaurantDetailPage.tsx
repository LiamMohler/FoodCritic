import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { googlePlacesApi, reviewApi } from '../lib/api';
import { ReviewCard } from '../components/review/ReviewCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ReviewModal } from '../components/review/ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const { id: placeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Get restaurant details from Google Places
  const { data: restaurantDetails, isLoading, error } = useQuery({
    queryKey: ['restaurantDetails', placeId],
    queryFn: () => placeId ? googlePlacesApi.getRestaurantDetails(placeId) : null,
    enabled: !!placeId,
  });

  // Get user's existing review for this restaurant (if logged in)
  const { data: userReview } = useQuery({
    queryKey: ['userReview', placeId],
    queryFn: () => placeId ? reviewApi.getUserReview(placeId) : null,
    enabled: !!placeId && !!user,
    retry: false,
  });

  // Get all reviews for this restaurant
  const { data: restaurantReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['restaurantReviews', placeId],
    queryFn: () => placeId ? reviewApi.getByRestaurant(placeId) : null,
    enabled: !!placeId,
  });

  const restaurant = restaurantDetails?.result;

  const handleDeleteReview = async (reviewId: number) => {
    if (!placeId) return;
    
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await reviewApi.delete(placeId, reviewId);
        toast.success('Review deleted successfully');
        // Refresh the page to show Write Review button again
        window.location.reload();
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review. Please try again.');
      }
    }
  };


  const renderRating = (rating?: number, user_ratings_total?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarSolid
              key={star}
              className={`h-6 w-6 ${
                star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xl font-semibold text-gray-900">{rating.toFixed(1)}</span>
        {user_ratings_total && (
          <span className="text-lg font-medium text-gray-700">({user_ratings_total.toLocaleString()} reviews)</span>
        )}
      </div>
    );
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Price:</span>
        <span className="font-semibold text-green-600 text-lg">
          {'$'.repeat(level)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Restaurant Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load the details for this restaurant.
            </p>
            <Button onClick={() => navigate('/restaurants')}>
              Back to Restaurants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Restaurant Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {restaurant.photos && restaurant.photos[0] && (
              <div className="h-64 md:h-80">
                <img
                  src={`http://localhost:8080/api/google-places/photo?photoReference=${restaurant.photos[0].photo_reference}&maxWidth=800`}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop';
                  }}
                />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <div className="text-white">
                {renderRating(restaurant.rating, restaurant.user_ratings_total)}
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Restaurant Information</h3>
                  
                  {restaurant.formatted_address && (
                    <div className="flex items-start space-x-3 mb-4">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                      <p className="text-gray-700">{restaurant.formatted_address}</p>
                    </div>
                  )}

                  {restaurant.formatted_phone_number && (
                    <div className="flex items-center space-x-3 mb-4">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={`tel:${restaurant.formatted_phone_number}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {restaurant.formatted_phone_number}
                      </a>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-center space-x-3 mb-4">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500 underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {restaurant.price_level && (
                    <div className="mt-4">
                      {renderPriceLevel(restaurant.price_level)}
                    </div>
                  )}
                </div>

                {/* Opening Hours */}
                {restaurant.opening_hours?.weekday_text && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Hours
                    </h3>
                    <div className="space-y-2">
                      {restaurant.opening_hours.weekday_text.map((hours: string, index: number) => (
                        <p key={index} className="text-gray-700 text-sm">{hours}</p>
                      ))}
                    </div>
                    {restaurant.opening_hours.open_now !== undefined && (
                      <div className="mt-3">
                        <span
                          className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${
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
                )}

                {/* Cuisine Types */}
                {restaurant.types && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cuisine & Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.types.slice(0, 6).map((type, index) => (
                        <span
                          key={index}
                          className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full"
                        >
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Photos */}
              <div className="space-y-6">
                {/* Photo Gallery */}
                {restaurant.photos && restaurant.photos.length > 1 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {restaurant.photos.slice(1, 5).map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={`http://localhost:8080/api/google-places/photo?photoReference=${photo.photo_reference}&maxWidth=400`}
                            alt={`${restaurant.name} photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">FoodCritic Reviews</h3>
            {!userReview && (
              <Button
                onClick={() => {
                  if (!user) {
                    toast.error('Please log in to write a review');
                    navigate('/login');
                    return;
                  }
                  setShowReviewModal(true);
                }}
                className="flex items-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Write Review</span>
              </Button>
            )}
          </div>
          
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : restaurantReviews && restaurantReviews.length > 0 ? (
            <div className="space-y-6">
              {restaurantReviews.map((review, index) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  index={index}
                  currentUser={user}
                  onEdit={review.user.id === user?.id ? () => setShowReviewModal(true) : undefined}
                  onDelete={review.user.id === user?.id ? () => handleDeleteReview(review.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet for {restaurant?.name}</p>
              <p className="text-sm mt-1">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {placeId && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              queryClient.invalidateQueries({ queryKey: ['userReview', placeId] });
              queryClient.invalidateQueries({ queryKey: ['restaurantReviews', placeId] });
            }}
            restaurantId={placeId}
            initialData={userReview ? {
              rating: userReview.rating,
              comment: userReview.comment || '',
              reviewId: userReview.id
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}