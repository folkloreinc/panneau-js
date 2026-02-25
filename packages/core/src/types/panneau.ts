/**
 * Panneau Definition Types
 * TypeScript interfaces for main Panneau configuration and definitions
 */
import { Resource } from './resource';

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
    [key: string]: string;
}

/**
 * Page definition
 */
export interface Page {
    component: string;
    [key: string]: unknown;
}

export interface PanneauTheme {
    colorScheme?: string | null;
    [key: string]: unknown;
}

export interface PanneauComponents {
    [key: string]:
        | string
        | {
              component: string;
              [key: string]: unknown;
          };
}

export interface PanneauIntlValues {
    [key: string]: string;
}

export interface PanneauIntl {
    locale?: string;
    locales?: string[];
    messages?: Record<string, string>;
    values?: PanneauIntlValues;
}

/**
 * Panneau definition (main configuration)
 */
export interface PanneauDefinition {
    name?: string;
    resources?: Resource[];
    routes?: Routes;
    pages?: Record<string, Page>;
    intl?: PanneauIntl;
    theme?: PanneauTheme;
    components?: PanneauComponents;
    settings?: Record<string, unknown>;
}

/**
 * Generic definition
 */
export interface Definition {
    name?: string;
    [key: string]: unknown;
}
