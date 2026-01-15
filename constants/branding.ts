/**
 * GATTED Branding Configuration
 * Centralized branding constants for the entire application.
 * Update values here to change branding across the app.
 */

export const Branding = {
    // App Identity
    appName: 'GATTED',
    tagline: 'Secure Society Management',

    // Brand Colors
    colors: {
        primary: '#2563eb',
        primaryLight: '#dbeafe',
        primaryDark: '#1d4ed8',
        gradient: ['#2563eb', '#1d4ed8'] as const,
    },

    // Asset paths (require statements for bundling)
    assets: {
        icon: require('@/assets/images/icon.png'),
        splashIcon: require('@/assets/images/splash-icon.png'),
        favicon: require('@/assets/images/favicon.png'),
    },
} as const;

export type BrandingType = typeof Branding;
export default Branding;
