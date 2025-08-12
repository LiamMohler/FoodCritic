import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarRating } from '../ui/StarRating';
import type { Review, User } from '../../types';

interface ReviewCardProps {
  review: Review;
  index?: number;
  showRestaurant?: boolean;
  onRestaurantClick?: (restaurantId: string) => void;
  currentUser?: User | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({ 
  review, 
  index = 0, 
  showRestaurant = false, 
  onRestaurantClick,
  currentUser,
  onEdit,
  onDelete 
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (onRestaurantClick && review.restaurantId) {
      onRestaurantClick(review.restaurantId);
    }
  };

  const isCurrentUserReview = currentUser && review.user.id === currentUser.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${
        onRestaurantClick ? 'cursor-pointer hover:shadow-lg' : ''
      }`}
      onClick={handleClick}
    >
      {/* Header with User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
            {review.user.profilePhoto ? (
              <img
                src={review.user.profilePhoto}
                alt={`${review.user.username}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to colored avatar if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className = `w-12 h-12 ${getAvatarColor(review.user.username)} rounded-full flex items-center justify-center shadow-lg`;
                    parent.innerHTML = `<span class="text-white text-lg font-bold">${review.user.username.charAt(0).toUpperCase()}</span>`;
                  }
                }}
              />
            ) : (
              <div className={`w-full h-full ${getAvatarColor(review.user.username)} flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">
                  {review.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg truncate">{review.user.username}</h4>
            <div className="flex items-center space-x-3 mt-1">
              {/* Stars with rating */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {review.rating}/5
                </span>
              </div>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {/* Action buttons for current user's review */}
        {isCurrentUserReview && (onEdit || onDelete) && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit review"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete review"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Restaurant Info (for recent reviews) */}
      {showRestaurant && review.restaurant && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {review.restaurant.name}
          </h4>
          {review.restaurant.address && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {review.restaurant.address}
            </div>
          )}
        </div>
      )}

      {/* Review Content */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed text-base">{review.comment}</p>
        </div>
      )}

      {/* Review Image */}
      {review.imageUrl && (
        <div className="mb-4">
          <img
            src={`http://localhost:8080${review.imageUrl}`}
            alt="Review"
            className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-100"
          />
        </div>
      )}

      {/* Updated indicator */}
      {review.updatedAt !== review.createdAt && (
        <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 flex items-center space-x-1">
          <span>Last updated: {formatDate(review.updatedAt)}</span>
        </div>
      )}
    </motion.div>
  );
}