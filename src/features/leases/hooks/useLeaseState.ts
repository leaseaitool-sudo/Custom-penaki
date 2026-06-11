import { useState, useCallback } from 'react';
import { Lease } from '@/shared/types';

/**
 * Custom hook encapsulating ephemeral lease state.
 * Data is now sourced exclusively from Supabase, removing insecure localStorage caching.
 */
export const useLeaseState = () => {
    const [leases, setLeases] = useState<Lease[]>([]);

    // Convenience: add a lease
    const addLease = useCallback((lease: Lease) => {
        setLeases(prev => [...prev, lease]);
    }, []);

    // Convenience: update a lease by ID
    const updateLease = useCallback((leaseId: string, updates: Partial<Lease>) => {
        setLeases(prev => prev.map(l => l.id === leaseId ? { ...l, ...updates } : l));
    }, []);

    // Convenience: remove a lease by ID
    const removeLease = useCallback((leaseId: string) => {
        setLeases(prev => prev.filter(l => l.id !== leaseId));
    }, []);

    return { leases, setLeases, addLease, updateLease, removeLease };
};
