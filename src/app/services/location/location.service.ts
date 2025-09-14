import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface LocationIQResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
    country_code?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly LOCATIONIQ_API_KEY = environment.locationIQKey; // Replace with your actual API key
  private readonly LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';

  constructor(private http: HttpClient) {}

  /**
   * Search for location suggestions based on query string
   */
  searchLocations(query: string): Observable<LocationSuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    if (!this.LOCATIONIQ_API_KEY) {
      console.warn('LocationIQ API key not configured. Using mock data.');
      return this.getMockLocationSuggestions(query);
    }

    const params = new HttpParams()
      .set('key', this.LOCATIONIQ_API_KEY)
      .set('q', query)
      .set('format', 'json')
      .set('limit', '8')
      .set('addressdetails', '1')
      .set('countrycodes', 'pk') // Limit to specific countries if needed
      .set('dedupe', '1');

    return this.http.get<LocationIQResponse[]>(`${this.LOCATIONIQ_BASE_URL}/search.php`, { params })
      .pipe(
        map(response => this.transformLocationResponse(response)),
        catchError(error => {
          console.error('LocationIQ search error:', error);
          // Fallback to mock data on error
          return this.getMockLocationSuggestions(query);
        })
      );
  }

  /**
   * Reverse geocoding - get location details from coordinates
   */
  reverseGeocode(lat: number, lon: number): Observable<LocationSuggestion | null> {
    if (!this.LOCATIONIQ_API_KEY) {
      console.warn('LocationIQ API key not configured. Using mock data.');
      return this.getMockReverseGeocode(lat, lon);
    }

    const params = new HttpParams()
      .set('key', this.LOCATIONIQ_API_KEY)
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('format', 'json')
      .set('addressdetails', '1');

    return this.http.get<LocationIQResponse>(`${this.LOCATIONIQ_BASE_URL}/reverse.php`, { params })
      .pipe(
        map(response => this.transformSingleLocationResponse(response)),
        catchError(error => {
          console.error('LocationIQ reverse geocoding error:', error);
          return of(null);
        })
      );
  }

  /**
   * Get location details by place ID
   */
  getLocationDetails(placeId: string): Observable<LocationSuggestion | null> {
    if (!this.LOCATIONIQ_API_KEY) {
      console.warn('LocationIQ API key not configured.');
      return of(null);
    }

    const params = new HttpParams()
      .set('key', this.LOCATIONIQ_API_KEY)
      .set('osm_ids', placeId)
      .set('format', 'json')
      .set('addressdetails', '1');

    return this.http.get<LocationIQResponse[]>(`${this.LOCATIONIQ_BASE_URL}/search.php`, { params })
      .pipe(
        map(response => response.length > 0 ? this.transformSingleLocationResponse(response[0]) : null),
        catchError(error => {
          console.error('LocationIQ details error:', error);
          return of(null);
        })
      );
  }

  /**
   * Transform LocationIQ API response to our internal format
   */
  private transformLocationResponse(response: LocationIQResponse[]): LocationSuggestion[] {
    return response.map(item => this.transformSingleLocationResponse(item));
  }

  /**
   * Transform single LocationIQ item to our internal format
   */
  private transformSingleLocationResponse(item: LocationIQResponse): LocationSuggestion {
    return {
      place_id: item.place_id,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
        postcode: item.address?.postcode
      }
    };
  }

  /**
   * Mock location suggestions for development/fallback
   */
  private getMockLocationSuggestions(query: string): Observable<LocationSuggestion[]> {
    const mockLocations: LocationSuggestion[] = [
      {
        place_id: '1',
        display_name: 'New York, NY, United States',
        lat: '40.7128',
        lon: '-74.0060',
        address: { city: 'New York', state: 'NY', country: 'United States' }
      },
      {
        place_id: '2',
        display_name: 'Los Angeles, CA, United States',
        lat: '34.0522',
        lon: '-118.2437',
        address: { city: 'Los Angeles', state: 'CA', country: 'United States' }
      },
      {
        place_id: '3',
        display_name: 'Chicago, IL, United States',
        lat: '41.8781',
        lon: '-87.6298',
        address: { city: 'Chicago', state: 'IL', country: 'United States' }
      },
      {
        place_id: '4',
        display_name: 'Houston, TX, United States',
        lat: '29.7604',
        lon: '-95.3698',
        address: { city: 'Houston', state: 'TX', country: 'United States' }
      },
      {
        place_id: '5',
        display_name: 'Phoenix, AZ, United States',
        lat: '33.4484',
        lon: '-112.0740',
        address: { city: 'Phoenix', state: 'AZ', country: 'United States' }
      }
    ];

    const filtered = mockLocations.filter(location =>
      location.display_name.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered);
  }

  /**
   * Mock reverse geocoding for development/fallback
   */
  private getMockReverseGeocode(lat: number, lon: number): Observable<LocationSuggestion | null> {
    // Return a mock location based on coordinates (very simplified)
    const mockLocation: LocationSuggestion = {
      place_id: 'mock_current',
      display_name: 'Current Location, Your City, Your State',
      lat: lat.toString(),
      lon: lon.toString(),
      address: { city: 'Your City', state: 'Your State', country: 'United States' }
    };

    return of(mockLocation);
  }

  /**
   * Validate coordinates
   */
  isValidCoordinate(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Calculate distance between two points (in kilometers)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
