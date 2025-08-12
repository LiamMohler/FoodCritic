import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onChange,
  className = '' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1);
    }
  };

  return (
    <div className={`star-rating ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalfFilled = index < rating && index >= Math.floor(rating);
        
        return (
          <button
            key={index}
            type="button"
            className={`${sizeClasses[size]} ${
              interactive 
                ? 'hover:scale-110 transition-transform cursor-pointer' 
                : 'cursor-default'
            }`}
            onClick={() => handleStarClick(index)}
            disabled={!interactive}
          >
            {isFilled ? (
              <StarIcon className="text-yellow-400" />
            ) : (
              <StarOutlineIcon className="text-gray-300" />
            )}
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-600 font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}