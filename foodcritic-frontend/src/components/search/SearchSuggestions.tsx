import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { googlePlacesApi, type GooglePlacesSuggestion } from '../../lib/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: GooglePlacesSuggestion) => void;
  onSearch?: () => void;
  placeholder?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  className?: string;
  isSearching?: boolean;
}

export function SearchSuggestions({
  value,
  onChange,
  onSuggestionSelect,
  onSearch,
  placeholder = "Search restaurants, cuisine, or keywords...",
  latitude,
  longitude,
  radius = 5000,
  className = "",
  isSearching = false
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<GooglePlacesSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        await fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, latitude, longitude, radius]);

  const fetchSuggestions = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await googlePlacesApi.getSuggestions({
        input: query,
        latitude,
        longitude,
        radius,
        types: 'establishment'
      });

      if (response.status === 'OK') {
        setSuggestions(response.predictions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: GooglePlacesSuggestion) => {
    onChange(suggestion.structured_formatting?.main_text || suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (onSearch) {
          onSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-3">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        {onSearch && (
          <button
            onClick={onSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSearching ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer flex items-start space-x-3 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
              }`}
            >
              <MapPinIcon className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {suggestion.structured_formatting ? (
                  <>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-900 truncate">
                    {suggestion.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}