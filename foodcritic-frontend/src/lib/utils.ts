import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatRating = (rating: number) => {
  return Number(rating).toFixed(1);
};

export const formatPrice = (level: number) => {
  if (level <= 0) return null;
  return '$'.repeat(Math.min(level, 4));
};

export const renderStars = (rating: number) => {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
};