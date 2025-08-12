export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private defaultLocation: LocationCoords = {
    latitude: 37.7749, // San Francisco default
    longitude: -122.4194,
  };

  async getCurrentPosition(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser.',
        });
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Fallback to default location on error
          resolve(this.defaultLocation);
        },
        options
      );
    });
  }

  getDefaultLocation(): LocationCoords {
    return this.defaultLocation;
  }

  async geocodeAddress(address: string): Promise<LocationCoords | null> {
    // This would typically use Google Geocoding API or similar
    // For now, we'll return null and let the user enter coordinates manually
    // In a real implementation, you'd make an API call here
    return null;
  }

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }
}

export const locationService = new LocationService();