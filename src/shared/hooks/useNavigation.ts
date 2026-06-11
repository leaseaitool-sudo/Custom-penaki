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
    'admin': '/admin',
    'superadmin': '/superadmin',
    'reviewer': '/reviewer',
    'admin-clients': '/admin/clients',
    'admin-completed-reviews': '/admin/completed-reviews',
    'admin-review-queue': '/admin/queue',
    'admin-amendments': '/admin/amendments',
    'admin-workbench': '/admin/workbench',
    'admin-dashboard': '/admin/dashboard',
    'admin-analytics': '/admin/analytics',
    'admin-ai-leases': '/admin/ai-leases',
    'admin-total-activity': '/admin/activity',
    'admin-client-detail': '/admin/client',
    'admin-bookings': '/admin/bookings',
    'admin-reviewers': '/admin/reviewers',
    'admin-chats': '/admin/chats',
    'admin-lease-database': '/admin/database',
    'reviewer-dashboard': '/reviewer/dashboard',
    'reviewer-workbench': '/reviewer/workbench',
    'reviewer-activity': '/reviewer/activity',
    'reviewer-amendments': '/reviewer/amendments',
    'reviewer-chats': '/reviewer/chats',
    'client-chats': '/chats',
    'deploy-admins': '/superadmin/deploy',
    'org-detail': '/superadmin/org',
    'profile': '/profile',
    'terms': '/terms',
    'privacy': '/privacy',
    'product-1': '/product/1',
    'product-2': '/product/2',
    'product-3': '/product/3',
    'product-4': '/product/4',
    'product-5': '/product/5',
    'solution-1': '/solution/1',
    'solution-2': '/solution/2',
    'solution-3': '/solution/3',
    'solution-4': '/solution/4',
    'solution-5': '/solution/5'
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
