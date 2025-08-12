import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  StarIcon,
  PhotoIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { userApi, uploadApi, reviewApi } from '../lib/api';
import { ReviewCard } from '../components/review/ReviewCard';
import { ReviewModal } from '../components/review/ReviewModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Review, User } from '../types';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user) return;
      
      try {
        const reviews = await userApi.getMyReviews();
        setUserReviews(reviews);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        toast.error('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user]);

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDeleteReview = async (review: Review) => {
    if (!review.restaurant?.id) return;
    
    if (window.confirm(`Are you sure you want to delete your review for ${review.restaurant.name}?`)) {
      try {
        await reviewApi.delete(review.restaurant.id, review.id);
        toast.success('Review deleted successfully');
        // Refresh the reviews list
        const updatedReviews = await userApi.getMyReviews();
        setUserReviews(updatedReviews);
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review. Please try again.');
      }
    }
  };

  const handleModalClose = async () => {
    setShowEditModal(false);
    setEditingReview(null);
    // Refresh the reviews list after editing
    try {
      const updatedReviews = await userApi.getMyReviews();
      setUserReviews(updatedReviews);
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploadResult = await uploadApi.uploadImage(file);
      const fullImageUrl = `http://localhost:8080${uploadResult.url}`;
      
      const updatedUser = await userApi.updateProfilePhoto(fullImageUrl);
      updateUser(updatedUser);
      
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
    : 0;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                {/* Profile Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-6 pb-6 border-b border-gray-200"
                >
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ring-4 ring-gray-200 mx-auto">
                      {user.profilePhoto ? (
                        <img 
                          src={user.profilePhoto} 
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <label 
                      htmlFor="profile-photo-upload" 
                      className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
                    >
                      {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <PencilIcon className="w-4 h-4" />
                      )}
                    </label>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </div>
                  <div className="mt-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h1>
                    <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                    <div className="flex items-center justify-center text-gray-500 text-sm">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>Member since {joinDate}</span>
                    </div>
                  </div>
                </motion.div>

                <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Stats</h3>
              
              <div className="space-y-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {userReviews.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>

                {averageRating > 0 && (
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <StarIcon className="w-6 h-6 text-yellow-400" />
                      <span className="text-2xl font-bold text-orange-600">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Average Rating Given</div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="text-gray-900 font-medium">{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="text-gray-900 font-medium">{user.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
                Your Reviews ({userReviews.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : userReviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6">
                  Start exploring restaurants and share your dining experiences!
                </p>
                <a
                  href="/restaurants"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Discover Restaurants
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {userReviews.map((review, index) => (
                  <div key={review.id} className="relative">
                    <div className="absolute -left-4 top-6 w-2 h-2 bg-blue-500 rounded-full hidden lg:block"></div>
                    <ReviewCard 
                      review={review} 
                      index={index} 
                      showRestaurant={true}
                      onRestaurantClick={(restaurantId) => navigate(`/restaurant/${restaurantId}`)}
                      currentUser={user}
                      onEdit={() => handleEditReview(review)}
                      onDelete={() => handleDeleteReview(review)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <ReviewModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          restaurantId={editingReview.restaurant?.id || ''}
          initialData={{
            rating: editingReview.rating,
            comment: editingReview.comment || '',
            reviewId: editingReview.id
          }}
        />
      )}
    </div>
  );
}