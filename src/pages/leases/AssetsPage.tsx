import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Lease, LeaseStatus } from '@/shared/types';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { setKey, setLanguage, setRegion, setLocationType, fromAddress } from 'react-geocode';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { UserIcon } from '@/shared/ui/Icons/UserIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { MapPinIcon } from '@/shared/ui/Icons/MapPinIcon';
import { FunnelIcon } from '@/shared/ui/Icons/FunnelIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Initialize Geocoder
setKey(GOOGLE_MAPS_API_KEY);
setLanguage("en");
setRegion("us");
setLocationType("ROOFTOP");

// --- TYPES ---
type AssetStatus = 'Active' | 'Expired' | 'Expiring Soon' | 'Pending';
type AccuracyLevel = 'EXACT' | 'CITY' | 'REGION';

interface GeocodedLocation {
    lat: number;
    lon: number;
    accuracyLevel: AccuracyLevel;
    accuracyLabel: string;
}

interface PropertyAsset {
    id: string;
    // Core Data
    addressRaw: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    fullQueryAddress: string;

    // Geocoded Data (Must be populated before render)
    lat: number;
    lon: number;
    accuracyLevel: AccuracyLevel;
    accuracyLabel: string;

    // Business Data
    tenant: string;
    landlord: string;
    rent: number;
    rentFormatted: string;
    leaseId: string;
    leaseName: string;
    status: AssetStatus;
    area: string;
    expiryDate: Date | null;
}

interface AssetsPageProps {
    leases: Lease[];
    onViewLease: (lease: Lease) => void;
}

// --- PERMANENT SESSION CACHE ---
const COORDINATE_CACHE = new Map<string, GeocodedLocation>();
const PENDING_REQUESTS = new Set<string>();

// --- FALLBACK DATABASE (TIER 2 & 3) ---
const CITY_CENTROIDS: Record<string, [number, number]> = {
    "new york": [40.7128, -74.0060], "los angeles": [34.0522, -118.2437], "chicago": [41.8781, -87.6298],
    "houston": [29.7604, -95.3698], "london": [51.5074, -0.1278], "paris": [48.8566, 2.3522],
    "tokyo": [35.6762, 139.6503], "sydney": [-33.8688, 151.2093], "dubai": [25.2048, 55.2708],
    "singapore": [1.3521, 103.8198], "berlin": [52.5200, 13.4050], "toronto": [43.6510, -79.3470],
    "san francisco": [37.7749, -122.4194], "austin": [30.2672, -97.7431], "miami": [25.7617, -80.1918],
    "mumbai": [19.0760, 72.8777], "shanghai": [31.2304, 121.4737], "sao paulo": [-23.5505, -46.6333]
};

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
    "US": [39.8283, -98.5795], "USA": [39.8283, -98.5795], "UK": [55.3781, -3.4360], "GB": [55.3781, -3.4360],
    "CA": [56.1304, -106.3468], "AU": [-25.2744, 133.7751], "DE": [51.1657, 10.4515], "FR": [46.2276, 2.2137],
    "JP": [36.2048, 138.2529], "CN": [35.8617, 104.1954], "IN": [20.5937, 78.9629], "BR": [-14.2350, -51.9253],
    "GLOBAL": [20.0, 0.0]
};



// --- HELPERS ---
const seededRandom = (seed: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) / 4294967296);
};

const applyJitter = (lat: number, lon: number, seed: string, level: AccuracyLevel): [number, number] => {
    const magnitude = level === 'EXACT' ? 0.0001 : level === 'CITY' ? 0.005 : 0.5;
    const r1 = seededRandom(seed + 'lat') - 0.5;
    const r2 = seededRandom(seed + 'lon') - 0.5;
    return [lat + (r1 * magnitude), lon + (r2 * magnitude)];
};

const parseCurrency = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

// --- GEOCODING ENGINE ---
const resolveLocation = async (query: string, city: string, country: string, id: string): Promise<GeocodedLocation> => {
    if (COORDINATE_CACHE.has(id)) return COORDINATE_CACHE.get(id)!;

    if (query.length > 5 && !PENDING_REQUESTS.has(id)) {
        PENDING_REQUESTS.add(id);
        try {
            const response = await fromAddress(query);
            PENDING_REQUESTS.delete(id);

            if (response.results && response.results.length > 0) {
                const result = response.results[0];
                const loc = result.geometry.location;
                const type = result.geometry.location_type;

                const isRooftop = type === 'ROOFTOP' || type === 'RANGE_INTERPOLATED';
                const level: AccuracyLevel = isRooftop ? 'EXACT' : 'CITY';

                const finalLoc = {
                    lat: loc.lat,
                    lon: loc.lng,
                    accuracyLevel: level,
                    accuracyLabel: isRooftop ? 'Verified Address' : 'Approximate Address'
                };

                COORDINATE_CACHE.set(id, finalLoc);
                return finalLoc;
            }
        } catch (e) {
            console.warn(`Geocode Error for ${query}:`, e);
            PENDING_REQUESTS.delete(id);
        }
    }

    const normalizedCity = city.toLowerCase().trim();
    if (CITY_CENTROIDS[normalizedCity]) {
        const [baseLat, baseLon] = CITY_CENTROIDS[normalizedCity];
        const [lat, lon] = applyJitter(baseLat, baseLon, id, 'CITY');
        const loc = { lat, lon, accuracyLevel: 'CITY' as AccuracyLevel, accuracyLabel: 'City Level' };
        COORDINATE_CACHE.set(id, loc);
        return loc;
    }

    let [baseLat, baseLon] = COUNTRY_CENTROIDS[country.toUpperCase()] || COUNTRY_CENTROIDS['GLOBAL'];
    const [lat, lon] = applyJitter(baseLat, baseLon, id, 'REGION');
    const loc = { lat, lon, accuracyLevel: 'REGION' as AccuracyLevel, accuracyLabel: 'Region Level' };
    COORDINATE_CACHE.set(id, loc);
    return loc;
};


// --- MAIN COMPONENT ---
export const AssetsPage: React.FC<AssetsPageProps> = ({ leases, onViewLease }) => {
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | AssetStatus>('All');
    const [minRent, setMinRent] = useState<string>('');
    const [maxRent, setMaxRent] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    // Core State: All assets are guaranteed to have coordinates eventually
    const [mappedAssets, setMappedAssets] = useState<PropertyAsset[]>([]);
    const [isResolving, setIsResolving] = useState(false);

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const hasFitBounds = useRef(false);

    // Load Google Maps Script
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // 1. Extraction (Memoized Raw Data)
    const rawAssets = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return leases.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData).map(lease => {
            let addressRaw = '';
            let city = '';
            let state = '';
            let zip = '';
            let country = '';
            let tenant = 'Unknown Tenant';
            let landlord = 'Unknown Landlord';
            let rent = 0;
            let area = '-';
            let expiryDate: Date | null = null;

            lease.abstractedData.forEach(section => {
                const sTitle = section.title.toLowerCase();
                const isLocationSection = sTitle.includes('premise') || sTitle.includes('property') || sTitle.includes('location') || sTitle.includes('building');

                section.fields.forEach(f => {
                    const l = f.label.toLowerCase();
                    const v = f.value?.trim();
                    if (!v) return;

                    if (isLocationSection) {
                        if (l.includes('street') || l.includes('address')) addressRaw = v;
                        if (l.includes('city')) city = v;
                        if (l.includes('state') || l.includes('province')) state = v;
                        if (l.includes('zip') || l.includes('postal')) zip = v;
                        if (l.includes('country')) country = v;
                    }

                    if (sTitle.includes('tenant') && l.includes('name')) tenant = v;
                    if (sTitle.includes('landlord') && l.includes('name')) landlord = v;
                    if (sTitle.includes('rent') && (l.includes('monthly') || l.includes('amount'))) rent = parseCurrency(v);
                    if ((l.includes('gross area') || l.includes('sq ft'))) area = v;
                    if ((l.includes('end') || l.includes('expiry')) && !expiryDate) {
                        const d = new Date(v);
                        if (!isNaN(d.getTime())) expiryDate = d;
                    }
                });
            });

            // Construct Best Query
            const queryParts = [addressRaw, city, state, zip, country].filter(p => p && p.length > 0);
            let fullQueryAddress = queryParts.join(', ');
            if (fullQueryAddress.length < 5) fullQueryAddress = lease.name;

            // Status Logic
            let status: AssetStatus = 'Active';
            if (lease.status === LeaseStatus.PROCESSING) status = 'Pending';
            else if (expiryDate) {
                if (expiryDate < today) status = 'Expired';
                else {
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 90) status = 'Expiring Soon';
                }
            }

            return {
                id: lease.id,
                leaseId: lease.id,
                leaseName: lease.name,
                addressRaw: addressRaw || lease.name,
                city, state, zip, country,
                fullQueryAddress,
                tenant, landlord, rent,
                rentFormatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rent),
                status,
                area,
                expiryDate,
                // Placeholders - to be filled by Geocoding Effect
                lat: 0,
                lon: 0,
                accuracyLevel: 'REGION' as AccuracyLevel,
                accuracyLabel: 'Pending'
            };
        });
    }, [leases]);

    // 2. Geocoding Effect (The Engine)
    useEffect(() => {
        let isMounted = true;
        setIsResolving(true);

        const resolveAll = async () => {
            const results: PropertyAsset[] = [];
            for (const raw of rawAssets) {
                if (!isMounted) break;
                const loc = await resolveLocation(raw.fullQueryAddress, raw.city, raw.country, raw.id);
                results.push({
                    ...raw,
                    lat: loc.lat,
                    lon: loc.lon,
                    accuracyLevel: loc.accuracyLevel,
                    accuracyLabel: loc.accuracyLabel
                });
                // Gentle delay to avoid hammering Geocoding API limits
                await new Promise(r => setTimeout(r, 150));
            }

            if (isMounted) {
                setMappedAssets(results);
                setIsResolving(false);
            }
        };

        resolveAll();
        return () => { isMounted = false; };
    }, [rawAssets]);

    // 3. Filter Logic
    const finalAssets = useMemo(() => {
        return mappedAssets.filter(a => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                a.addressRaw.toLowerCase().includes(searchLower) ||
                a.tenant.toLowerCase().includes(searchLower) ||
                a.leaseId.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;
            if (statusFilter !== 'All' && a.status !== statusFilter) return false;
            const r = a.rent || 0;
            if (minRent && r < parseFloat(minRent)) return false;
            if (maxRent && r > parseFloat(maxRent)) return false;

            return true;
        });
    }, [mappedAssets, searchTerm, statusFilter, minRent, maxRent]);

    const selectedAsset = useMemo(() => finalAssets.find(a => a.id === selectedAssetId), [finalAssets, selectedAssetId]);

    // 4. Map Panning & Bounds
    useEffect(() => {
        if (!map || finalAssets.length === 0) return;

        if (selectedAsset) {
            map.panTo({ lat: selectedAsset.lat, lng: selectedAsset.lon });
            map.setZoom(selectedAsset.accuracyLevel === 'REGION' ? 6 : selectedAsset.accuracyLevel === 'CITY' ? 12 : 16);
            return;
        }

        if (!hasFitBounds.current) {
            const validCoords = finalAssets.filter(a => a.lat !== 0 || a.lon !== 0);
            if (validCoords.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                validCoords.forEach(a => {
                    bounds.extend({ lat: a.lat, lng: a.lon });
                });
                map.fitBounds(bounds);

                const listener = google.maps.event.addListener(map, "idle", () => {
                    const currentZoom = map.getZoom();
                    if (currentZoom && currentZoom > 14) map.setZoom(14);
                    google.maps.event.removeListener(listener);
                });

                hasFitBounds.current = true;
            }
        }
    }, [map, finalAssets, selectedAsset]);


    const stats = useMemo(() => ({
        total: finalAssets.length,
        active: finalAssets.filter(a => a.status === 'Active' || a.status === 'Expiring Soon').length,
        value: finalAssets.reduce((acc, a) => acc + (a.rent || 0), 0)
    }), [finalAssets]);

    const getPinColor = (status: AssetStatus) => {
        if (status === 'Active') return '#10B981';
        if (status === 'Expired') return '#EF4444';
        if (status === 'Pending') return '#3B82F6';
        return '#F59E0B'; // Expiring Soon
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">

            {/* LEFT SIDEBAR */}
            <div className="w-96 flex-shrink-0 bg-white border-r border-border flex flex-col z-20 shadow-xl relative">
                <div className="p-6 border-b border-border bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-black text-text-main flex items-center gap-2">
                            <MapPinIcon className="w-7 h-7 text-primary" />
                            Assets
                        </h1>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full border border-slate-200">
                            {stats.total}
                        </span>
                    </div>

                    <div className="relative mb-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-200'}`}
                        >
                            <FunnelIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-64 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
                        <div className="p-3 bg-slate-50 rounded-xl border border-border space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full text-xs p-2 rounded border border-border bg-white"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Expiring Soon">Expiring Soon</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Rent Range</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" value={minRent} onChange={(e) => setMinRent(e.target.value)} className="w-1/2 text-xs p-2 rounded border border-border bg-white" />
                                    <input type="number" placeholder="Max" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} className="w-1/2 text-xs p-2 rounded border border-border bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50 relative">
                    {finalAssets.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <MapPinIcon className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">{isResolving ? 'Resolving Locations...' : 'No assets found'}</p>
                        </div>
                    ) : (
                        finalAssets.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => setSelectedAssetId(asset.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedAssetId === asset.id ? 'bg-white border-primary ring-1 ring-primary shadow-lg z-10' : 'bg-white border-border hover:border-primary/50 hover:shadow-md'}`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <h3 className={`font-bold text-sm line-clamp-1 ${selectedAssetId === asset.id ? 'text-primary' : 'text-text-main'}`}>{asset.addressRaw}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border whitespace-nowrap ${asset.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                        asset.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            asset.status === 'Expired' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-text-light mb-2">
                                    <BuildingOfficeIcon className="w-3.5 h-3.5 opacity-70" />
                                    <span className="truncate">{asset.city}, {asset.country}</span>
                                    {/* Accuracy Badge */}
                                    <span className={`text-[9px] px-1.5 rounded border ml-auto font-bold uppercase ${asset.accuracyLevel === 'EXACT' ? 'bg-green-100 text-green-700 border-green-200' :
                                        asset.accuracyLevel === 'CITY' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {asset.accuracyLevel === 'EXACT' ? 'Verified' : asset.accuracyLevel === 'CITY' ? 'City' : 'Approx'}
                                    </span>
                                </div>
                                <div className="text-xs font-mono text-slate-400">
                                    {asset.lat.toFixed(4)}, {asset.lon.toFixed(4)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MAP CONTENT */}
            <div className="flex-1 relative bg-slate-200 z-0">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat: 20, lng: 0 }}
                        zoom={2}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={{
                            zoomControl: true,
                            mapTypeControl: true,
                            streetViewControl: true,
                            fullscreenControl: true
                        }}
                    >
                        {finalAssets.map(asset => {
                            if (asset.lat === 0 && asset.lon === 0) return null;
                            const isSelected = selectedAssetId === asset.id;

                            return (
                                <Marker
                                    key={`${asset.id}-${asset.lat}-${asset.lon}`}
                                    position={{ lat: asset.lat, lng: asset.lon }}
                                    onClick={() => setSelectedAssetId(asset.id)}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        fillColor: getPinColor(asset.status),
                                        fillOpacity: asset.accuracyLevel === 'REGION' ? 0.6 : isSelected ? 1 : 0.8,
                                        strokeWeight: isSelected ? 3 : 2,
                                        strokeColor: '#FFFFFF',
                                        scale: isSelected ? 12 : 8,
                                    }}
                                    zIndex={isSelected ? 1000 : 1}
                                />
                            );
                        })}
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Maps Engine...</p>
                    </div>
                )}

                {/* ASSET DETAIL OVERLAY */}
                {selectedAsset && (
                    <div className="absolute top-6 right-6 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-0 z-10 animate-slide-up flex flex-col overflow-hidden ring-1 ring-black/5">
                        <div className="p-6 pb-4 relative">
                            <button
                                onClick={() => setSelectedAssetId(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-white/50 rounded-full hover:bg-white transition-all"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-2 mb-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedAsset.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    selectedAsset.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                                        selectedAsset.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedAsset.status}
                                </span>
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedAsset.accuracyLevel === 'EXACT' ? 'bg-green-100 text-green-700' :
                                    selectedAsset.accuracyLevel === 'CITY' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedAsset.accuracyLabel}
                                </span>
                            </div>

                            <h2 className="text-xl font-black text-text-main leading-tight mb-1">{selectedAsset.addressRaw}</h2>
                            <p className="text-sm text-text-light flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" /> {selectedAsset.city}, {selectedAsset.country}
                            </p>

                            <div className="mt-3 flex items-center gap-2 text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-500">
                                <span>Lat: {selectedAsset.lat.toFixed(6)}</span>
                                <span className="text-slate-300">|</span>
                                <span>Lon: {selectedAsset.lon.toFixed(6)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
                            <div className="bg-white p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Base Rent</p>
                                <div className="flex items-center gap-1 font-black text-lg text-slate-800">
                                    <CurrencyEuroIcon className="w-5 h-5 text-emerald-500" />
                                    {selectedAsset.rentFormatted}
                                </div>
                            </div>
                            <div className="bg-white p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Leasable Area</p>
                                <div className="flex items-center gap-1 font-bold text-lg text-slate-800">
                                    {selectedAsset.area}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tenant Name</p>
                                    <p className="font-bold text-text-main truncate" title={selectedAsset.tenant}>{selectedAsset.tenant}</p>
                                </div>
                            </div>
                            {selectedAsset.expiryDate && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shrink-0">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expiration Date</p>
                                        <p className="font-bold text-text-main">{selectedAsset.expiryDate.toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0">
                            <button
                                onClick={() => {
                                    const lease = leases.find(l => l.id === selectedAsset.leaseId);
                                    if (lease) onViewLease(lease);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-sky-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 group"
                            >
                                <EyeIcon className="w-5 h-5" />
                                Open Full Abstract
                                <ArrowRightIcon className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
