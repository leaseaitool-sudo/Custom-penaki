
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Lease, LeaseStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { MapPinIcon } from '@/shared/ui/Icons/MapPinIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { FunnelIcon } from '@/shared/ui/Icons/FunnelIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { ChartPieIcon } from '@/shared/ui/Icons/ChartPieIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { setKey, setLanguage, setRegion, setLocationType } from 'react-geocode';
import { fetchGeocache, resolveGeolocations } from '@/shared/api/geocacheService';


// Initialize Geocoder
setKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
setLanguage("en");
setRegion("us");
setLocationType("ROOFTOP");

interface LocationsPageProps {
    leases: Lease[];
    onViewLease: (lease: Lease) => void;
}

type LeaseAssetStatus = 'Active' | 'Expired' | 'Expiring Soon' | 'Pending';

interface EnrichedLease extends Lease {
    computedStatus: LeaseAssetStatus;
    computedRent: number;
    computedArea: number;
    computedExpiry: Date | null;
    address: string;
}

interface LocationData {
    city: string;
    country: string;
    fullLocation: string;
    leases: EnrichedLease[];
    totalArea: number;
    totalRent: number;
    activeCount: number;
    expiredCount: number;
    upcomingCount: number;
    coordinates?: { lat: number; lng: number };
}

const parseCurrency = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

const parseArea = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);


export const LocationsPage: React.FC<LocationsPageProps> = ({ leases, onViewLease }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'count' | 'rent' | 'area' | 'name'>('count');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Has Critical'>('All');

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [geocodedLocations, setGeocodedLocations] = useState<Record<string, { lat: number, lng: number }>>({});
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Load Google Maps Script
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_VISION_API_KEY || ''
    });

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // 1. Process Data
    const baseLocationData = useMemo(() => {
        const mapObj: Record<string, LocationData> = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const abstractedLeases = leases.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData);

        abstractedLeases.forEach(lease => {
            let city = '';
            let country = '';
            let address = '';
            let rent = 0;
            let area = 0;
            let expiryDate: Date | null = null;

            // Extract Data
            lease.abstractedData.forEach(section => {
                const title = section.title.toLowerCase();

                // Location Info
                if (title.includes('premises') || title.includes('property') || title.includes('building') || title.includes('address')) {
                    section.fields.forEach(field => {
                        const label = field.label.toLowerCase();
                        const val = field.value || '';
                        if (!val) return;

                        if (label.includes('city')) city = val;
                        if (label.includes('country')) country = val;
                        if (label.includes('street') || label.includes('address')) address = val;
                    });
                }

                // Financials & Area
                if (title.includes('rental unit') || title.includes('premises') || title.includes('rent') || title.includes('payment')) {
                    section.fields.forEach(field => {
                        const label = field.label.toLowerCase();
                        const val = field.value;
                        if (!val) return;

                        if ((label.includes('gross area') || label.includes('sq ft'))) {
                            area = Math.max(area, parseArea(val));
                        }
                        if ((label.includes('monthly') || label.includes('amount')) && !label.includes('deposit')) {
                            rent = Math.max(rent, parseCurrency(val));
                        }
                    });
                }

                // Dates
                if (title.includes('term') || title.includes('expiry') || title.includes('expiration')) {
                    section.fields.forEach(field => {
                        const label = field.label.toLowerCase();
                        if ((label.includes('end') || label.includes('expiry')) && field.value) {
                            const parsed = new Date(field.value);
                            if (!isNaN(parsed.getTime())) expiryDate = parsed;
                        }
                    });
                }
            });

            // Normalize
            city = city.trim() || 'Unspecified City';
            country = country.trim() || '';
            address = address.trim() || lease.name;

            const key = country ? `${city}, ${country}` : city;

            // Determine Status
            let status: LeaseAssetStatus = 'Active';
            if (expiryDate) {
                if (expiryDate < today) status = 'Expired';
                else {
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 90) status = 'Expiring Soon';
                }
            }

            if (!mapObj[key]) {
                mapObj[key] = {
                    city,
                    country,
                    fullLocation: key,
                    leases: [],
                    totalArea: 0,
                    totalRent: 0,
                    activeCount: 0,
                    expiredCount: 0,
                    upcomingCount: 0
                };
            }

            const enrichedLease: EnrichedLease = {
                ...lease,
                computedStatus: status,
                computedRent: rent,
                computedArea: area,
                computedExpiry: expiryDate,
                address
            };

            mapObj[key].leases.push(enrichedLease);
            mapObj[key].totalArea += area;
            mapObj[key].totalRent += (rent * 12); // Annualized for sorting

            if (status === 'Active') mapObj[key].activeCount++;
            else if (status === 'Expired') mapObj[key].expiredCount++;
            else if (status === 'Expiring Soon') mapObj[key].upcomingCount++;
        });

        return Object.values(mapObj);
    }, [leases]);

    // Load cached geocoordinates from Supabase, then fill in any missing ones via Google API
    useEffect(() => {
        const fetchGeocodes = async () => {
            if (baseLocationData.length === 0) return;
            setIsGeocoding(true);

            // Phase 3: Read from Supabase geocache first — skip Edge calls for known cities
            const cachedCoords = await fetchGeocache();
            const newCoords: Record<string, { lat: number, lng: number }> = { ...cachedCoords };

            const missingLocations = baseLocationData
                .map(loc => loc.fullLocation)
                .filter(loc => loc !== 'Unspecified City' && !newCoords[loc]);

            // Defer missing locations entirely to the secure backend proxy
            if (missingLocations.length > 0) {
                const resolved = await resolveGeolocations(missingLocations);
                Object.assign(newCoords, resolved);
            }

            setGeocodedLocations(newCoords);
            setIsGeocoding(false);
        };

        fetchGeocodes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseLocationData]); // Only re-run when underlying data changes


    // Map coordinates into data
    const locationData = useMemo(() => {
        return baseLocationData.map(loc => ({
            ...loc,
            coordinates: geocodedLocations[loc.fullLocation]
        }));
    }, [baseLocationData, geocodedLocations]);

    // 2. Filter & Sort
    const filteredLocations = useMemo(() => {
        let filtered = locationData.filter(loc =>
            loc.fullLocation.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (statusFilter === 'Has Critical') {
            filtered = filtered.filter(loc => loc.expiredCount > 0 || loc.upcomingCount > 0);
        }

        return filtered.sort((a, b) => {
            if (sortBy === 'count') return b.leases.length - a.leases.length;
            if (sortBy === 'rent') return b.totalRent - a.totalRent;
            if (sortBy === 'area') return b.totalArea - a.totalArea;
            return a.city.localeCompare(b.city);
        });
    }, [locationData, searchTerm, sortBy, statusFilter]);

    const selectedLocation = useMemo(() =>
        selectedLocationKey ? locationData.find(l => l.fullLocation === selectedLocationKey) : null
        , [locationData, selectedLocationKey]);

    // Pan map to selected location
    useEffect(() => {
        if (map && selectedLocation && selectedLocation.coordinates) {
            map.panTo(selectedLocation.coordinates);
            map.setZoom(12);
        } else if (map && filteredLocations.length > 0) {
            // Recenter to bounds if multiple
            const bounds = new google.maps.LatLngBounds();
            let hasValidBounds = false;
            filteredLocations.forEach(loc => {
                if (loc.coordinates) {
                    bounds.extend(loc.coordinates);
                    hasValidBounds = true;
                }
            });
            if (hasValidBounds) {
                map.fitBounds(bounds);
                // Prevent over-zooming on single marker fit
                const listener = google.maps.event.addListener(map, "idle", () => {
                    const currentZoom = map.getZoom();
                    if (currentZoom && currentZoom > 12) map.setZoom(12);
                    google.maps.event.removeListener(listener);
                });
            }
        }
    }, [map, selectedLocation, filteredLocations]);


    const getPinColor = (loc: LocationData) => {
        if (loc.expiredCount > 0) return '#EF4444'; // Red
        if (loc.upcomingCount > 0) return '#F59E0B'; // Amber
        return '#10B981'; // Green
    };

    return (
        <ScrollAnimatedSection className="h-[calc(100vh-100px)] max-w-[95rem] mx-auto p-4 flex gap-4 md:gap-6">

            {/* SIDEBAR: Locations List */}
            <div className="w-1/3 min-w-[340px] bg-white rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden">

                {/* Header & Controls */}
                <div className="p-5 border-b border-border bg-slate-50/80 backdrop-blur-sm z-10">
                    <h2 className="font-bold text-xl text-text-main mb-4 flex items-center gap-2">
                        <MapPinIcon className="w-6 h-6 text-primary" />
                        Portfolio Map
                        <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-full ml-auto shadow-sm">{filteredLocations.length}</span>
                    </h2>

                    <div className="space-y-3">
                        <div className="relative group">
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by city or country..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="flex-1 bg-surface border border-border text-text-main text-xs rounded-lg focus:ring-primary focus:border-primary block p-2"
                            >
                                <option value="count">Sort: Asset Count</option>
                                <option value="rent">Sort: Total Value</option>
                                <option value="area">Sort: Total Area</option>
                                <option value="name">Sort: Name (A-Z)</option>
                            </select>
                            <button
                                onClick={() => setStatusFilter(prev => prev === 'All' ? 'Has Critical' : 'All')}
                                className={`p-2 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1 ${statusFilter === 'Has Critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-surface text-slate-500 border-border hover:border-primary'}`}
                                title="Toggle Critical Only"
                            >
                                <ExclamationCircleIcon className="w-4 h-4" />
                                {statusFilter === 'All' ? 'Filter Risk' : 'Show All'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
                    {filteredLocations.map(loc => {
                        const isActive = selectedLocation?.fullLocation === loc.fullLocation;
                        const hasCritical = loc.expiredCount > 0 || loc.upcomingCount > 0;

                        return (
                            <button
                                key={loc.fullLocation}
                                onClick={() => setSelectedLocationKey(isActive ? null : loc.fullLocation)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-white border-primary ring-1 ring-primary shadow-md z-10'
                                    : 'bg-white border-border hover:border-primary/50 hover:shadow-sm text-text-main'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className={`font-bold text-base truncate ${isActive ? 'text-primary' : 'text-text-main'}`}>{loc.city}</h3>
                                        {loc.country && <p className="text-xs mt-0.5 font-medium text-slate-400 uppercase tracking-wide">{loc.country}</p>}
                                    </div>
                                    {hasCritical && (
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-2 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <BuildingOfficeIcon className="w-3.5 h-3.5" />
                                        <span>{loc.leases.length} Assets</span>
                                    </div>
                                    {loc.totalRent > 0 && (
                                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                            <CurrencyEuroIcon className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: "compact" }).format(loc.totalRent)}</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                    {filteredLocations.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No locations found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT: Map & Detail Overlay */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border shadow-xl overflow-hidden relative">

                {/* THE MAP BACKGROUND */}
                <div className="absolute inset-0 z-0 bg-slate-100">
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
                            {filteredLocations.map(loc => {
                                if (!loc.coordinates) return null;
                                const isSelected = selectedLocation?.fullLocation === loc.fullLocation;
                                return (
                                    <Marker
                                        key={loc.fullLocation}
                                        position={loc.coordinates}
                                        onClick={() => setSelectedLocationKey(loc.fullLocation)}
                                        icon={{
                                            path: google.maps.SymbolPath.CIRCLE,
                                            fillColor: getPinColor(loc),
                                            fillOpacity: isSelected ? 1 : 0.8,
                                            strokeWeight: isSelected ? 3 : 2,
                                            strokeColor: '#FFFFFF',
                                            scale: isSelected ? 12 : 8,
                                        }}
                                    />
                                );
                            })}

                            {selectedLocation && selectedLocation.coordinates && (
                                <InfoWindow
                                    position={selectedLocation.coordinates}
                                    onCloseClick={() => setSelectedLocationKey(null)}
                                    options={{ pixelOffset: new google.maps.Size(0, -15) }}
                                >
                                    <div className="p-2 min-w-[200px]">
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">{selectedLocation.city}</h4>
                                        <div className="flex gap-2 text-xs font-medium text-slate-500 mb-2">
                                            <span>{selectedLocation.activeCount} Active</span>
                                            {selectedLocation.expiredCount > 0 && <span className="text-red-600">{selectedLocation.expiredCount} Expired</span>}
                                        </div>
                                        <div className="text-xs font-bold text-indigo-600">{formatCurrency(selectedLocation.totalRent)} / yr</div>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Maps Engine...</p>
                        </div>
                    )}

                    {isGeocoding && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-3 animate-fade-in z-10">
                            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-slate-600">Resolving Addresses...</span>
                        </div>
                    )}
                </div>

                {/* OVERLAY: Selected Location Detail Card */}
                {selectedLocation && (
                    <div className="absolute inset-x-4 bottom-4 z-10 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[80%] flex flex-col md:max-h-[60%] animate-slide-up">

                        {/* Hero Header */}
                        <div className="p-6 border-b border-border bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-primary mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Selected Region</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedLocation.city}, {selectedLocation.country}</h2>
                                </div>

                                <div className="flex gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Annual Rent</p>
                                        <p className="text-xl font-black text-slate-800">{formatCurrency(selectedLocation.totalRent)}</p>
                                    </div>
                                    <div className="w-px bg-slate-200 h-8 self-center hidden sm:block"></div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total GLA</p>
                                        <p className="text-xl font-black text-slate-800">{formatNumber(selectedLocation.totalArea)} <span className="text-xs font-bold text-slate-400">sq ft</span></p>
                                    </div>
                                    <button onClick={() => setSelectedLocationKey(null)} className="ml-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors self-start">
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Status Summary Bar */}
                            <div className="flex gap-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold border border-green-100">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    {selectedLocation.activeCount} Active
                                </div>
                                {selectedLocation.upcomingCount > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-100">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                        {selectedLocation.upcomingCount} Expiring Soon
                                    </div>
                                )}
                                {selectedLocation.expiredCount > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-md text-[10px] font-bold border border-red-100">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                        {selectedLocation.expiredCount} Expired
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lease Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {selectedLocation.leases.map(lease => (
                                    <div
                                        key={lease.id}
                                        className={`group bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col ${lease.computedStatus === 'Expired' ? 'border-red-200 bg-red-50/20' : lease.computedStatus === 'Expiring Soon' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-primary/30'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${lease.computedStatus === 'Active' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                                    lease.computedStatus === 'Expiring Soon' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                                        'bg-gradient-to-br from-red-500 to-rose-600'
                                                    }`}>
                                                    <DocumentTextIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-800 truncate text-xs" title={lease.address}>{lease.address}</h4>
                                                    <p className="text-[10px] text-slate-400 font-mono truncate">{lease.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Monthly Rent</p>
                                                <p className="text-xs font-bold text-slate-700">{formatCurrency(lease.computedRent)}</p>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Area</p>
                                                <p className="text-xs font-bold text-slate-700">{formatNumber(lease.computedArea)} sq ft</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 border-t border-slate-100 flex justify-between items-center">
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {lease.computedExpiry ? (
                                                    <span>Exp: {lease.computedExpiry.toLocaleDateString()}</span>
                                                ) : (
                                                    <span>No Expiry Set</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onViewLease(lease)}
                                                className="text-[10px] font-bold text-primary hover:text-sky-700 flex items-center gap-1 group/btn px-2 py-1 rounded hover:bg-primary/5 transition-colors"
                                            >
                                                View
                                                <ArrowRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScrollAnimatedSection>
    );
};
