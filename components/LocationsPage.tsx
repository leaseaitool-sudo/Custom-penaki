
import React, { useMemo, useState } from 'react';
import { Lease, LeaseStatus } from '../types';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { MapPinIcon } from './icons/MapPinIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { EyeIcon } from './icons/EyeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CurrencyEuroIcon } from './icons/CurrencyEuroIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { FunnelIcon } from './icons/FunnelIcon'; // Assuming this exists from previous step
import { CalendarIcon } from './icons/CalendarIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

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

  // 1. Process Data
  const locationData = useMemo(() => {
    const map: Record<string, LocationData> = {};
    const today = new Date();
    today.setHours(0,0,0,0);

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
                 if(!val) return;

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

      if (!map[key]) {
        map[key] = {
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

      map[key].leases.push(enrichedLease);
      map[key].totalArea += area;
      map[key].totalRent += (rent * 12); // Annualized for sorting
      
      if (status === 'Active') map[key].activeCount++;
      else if (status === 'Expired') map[key].expiredCount++;
      else if (status === 'Expiring Soon') map[key].upcomingCount++;
    });

    return Object.values(map);
  }, [leases]);

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
    selectedLocationKey ? locationData.find(l => l.fullLocation === selectedLocationKey) : (filteredLocations.length > 0 ? filteredLocations[0] : null)
  , [locationData, selectedLocationKey, filteredLocations]);

  return (
    <ScrollAnimatedSection className="h-[calc(100vh-100px)] max-w-[95rem] mx-auto p-4 flex gap-6">
      
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
                onClick={() => setSelectedLocationKey(loc.fullLocation)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                  isActive 
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

      {/* MAIN CONTENT: Location Detail */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border shadow-xl overflow-hidden relative">
        {selectedLocation ? (
            <>
                {/* Hero Header */}
                <div className="p-8 border-b border-border bg-gradient-to-r from-slate-50 via-white to-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <MapPinIcon className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Region Profile</span>
                            </div>
                            <h1 className="text-4xl font-black text-text-main tracking-tight mb-1">{selectedLocation.city}</h1>
                            <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
                                {selectedLocation.country}
                                {selectedLocation.leases.length > 1 && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-bold">Multiple Sites</span>}
                            </p>
                        </div>
                        
                        <div className="flex gap-6 bg-white/60 p-4 rounded-xl border border-slate-100 backdrop-blur-sm shadow-sm">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Annual Rent</p>
                                <p className="text-2xl font-black text-slate-800">{formatCurrency(selectedLocation.totalRent)}</p>
                            </div>
                            <div className="w-px bg-slate-200 h-10 self-center"></div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total GLA</p>
                                <p className="text-2xl font-black text-slate-800">{formatNumber(selectedLocation.totalArea)} <span className="text-xs font-bold text-slate-400">sq ft</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Status Summary Bar */}
                    <div className="flex gap-4 mt-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {selectedLocation.activeCount} Active
                        </div>
                        {selectedLocation.upcomingCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                {selectedLocation.upcomingCount} Expiring Soon
                            </div>
                        )}
                        {selectedLocation.expiredCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {selectedLocation.expiredCount} Expired
                            </div>
                        )}
                    </div>
                </div>

                {/* Lease Grid */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {selectedLocation.leases.map(lease => (
                            <div 
                                key={lease.id} 
                                className={`group bg-white p-5 rounded-xl border shadow-sm hover:shadow-lg transition-all flex flex-col ${lease.computedStatus === 'Expired' ? 'border-red-200 bg-red-50/20' : lease.computedStatus === 'Expiring Soon' ? 'border-amber-200 bg-amber-50/20' : 'border-border hover:border-primary/30'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                                            lease.computedStatus === 'Active' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                            lease.computedStatus === 'Expiring Soon' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                            'bg-gradient-to-br from-red-500 to-rose-600'
                                        }`}>
                                            <DocumentTextIcon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-text-main truncate text-sm" title={lease.address}>{lease.address}</h4>
                                            <p className="text-xs text-slate-400 font-mono truncate">{lease.name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                        lease.computedStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                        lease.computedStatus === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {lease.computedStatus}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Monthly Rent</p>
                                        <p className="text-sm font-bold text-slate-700">{formatCurrency(lease.computedRent)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Area</p>
                                        <p className="text-sm font-bold text-slate-700">{formatNumber(lease.computedArea)} sq ft</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {lease.computedExpiry ? (
                                            <span>Exp: {lease.computedExpiry.toLocaleDateString()}</span>
                                        ) : (
                                            <span>No Expiry Set</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => onViewLease(lease)}
                                        className="text-xs font-bold text-primary hover:text-sky-700 flex items-center gap-1 group/btn bg-primary/5 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors"
                                    >
                                        View Full Abstract
                                        <ArrowRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                    <MapPinIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Select a Location</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">
                    Choose a city from the sidebar to view asset performance and lease details.
                </p>
            </div>
        )}
      </div>
    </ScrollAnimatedSection>
  );
};
