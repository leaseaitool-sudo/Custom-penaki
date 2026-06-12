import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View } from '@/shared/types';

// Map views to URL paths
export const viewToPathMap: Record<View, string> = {
    'home': '/',
    'pricing': '/pricing',
    'portfolio': '/portfolio',
    'assets': '/assets',
    'abstract': '/abstract',
    'choose-template': '/templates/choose',
    'review-template': '/templates/review',
    'configure-templates': '/templates/configure',
    'batch-review-templates': '/templates/batch-review',
    'history': '/history',
    'locations': '/locations',
    'entities': '/entities',
    'reminders': '/reminders',
    'lease-insights': '/insights',
    'lease-summaries': '/summaries',
    'client-chats': '/chats',
    'workbench': '/workbench',
    'profile': '/profile',
    'terms': '/terms',
    'privacy': '/privacy',
    'product-asset-mapping': '/product/asset-mapping',
    'product-critical-events': '/product/critical-events',
    'product-ai-abstraction': '/product/ai-abstraction',
    'product-ai-assistant': '/product/ai-assistant',
    'product-portfolio-intelligence': '/product/portfolio-intelligence',
    'solution-lease-summaries': '/solution/lease-summaries',
    'solution-document-storage': '/solution/document-storage',
    'solution-expert-verification': '/solution/expert-verification',
    'solution-analytics': '/solution/analytics',
    'solution-due-diligence': '/solution/due-diligence'
};

// Create reverse map for location matching
const pathToViewMap: Record<string, View> = Object.entries(viewToPathMap).reduce((acc, [view, path]) => {
    acc[path] = view as View;
    return acc;
}, {} as Record<string, View>);

export const useNavigation = (initialView: View = 'home') => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [adminFilter, setAdminFilter] = useState<string>('All');

    // Calculate active view from current URL path
    const activeView = useMemo<View>(() => {
        // Find exact match or default to home
        const path = location.pathname;
        return pathToViewMap[path] || 'home';
    }, [location.pathname]);

    const navigateTo = useCallback((view: View) => {
        const path = viewToPathMap[view] || '/';
        navigate(path);
    }, [navigate]);

    const navigateBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleAdminNavigate = useCallback((view: View, filter: string = 'All') => {
        setAdminFilter(filter);
        navigateTo(view);
    }, [navigateTo]);

    return {
        activeView,
        setActiveView: navigateTo,
        navigateBack,
        adminFilter,
        handleAdminNavigate
    };
};
