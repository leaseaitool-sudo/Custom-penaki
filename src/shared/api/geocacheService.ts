/**
 * geocacheService.ts
 *
 * Caches geocoded coordinates (lat/lng) per lease in the `leases` table.
 * Two new nullable columns on the `leases` table: `geocached_lat` and `geocached_lng`.
 *
 * Reading: On LocationsPage load, fetch all leases' existing cached coordinates.
 * Writing: After a successful geocode API call, persist the result so next time
 *          there's no API call to Google needed.
 *
 * Requires these columns on the leases table:
 *   ALTER TABLE leases ADD COLUMN IF NOT EXISTS geocached_lat DOUBLE PRECISION;
 *   ALTER TABLE leases ADD COLUMN IF NOT EXISTS geocached_lng DOUBLE PRECISION;
 */

import { supabase } from '@/shared/api/supabaseClient';

export interface GeocacheEntry {
    leaseId: string;
    locationKey: string; // e.g. "New York, US" — the grouping key in LocationsPage
    lat: number;
    lng: number;
}

/**
 * Fetch all cached coordinates from the leases table.
 * Returns a Record<locationKey, {lat, lng}> ready to merge into geocodedLocations state.
 *
 * Note: We store lat/lng per lease, but LocationsPage groups by city/country.
 * We use a separate `geocache` table for location-key-level caching.
 */
export const fetchGeocache = async (): Promise<Record<string, { lat: number; lng: number }>> => {
    const { data, error } = await supabase
        .from('geocache')
        .select('location_key, lat, lng');

    if (error) {
        console.error('[fetchGeocache]', error.message);
        return {};
    }

    const result: Record<string, { lat: number; lng: number }> = {};
    for (const row of data || []) {
        result[row.location_key] = { lat: row.lat, lng: row.lng };
    }
    return result;
};

/**
 * Securely fetch missing geocoordinates through the proxy Edge Function.
 * The Edge Function checks the cache, queries OpenStreetMap Nominatim if missing,
 * mathematically validates the coords, persists them via Service Role (to prevent spoofing), 
 * and returns the results.
 */
export const resolveGeolocations = async (locations: string[]): Promise<Record<string, { lat: number; lng: number }>> => {
    if (!locations || locations.length === 0) return {};

    const { data, error } = await supabase.functions.invoke('proxy-geocache', {
        body: { locations }
    });

    if (error) {
        console.error('[resolveGeolocations] Edge Function Error:', error.message);
        return {};
    }

    if (!data?.success) {
        console.warn('[resolveGeolocations] Geocoding warnings:', data?.error);
        return data?.results || {};
    }

    return data.results || {};
};
