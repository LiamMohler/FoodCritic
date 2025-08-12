import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { reviewApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState, NetworkErrorState } from '../components/ui/ErrorState';
import { ReviewCard } from '../components/review/ReviewCard';
import type { Review } from '../types';
import toast from 'react-hot-toast';

export default function RecentReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const recentReviews = await reviewApi.getAllRecent(50); // Get last 50 reviews
        setReviews(recentReviews || []);
      } catch (error: any) {
        console.error('Error fetching recent reviews:', error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to load recent reviews. Please try again later.';
        setError(errorMessage);
        
        // Only show toast for non-network errors to avoid spam
        if (!error.code || error.code !== 'NETWORK_ERROR') {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);


  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton variant="circle" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex items-center space-x-1 mb-3">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton variant="text" lines={2} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const recentReviews = await reviewApi.getAllRecent(50);
      setReviews(recentReviews || []);
    } catch (error: any) {
      console.error('Error fetching recent reviews:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load recent reviews. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NetworkErrorState
            title="Failed to Load Recent Reviews"
            description={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <ChatBubbleLeftRightIcon className="h-7 w-7 mr-3 text-primary-600" />
              Recent Reviews
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Latest reviews from the FoodCritic community
            </p>
          </CardHeader>

          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    index={index}
                    showRestaurant={true}
                    onRestaurantClick={handleRestaurantClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No reviews yet"
                description="Be the first to write a review!"
              >
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              </EmptyState>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}