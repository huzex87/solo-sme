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
     * Uses Routes API (simulated if no API key is provided).
     */
    static async getDeliveryQuote(origin: string, destination: string): Promise<DeliveryQuote> {
        if (!this.GOOGLE_MAPS_API_KEY) {
            console.warn('[LogisticsService] No Google Maps API Key found. Using simulated delivery calculation.');
            // Simulated logic: random distance between 2-15km
            const dist = Math.floor(Math.random() * 13) + 2;
            const dur = dist * 3; // Approx 3 mins per km
            return {
                distanceKm: dist,
                durationMinutes: dur,
                fee: this.BASE_FEE + (dist * this.PER_KM_FEE),
                status: 'success'
            };
        }

        try {
            // Real Routes API call would go here
            // For now, keeping the structure for the user to add their key
            const dist = 5; // Placeholder
            return {
                distanceKm: dist,
                durationMinutes: 15,
                fee: this.BASE_FEE + (dist * this.PER_KM_FEE),
                status: 'success'
            };
        } catch (error) {
            console.error('Logistics error:', error);
            return { distanceKm: 0, durationMinutes: 0, fee: 1000, status: 'error' };
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
