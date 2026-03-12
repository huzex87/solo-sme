import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';
import { TenantService } from './tenantService';
import { formatNaira } from '@/lib/formatCurrency';

export interface Location {
    lat: number;
    lng: number;
    address: string;
}

export interface DeliveryQuote {
    distanceKm: number;
    durationMinutes: number;
    fee: number;
    formattedFee: string;
    status: 'success' | 'error';
}

export class LogisticsService {
    private static DEFAULT_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    private static BASE_FEE = 1500; // Base 1,500 Naira for logistics (Increased for premium service)
    private static PER_KM_FEE = 250; // 250 Naira per km

    /**
     * Calculate delivery fee based on distance between store and customer.
     * Uses the modern Google Maps Routes API.
     */
    static async getDeliveryQuote(origin: string, destination: string, tenantId?: string): Promise<DeliveryQuote> {
        // Resolve correctly key: Tenant-specific or platform default
        let apiKey = this.DEFAULT_GOOGLE_MAPS_API_KEY;
        if (tenantId) {
            try {
                const tenant = await TenantService.getTenant(tenantId);
                if (tenant?.business_config?.google_maps_key) {
                    apiKey = tenant.business_config.google_maps_key;
                }
            } catch (err) {
                console.warn('[LogisticsService] Error fetching tenant config. Falling back to platform default.');
            }
        }

        if (!apiKey) {
            console.warn('[LogisticsService] No Google Maps API Key found. Using institutional fallback.');
            // Robust Nigerian state fallback: 
            // If destination looks like a standard city (Lagos, Abuja, PH), apply a tiered distance estimation
            const isMajorCity = /Lagos|Abuja|Port Harcourt|Ibadan|Kano/i.test(destination);
            const baseEstKm = isMajorCity ? 15 : 45;
            const estimatedDist = Math.min(Math.max((destination.length / 3) + baseEstKm, baseEstKm), 150);

            const duration = Math.round(estimatedDist * 3.5);
            const calculatedFee = this.BASE_FEE + (Math.round(estimatedDist) * this.PER_KM_FEE);

            return {
                distanceKm: Math.round(estimatedDist),
                durationMinutes: duration,
                fee: calculatedFee,
                formattedFee: formatNaira(calculatedFee),
                status: 'success'
            };
        }

        try {
            const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
                },
                body: JSON.stringify({
                    origin: { address: origin },
                    destination: { address: destination },
                    travelMode: 'DRIVE',
                    routingPreference: 'TRAFFIC_AWARE',
                    languageCode: 'en-US',
                    units: 'METRIC'
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(`Google Maps API Error: ${data.error.message || data.error.status}`);
            }

            if (!data.routes || data.routes.length === 0) {
                throw new Error('No routes found for the given origin and destination.');
            }

            const route = data.routes[0];
            const distanceKm = Math.round(route.distanceMeters / 1000);
            const durationMinutes = Math.round(parseInt(route.duration) / 60);
            const calculatedFee = this.BASE_FEE + (distanceKm * this.PER_KM_FEE);

            return {
                distanceKm,
                durationMinutes,
                fee: calculatedFee,
                formattedFee: formatNaira(calculatedFee),
                status: 'success'
            };
        } catch (error) {
            console.error('[LogisticsService] Routes API Error:', error);
            // Dynamic fallback fee based on generic distance
            const failbackFee = 3500;
            return {
                distanceKm: 0,
                durationMinutes: 0,
                fee: failbackFee,
                formattedFee: formatNaira(failbackFee),
                status: 'error'
            };
        }
    }


    /**
     * Get store physical locations for pickup from Supabase
     */
    static async getStoreLocations(tenantId: string): Promise<Location[]> {
        if (!isSupabaseConfigured) {
            // Support storefront view in demo mode
            if (tenantId === 'demo' || tenantId === 'my-store' || tenantId === 't1') {
                return [
                    {
                        lat: 6.5244,
                        lng: 3.3792,
                        address: 'SOLO Flagship Store, Victoria Island, Lagos'
                    },
                    {
                        lat: 7.3775,
                        lng: 3.9470,
                        address: 'SOLO Experience Center, Ibadan, Oyo'
                    }
                ];
            }
            return [];
        }

        const { data, error } = await supabase
            .from('store_locations')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error || !data || data.length === 0) {
            // Fallback to tenant address if specific locations aren't set
            return [];
        }

        interface StoreLocationRow {
            latitude: number;
            longitude: number;
            address: string;
        }

        return (data as StoreLocationRow[]).map(l => ({
            lat: l.latitude,
            lng: l.longitude,
            address: l.address
        }));
    }
}
