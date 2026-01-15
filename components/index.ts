/**
 * GATTED Components Library
 * 
 * This file provides the main exports for reusable UI components.
 * 
 * Structure:
 * - design-system/  → Portable, reusable components (Button, PageHeader, etc.)
 * - features/       → App-specific components (VisitorCard, ParcelCard, etc.)
 */

// Design System - Portable, reusable components
export * from './design-system';

// Features - App-specific components
export * from './features';

// Legacy root-level components (for backward compatibility)
export { Card, StatusBadge } from './Card';
export { EmptyState } from './EmptyState';
export { ErrorBoundary } from './ErrorBoundary';
export { LoadingSpinner } from './LoadingSpinner';
export { QRCodeDisplay } from './QRCodeDisplay';

