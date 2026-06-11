
import React, { useMemo, useState } from 'react';
import { Lease, LeaseStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { UsersIcon } from '@/shared/ui/Icons/UsersIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { ChevronDownIcon } from '@/shared/ui/Icons/ChevronDownIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';

interface EntitiesPageProps {
  leases: Lease[];
  onViewLease: (lease: Lease) => void;
}

interface EntityData {
  name: string;
  type: 'Landlord' | 'Tenant';
  address?: string;
  leases: Lease[];
  totalValue: number; // Mock metric for visual weight
}

const parseCurrency = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

export const EntitiesPage: React.FC<EntitiesPageProps> = ({ leases, onViewLease }) => {
  const [activeTab, setActiveTab] = useState<'Landlord' | 'Tenant'>('Landlord');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const entities = useMemo(() => {
    const map: Record<string, EntityData> = {};
    const abstractedLeases = leases.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData);

    abstractedLeases.forEach(lease => {
        // We will process both landlord and tenant for every lease
        const extractEntity = (type: 'Landlord' | 'Tenant') => {
            let name = '';
            let addressParts: string[] = [];
            let leaseValue = 0;

            lease.abstractedData.forEach(section => {
                const sTitle = section.title.toLowerCase();
                
                // Get Entity Info
                if (sTitle.includes(type.toLowerCase())) {
                    section.fields.forEach(field => {
                        const label = field.label.toLowerCase();
                        const val = field.value;
                        if (!val) return;

                        if (label.includes('name')) name = val;
                        if (label.includes('street') || label.includes('city') || label.includes('state') || label.includes('zip')) {
                            if (!addressParts.includes(val)) addressParts.push(val);
                        }
                    });
                }

                // Get Rent Value for sorting weight
                if (sTitle.includes('rent') && !sTitle.includes('percentage')) {
                    section.fields.forEach(field => {
                        if (field.label.toLowerCase().includes('monthly') && field.value) {
                            leaseValue = Math.max(leaseValue, parseCurrency(field.value));
                        }
                    });
                }
            });

            if (name && name.length > 2) {
                // Normalize key
                const key = `${type}-${name.trim()}`;
                if (!map[key]) {
                    map[key] = {
                        name: name.trim(),
                        type,
                        address: addressParts.join(', '),
                        leases: [],
                        totalValue: 0
                    };
                }
                // Avoid duplicates lease refs if data is messy
                if (!map[key].leases.some(l => l.id === lease.id)) {
                    map[key].leases.push(lease);
                    map[key].totalValue += leaseValue * 12; // Annualize
                }
            }
        };

        extractEntity('Landlord');
        extractEntity('Tenant');
    });

    return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
  }, [leases]);

  const filteredEntities = entities.filter(e => 
      e.type === activeTab && 
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 pb-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
              <h1 className="text-3xl font-black text-text-main tracking-tight uppercase flex items-center gap-3">
                  <BuildingOfficeIcon className="w-10 h-10 text-indigo-600" />
                  Entity Directory
              </h1>
              <p className="text-slate-500 font-medium mt-1 ml-1">Manage relationships across your portfolio.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="bg-surface p-1 rounded-xl border border-border flex items-center shadow-sm">
                  {['Landlord', 'Tenant'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); setExpandedEntity(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      >
                          {tab}s
                      </button>
                  ))}
              </div>
              <div className="relative group min-w-[280px]">
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab.toLowerCase()}s...`}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
          {filteredEntities.map((entity, idx) => {
              const isExpanded = expandedEntity === entity.name;
              return (
                  <div 
                    key={idx} 
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-500/10' : 'border-border shadow-sm hover:shadow-md hover:border-indigo-300'}`}
                  >
                      <div 
                        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                        onClick={() => setExpandedEntity(isExpanded ? null : entity.name)}
                      >
                          <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${activeTab === 'Landlord' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {entity.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="text-lg font-bold text-text-main">{entity.name}</h3>
                                  <p className="text-sm text-slate-500 mt-1 max-w-xl truncate">{entity.address || 'Address not specified'}</p>
                              </div>
                          </div>

                          <div className="flex items-center gap-8 md:gap-12 pl-16 md:pl-0">
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portfolio Vol.</p>
                                  <p className="text-lg font-mono font-bold text-slate-800">{entity.totalValue > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entity.totalValue) : '-'}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lease Count</p>
                                  <div className="flex items-center justify-end gap-3">
                                      <span className="text-lg font-bold text-text-main">{entity.leases.length}</span>
                                      <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50'}`}>
                                          <ChevronDownIcon className="w-4 h-4" />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                          <div className="border-t border-indigo-100 bg-indigo-50/30 p-6 animate-fade-in">
                              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <DocumentTextIcon className="w-4 h-4" /> Associated Leases
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {entity.leases.map(lease => (
                                      <div key={lease.id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                                          <div className="flex justify-between items-start mb-2">
                                              <span className="font-bold text-sm text-text-main truncate max-w-[150px]">{lease.name}</span>
                                              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{lease.id}</span>
                                          </div>
                                          <div className="flex items-center justify-between mt-4">
                                              <span className="text-xs text-slate-500">{lease.uploadDate.toLocaleDateString()}</span>
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); onViewLease(lease); }}
                                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                              >
                                                  View <EyeIcon className="w-3 h-3" />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              );
          })}
          
          {filteredEntities.length === 0 && (
              <div className="text-center py-24 bg-surface border-2 border-dashed border-border rounded-3xl">
                  <UsersIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-text-main">No {activeTab.toLowerCase()}s found</h3>
                  <p className="text-slate-400 mt-1">Try adjusting your search terms.</p>
              </div>
          )}
      </div>
    </ScrollAnimatedSection>
  );
};
