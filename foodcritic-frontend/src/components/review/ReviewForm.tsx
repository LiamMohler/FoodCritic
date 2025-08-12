import { useState } from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { reviewApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    rating: number;
    comment: string;
    reviewId?: number;
  };
  isModal?: boolean;
}

export function ReviewForm({
  restaurantId,
  onSuccess,
  onCancel,
  initialData,
  isModal = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.reviewId) {
        // Update existing review
        await reviewApi.update(restaurantId, initialData.reviewId, {
          rating,
          comment: comment.trim(),
        });
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        await reviewApi.create(restaurantId, {
          rating,
          comment: comment.trim(),
        });
        toast.success('Review submitted successfully!');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl focus:outline-none"
            >
              {star <= rating ? (
                <StarSolid className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarOutline className="h-8 w-8 text-gray-300 hover:text-yellow-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Share your experience at this restaurant..."
          required
          minLength={10}
        />
        <p className="mt-1 text-sm text-gray-500">
          Minimum 10 characters ({comment.length}/10)
        </p>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSubmitting ? 'Submitting...' : (initialData?.reviewId ? 'Update Review' : 'Submit Review')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}