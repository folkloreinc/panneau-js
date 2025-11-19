/**
 * Panneau Definition Types
 * TypeScript interfaces for main Panneau configuration and definitions
 */

import { Intl, Resource } from './resource';

/**
 * Panneau route configuration
 */
export interface Routes {
    'resources.index': string;
    'resources.create': string;
    'resources.store': string;
    'resources.show': string;
    'resources.edit': string;
    'resources.update': string;
    'resources.delete': string;
    'resources.destroy': string;
    'resources.duplicate': string;
    'resources.clone': string;
    'resources.restore': string;
}

/**
 * Page definition
 */
export interface Page {
    component: string;
    [key: string]: unknown;
}

/**
 * Panneau definition (main configuration)
 */
export interface PanneauDefinition {
    name?: string;
    resources?: Resource[];
    routes?: Routes;
    pages?: Record<string, Page>;
    intl?: Intl;
}

/**
 * Generic definition
 */
export interface Definition {
    name?: string;
    [key: string]: unknown;
}
