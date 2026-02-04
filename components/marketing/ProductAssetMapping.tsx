import React, { useState, useEffect, useMemo } from 'react';
import { Footer } from '../Footer';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { MapPinIcon } from '../icons/MapPinIcon';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { CurrencyEuroIcon } from '../icons/CurrencyEuroIcon';
import { ChartPieIcon } from '../icons/ChartPieIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { View } from '../../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import '../../styles/HomePage.css';

// Icons used in this file
export const GlobeAmericasIconComponent = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

const BackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute bg-sky-200 w-[40rem] h-[40rem] rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply opacity-40 blur-[80px]"></div>
        <div className="absolute bg-indigo-200 w-[40rem] h-[40rem] rounded-full top-1/4 right-0 translate-x-1/2 mix-blend-multiply opacity-40 blur-[80px]"></div>
        <div className="absolute bg-purple-100 w-[30rem] h-[30rem] rounded-full bottom-0 left-1/4 mix-blend-multiply opacity-40 blur-[80px]"></div>
    </div>
);

// --- REAL MAP COMPONENTS ---

const MOCK_LOCATIONS = [
    { id: 1, lat: 40.7484, lng: -73.9857, title: "Empire State Building", city: "New York", type: "Office", rent: "$145,000 / mo", status: "Active" },
    { id: 2, lat: 51.5045, lng: -0.0865, title: "The Shard", city: "London", type: "Mixed Use", rent: "£82,000 / mo", status: "Active" },
    { id: 3, lat: 35.6586, lng: 139.7454, title: "Tokyo Tower Place", city: "Tokyo", type: "Commercial", rent: "¥12,000,000 / mo", status: "Active" },
    { id: 4, lat: 48.8584, lng: 2.2945, title: "Tour Eiffel Business Ctr", city: "Paris", type: "Office", rent: "€95,000 / mo", status: "Expired" },
    { id: 5, lat: 1.2834, lng: 103.8607, title: "Marina Bay Sands Retail", city: "Singapore", type: "Retail", rent: "S$210,000 / mo", status: "Active" },
    { id: 6, lat: -33.8568, lng: 151.2153, title: "Sydney Opera House Shops", city: "Sydney", type: "Retail", rent: "A$65,000 / mo", status: "Expiring Soon" },
    { id: 7, lat: 52.5200, lng: 13.4050, title: "Alexanderplatz Complex", city: "Berlin", type: "Office", rent: "€78,000 / mo", status: "Active" },
    { id: 8, lat: 37.7941, lng: -122.4078, title: "Transamerica Pyramid", city: "San Francisco", type: "Office", rent: "$210,000 / mo", status: "Active" },
];

const createCustomIcon = (type: string, status: string, isSelected: boolean) => {
    let color = '#64748B';
    if (status === 'Active') color = '#10B981';
    else if (status === 'Expired') color = '#EF4444';
    else if (status === 'Expiring Soon') color = '#F59E0B';

    const size = isSelected ? 48 : 36;

    // Professional Pin SVG
    const svgHtml = `
        <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3)); transition: all 0.3s ease;">
            <path d="M18 0C10.268 0 4 6.268 4 14C4 23.5 18 36 18 36C18 36 32 23.5 32 14C32 6.268 25.732 0 18 0Z" fill="${color}"/>
            <circle cx="18" cy="14" r="6" fill="white"/>
            ${isSelected ? `<circle cx="18" cy="14" r="3" fill="${color}"/>` : ''}
        </svg>
    `;

    return L.divIcon({
        className: 'custom-map-marker',
        html: svgHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size]
    });
};

const InteractiveMap = () => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const markers = useMemo(() => MOCK_LOCATIONS.map(loc => (
        <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]} 
            icon={createCustomIcon(loc.type, loc.status, selectedId === loc.id)}
            eventHandlers={{
                click: () => setSelectedId(loc.id)
            }}
        >
            <Popup className="custom-popup" closeButton={false}>
                <div className="p-1 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${loc.status === 'Active' ? 'bg-green-100 text-green-700' : loc.status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {loc.status === 'Expiring Soon' ? 'Expiring' : loc.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Ref #{loc.id}00</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-0.5">{loc.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">{loc.city}, {loc.type}</p>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600">{loc.rent}</span>
                        <button className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors">Details</button>
                    </div>
                </div>
            </Popup>
        </Marker>
    )), [selectedId]);

    if (!isMounted) {
        return (
            <div className="w-full h-[400px] lg:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-100 animate-pulse flex items-center justify-center">
                <p className="text-slate-400 font-medium">Loading Map...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] lg:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative isolate group touch-pan-y bg-slate-50">
            {/* Map UI Overlay */}
            <div className="absolute top-4 left-4 right-4 md:right-auto md:w-72 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Portfolio View</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Assets</span>
                        <span className="font-bold text-slate-900">142</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full w-[80%]"></div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100 whitespace-nowrap">128 Active</span>
                        <span className="text-[10px] px-2 py-1 bg-red-50 text-red-700 rounded border border-red-100 whitespace-nowrap">14 Expired</span>
                    </div>
                </div>
            </div>

            <MapContainer 
                center={[25, 10]} 
                zoom={2}
                minZoom={2}
                scrollWheelZoom={false} 
                dragging={true}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                />
                {markers}
            </MapContainer>
        </div>
    );
};

export const ProductAssetMapping: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 bg-grid-pattern relative">
            <BackgroundBlobs />
            
            {/* 1. Hero Section */}
            <section className="relative pt-20 md:pt-28 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden">
                
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-bold uppercase tracking-wide mb-6 md:mb-8 animate-fade-in border border-primary/20 bg-white/80 backdrop-blur">
                        <GlobeAmericasIconComponent className="w-4 h-4 md:w-5 md:h-5" />
                        Global Intelligence
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-slate-900 tracking-tight mb-6 md:mb-8 leading-[1.1] animate-slide-up">
                        Command Your <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-purple-600">
                            Real Estate Empire
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed animate-slide-up font-medium px-2" style={{animationDelay: '0.1s'}}>
                        Turn scattered lease documents into a dynamic, geospatial command center. 
                        Penaki automatically extracts address data to visualize your portfolio's reach, density, and performance.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up px-4 md:px-0" style={{animationDelay: '0.2s'}}>
                        <button onClick={onBookDemo} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-2xl hover:bg-primary transition-all transform hover:-translate-y-1 hover:shadow-primary/30 flex items-center justify-center gap-2 group">
                            Book a Demo <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => onNavigate('abstract')} className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all hover:shadow-lg">
                            Upload a Lease
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. Interactive Map Section */}
            <ScrollAnimatedSection className="py-8 md:py-12 px-4 md:px-6 max-w-[95rem] mx-auto">
                <div className="relative">
                    {/* Decorative Elements */}
                    <div className="absolute -left-4 md:-left-12 top-1/4 w-16 h-16 md:w-24 md:h-24 bg-rose-400/20 rounded-full blur-2xl"></div>
                    <div className="absolute -right-4 md:-right-12 bottom-1/4 w-20 h-20 md:w-32 md:h-32 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    
                    <InteractiveMap />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 max-w-6xl mx-auto">
                    <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-sky-100 text-primary rounded-xl flex items-center justify-center mb-4 md:mb-6">
                            <MapPinIcon className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-800">Auto-Geocoding</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            Upload a lease PDF and our AI instantly extracts the address, verifies it against global databases, and pins it to your map with 99.9% precision.
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                            <BuildingOfficeIcon className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-800">Cluster Analysis</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            Visualise portfolio density. Identify over-exposure in specific markets or discover consolidation opportunities in high-rent zones.
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                            <GlobeAmericasIconComponent className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-800">Regional Risk</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            Overlay critical data like lease expirations or upcoming break options on the map. Spot regional turnover risks before they become vacancies.
                        </p>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* 3. Deep Dive Content */}
            <ScrollAnimatedSection className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-gradient-to-b from-indigo-500/20 to-transparent rounded-full blur-[80px] md:blur-[100px] pointer-events-none -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-t from-emerald-500/10 to-transparent rounded-full blur-[80px] md:blur-[100px] pointer-events-none -ml-32 -mb-32"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 leading-tight">
                            From Static Text to <br/>
                            <span className="text-indigo-400">Dynamic Coordinates.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 mb-8 md:mb-10 leading-relaxed font-light">
                            Manual address entry is error-prone and slow. Penaki's AI extracts the "Premises" clause from any lease format, validates the address, and standardizes it for global mapping.
                        </p>
                        <ul className="space-y-4 md:space-y-6 inline-block text-left">
                            {[
                                'Eliminates manual data entry errors',
                                'Standardizes city and state formats automatically',
                                'Supports international address formats (100+ countries)',
                                'Links map pins directly to source documents'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 md:gap-4 group">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors border border-indigo-500/30 flex-shrink-0">
                                        <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                    <span className="font-medium text-slate-200 text-base md:text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative mt-8 lg:mt-0">
                        <div className="absolute inset-0 bg-primary/20 blur-[60px] md:blur-[80px] rounded-full animate-pulse-slow"></div>
                        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl">
                            <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-700 pb-4 md:pb-6">
                                <span className="font-mono text-xs md:text-sm text-primary font-bold tracking-wider">AI EXTRACTION LOG</span>
                                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 rounded-full border border-emerald-500/30">CONFIDENCE: 99.8%</span>
                            </div>
                            <div className="space-y-4 md:space-y-6 font-mono text-xs md:text-sm">
                                <div className="space-y-2">
                                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Source Text (OCR)</p>
                                    <p className="text-slate-300 bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-700/50 leading-relaxed italic">
                                        "...the premises located at <span className="text-white bg-indigo-500/30 px-1 rounded">123 Innovation Drive, Suite 400, San Francisco, CA 94105</span>, consisting of approximately 12,500 rentable square feet..."
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="bg-slate-700/30 p-3 md:p-4 rounded-xl border border-slate-600/50">
                                        <p className="text-slate-500 text-[10px] md:text-xs mb-1 font-bold">Latitude</p>
                                        <p className="text-sky-400 font-bold text-sm md:text-base">37.7749° N</p>
                                    </div>
                                    <div className="bg-slate-700/30 p-3 md:p-4 rounded-xl border border-slate-600/50">
                                        <p className="text-slate-500 text-[10px] md:text-xs mb-1 font-bold">Longitude</p>
                                        <p className="text-sky-400 font-bold text-sm md:text-base">122.4194° W</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* 4. Use Case Grid */}
            <ScrollAnimatedSection className="py-16 md:py-24 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-3xl font-black text-slate-900 mb-4">Strategic Location Intelligence</h2>
                        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
                            Go beyond simple dots on a map. Use spatial data to drive better real estate decisions.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* 1. Market Penetration */}
                        <div className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur border border-slate-100 hover:border-emerald-200 transition-colors group cursor-default shadow-sm">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <ChartPieIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Market Penetration</h3>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                Visualize your footprint against target markets. See where you are over-indexed or where you have white space for expansion.
                            </p>
                        </div>
                        
                        {/* 2. Expiry Heatmaps */}
                        <div className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur border border-slate-100 hover:border-amber-200 transition-colors group cursor-default shadow-sm">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Lease Expiry Heatmaps</h3>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                Color-code assets based on remaining lease term. Instantly spot regions with high turnover risk or upcoming renewals in the next 12 months.
                            </p>
                        </div>

                        {/* 3. Occupancy Layers */}
                        <div className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur border border-slate-100 hover:border-indigo-200 transition-colors group cursor-default shadow-sm">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <UsersIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Occupancy Optimization</h3>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                Filter map views by occupancy status. Identify underutilized assets and geographically group them for strategic disposal or consolidation.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* 5. Final CTA */}
            <ScrollAnimatedSection className="py-16 md:py-24 text-center bg-indigo-50 border-t border-indigo-100">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">Ready to see your portfolio in a new light?</h2>
                    <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 font-medium">
                        Stop managing addresses in Excel. Switch to the map view that updates itself.
                    </p>
                    <button onClick={onBookDemo} className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-xl font-bold shadow-2xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 text-lg">
                        Schedule a Demo
                    </button>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};