import { isSupabaseConfigured } from '@/lib/supabase';

export interface Location {
    lat: number;
    lng: number;
    address: string;
}

export interface DeliveryQuote {
    distanceKm: number;
    durationMinutes: number;
    fee: number;
    status: 'success' | 'error';
}

export class LogisticsService {
    private static GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    private static BASE_FEE = 500; // Base 500 Naira
    private static PER_KM_FEE = 150; // 150 Naira per km

    /**
     * Calculate delivery fee based on distance between store and customer.
     * Uses the modern Google Maps Routes API.
     */
    static async getDeliveryQuote(origin: string, destination: string): Promise<DeliveryQuote> {
        if (!this.GOOGLE_MAPS_API_KEY) {
            console.warn('[LogisticsService] No Google Maps API Key found. Using intelligent simulation.');
            // Realistic simulation for development without exposing keys
            const dist = Math.floor(Math.random() * 15) + 3;
            const dur = dist * 4;
            return {
                distanceKm: dist,
                durationMinutes: dur,
                fee: this.BASE_FEE + (dist * this.PER_KM_FEE),
                status: 'success'
            };
        }

        try {
            // Google Maps Routes API: Compute Routes
            // Documentation: https://developers.google.com/maps/documentation/routes/compute_route_directions?utm_source=gmp-code-assist
            const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'
                },
                body: JSON.stringify({
                    origin: { address: origin },
                    destination: { address: destination },
                    travelMode: 'DRIVE',
                    routingPreference: 'TRAFFIC_AWARE',
                    computeAlternativeRoutes: false,
                    routeModifiers: {
                        avoidTolls: false,
                        avoidHighways: false,
                        avoidFerries: false
                    },
                    languageCode: 'en-US',
                    units: 'METRIC'
                })
            });

            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
                throw new Error('No routes found');
            }

            const route = data.routes[0];
            const distanceKm = Math.round(route.distanceMeters / 1000);
            const durationMinutes = Math.round(parseInt(route.duration) / 60);

            return {
                distanceKm,
                durationMinutes,
                fee: this.BASE_FEE + (distanceKm * this.PER_KM_FEE),
                status: 'success'
            };
        } catch (error) {
            console.error('[LogisticsService] Routes API Error:', error);
            // Fallback to a fixed reasonable fee on error
            return { distanceKm: 0, durationMinutes: 0, fee: 1500, status: 'error' };
        }
    }

    /**
     * Get store physical locations for pickup
     */
    static async getStoreLocations(tenantId: string): Promise<Location[]> {
        // Mock data for stores
        return [
            { lat: 6.5244, lng: 3.3792, address: 'SOLO HQ, Ikeja, Lagos' },
            { lat: 6.4281, lng: 3.4219, address: 'SOLO Victoria Island' }
        ];
    }
}
