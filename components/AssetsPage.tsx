
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Lease, LeaseStatus } from '../types';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { UserIcon } from './icons/UserIcon';
import { CurrencyEuroIcon } from './icons/CurrencyEuroIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { EyeIcon } from './icons/EyeIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { FunnelIcon } from './icons/FunnelIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon'; // Assuming availability or replace

const GOOGLE_MAPS_API_KEY = 'AIzaSyA5R8JZ32na6sxADGzoYkcBDigh-CG_NqE';

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
// Stores resolved coordinates to prevent jumping/re-fetching during session
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

// Deterministic Pseudo-Random Generator based on string seed
// Ensures the same asset always gets the same jitter, preventing "walking" markers
const seededRandom = (seed: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) / 4294967296);
};

// Apply jitter to coordinates to prevent overlap
// exact: very small jitter (meters)
// city: medium jitter (blocks)
// region: large jitter (kms)
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

// Resolves a location guarantee. Never returns null.
const resolveLocation = async (query: string, city: string, country: string, id: string): Promise<GeocodedLocation> => {
    // 1. Check Cache
    if (COORDINATE_CACHE.has(id)) return COORDINATE_CACHE.get(id)!;

    // 2. Try API (Tier 1)
    if (query.length > 5 && !PENDING_REQUESTS.has(id)) {
        PENDING_REQUESTS.add(id);
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            
            PENDING_REQUESTS.delete(id);

            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
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
            console.error("Geocode Error", e);
            PENDING_REQUESTS.delete(id);
        }
    }

    // 3. Fallback to City (Tier 2)
    const normalizedCity = city.toLowerCase().trim();
    if (CITY_CENTROIDS[normalizedCity]) {
        const [baseLat, baseLon] = CITY_CENTROIDS[normalizedCity];
        const [lat, lon] = applyJitter(baseLat, baseLon, id, 'CITY');
        const loc = { lat, lon, accuracyLevel: 'CITY' as AccuracyLevel, accuracyLabel: 'City Level' };
        COORDINATE_CACHE.set(id, loc);
        return loc;
    }

    // 4. Fallback to Country/Global (Tier 3)
    // Try to find country in centroids, default to Global
    let [baseLat, baseLon] = COUNTRY_CENTROIDS[country.toUpperCase()] || COUNTRY_CENTROIDS['GLOBAL'];
    const [lat, lon] = applyJitter(baseLat, baseLon, id, 'REGION');
    const loc = { lat, lon, accuracyLevel: 'REGION' as AccuracyLevel, accuracyLabel: 'Region Level' };
    COORDINATE_CACHE.set(id, loc);
    return loc;
};

// --- ICONS ---

const createMarkerIcon = (status: AssetStatus, selected: boolean, accuracy: AccuracyLevel) => {
    let color = '#64748B'; // Slate (Default)
    if (status === 'Active') color = '#10B981'; // Emerald
    else if (status === 'Expiring Soon') color = '#F59E0B'; // Amber
    else if (status === 'Pending') color = '#3B82F6'; // Blue
    else if (status === 'Expired') color = '#EF4444'; // Red

    // Size logic
    const size = selected ? 48 : 36;
    
    // Style logic for accuracy tiers
    // EXACT: Solid color, White Dot
    // CITY: Solid color, White Dot (Same visual, just data difference)
    // REGION: Faded opacity to indicate approximate
    const opacity = accuracy === 'REGION' ? 0.6 : 1;

    // Professional Pin SVG from ProductAssetMapping
    const svgHtml = `
        <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3)); transition: all 0.3s ease; opacity: ${opacity};">
            <path d="M18 0C10.268 0 4 6.268 4 14C4 23.5 18 36 18 36C18 36 32 23.5 32 14C32 6.268 25.732 0 18 0Z" fill="${color}"/>
            <circle cx="18" cy="14" r="6" fill="white"/>
            ${selected ? `<circle cx="18" cy="14" r="3" fill="${color}"/>` : ''}
        </svg>
    `;

    return L.divIcon({
        className: 'custom-map-marker',
        html: svgHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size], // Tip of pin at bottom center
        popupAnchor: [0, -size] // Popup above pin
    });
};

// --- MAP CONTROLLER ---
const MapController: React.FC<{ assets: PropertyAsset[], selectedId: string | null }> = ({ assets, selectedId }) => {
    const map = useMap();
    const hasFitBounds = useRef(false);

    useEffect(() => {
        if (assets.length === 0) return;

        // 1. Handle Selection FlyTo
        if (selectedId) {
            const target = assets.find(a => a.id === selectedId);
            if (target) {
                map.flyTo([target.lat, target.lon], target.accuracyLevel === 'REGION' ? 6 : target.accuracyLevel === 'CITY' ? 12 : 16, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            }
            return;
        }

        // 2. Initial FitBounds (Only once)
        if (!hasFitBounds.current && assets.length > 0) {
            // Filter out 0,0 if any slipped through (shouldn't happen)
            const validCoords = assets.filter(a => a.lat !== 0 || a.lon !== 0).map(a => [a.lat, a.lon] as [number, number]);
            
            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
                hasFitBounds.current = true;
            }
        }
    }, [assets, selectedId, map]);

    return null;
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

    // 1. Extraction (Memoized Raw Data)
    const rawAssets = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);

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
            // Check which assets are missing from current state or cache
            const results: PropertyAsset[] = [];
            
            // Process sequentially to be polite to API but allow UI updates
            for (const raw of rawAssets) {
                if (!isMounted) break;
                
                // Get Location (Sync from cache or Async from API/Fallback)
                // This function guarantees a return value, never null.
                const loc = await resolveLocation(raw.fullQueryAddress, raw.city, raw.country, raw.id);
                
                results.push({
                    ...raw,
                    lat: loc.lat,
                    lon: loc.lon,
                    accuracyLevel: loc.accuracyLevel,
                    accuracyLabel: loc.accuracyLabel
                });
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

    const stats = useMemo(() => ({
        total: finalAssets.length,
        active: finalAssets.filter(a => a.status === 'Active' || a.status === 'Expiring Soon').length,
        value: finalAssets.reduce((acc, a) => acc + (a.rent || 0), 0)
    }), [finalAssets]);

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
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border whitespace-nowrap ${
                                        asset.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
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
                                    <span className={`text-[9px] px-1.5 rounded border ml-auto font-bold uppercase ${
                                        asset.accuracyLevel === 'EXACT' ? 'bg-green-100 text-green-700 border-green-200' :
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
            <div className="flex-1 relative bg-slate-200">
                <MapContainer 
                    center={[20, 0]} 
                    zoom={2} 
                    minZoom={2}
                    scrollWheelZoom={true}
                    zoomControl={false}
                    className="z-0"
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    />
                    
                    <MapController assets={finalAssets} selectedId={selectedAssetId} />

                    {finalAssets.map(asset => (
                        <Marker 
                            key={`${asset.id}-${asset.lat}-${asset.lon}`} 
                            position={[asset.lat, asset.lon]} 
                            icon={createMarkerIcon(asset.status, selectedAssetId === asset.id, asset.accuracyLevel)}
                            eventHandlers={{
                                click: () => setSelectedAssetId(asset.id)
                            }}
                            zIndexOffset={selectedAssetId === asset.id ? 1000 : 0}
                        />
                    ))}
                </MapContainer>

                {/* ASSET DETAIL CARD */}
                {selectedAsset && (
                    <div className="absolute top-6 right-6 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-0 z-[1000] animate-slide-up flex flex-col overflow-hidden ring-1 ring-black/5">
                        <div className="p-6 pb-4 relative">
                            <button 
                                onClick={() => setSelectedAssetId(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-white/50 rounded-full hover:bg-white transition-all"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    selectedAsset.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    selectedAsset.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {selectedAsset.status}
                                </span>
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    selectedAsset.accuracyLevel === 'EXACT' ? 'bg-green-100 text-green-700' :
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
                                    if(lease) onViewLease(lease);
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
