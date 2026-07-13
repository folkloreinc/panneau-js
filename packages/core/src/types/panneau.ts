/**
 * Panneau Definition Types
 * TypeScript interfaces for main Panneau configuration and definitions
 */
import { PageDefinition, RouteDefinition } from './core';
import { FieldDefinition, FormDefinition } from './form';
import { Resource, ResourcePages } from './resource';

/**
 * Panneau route configuration
 */
export interface Routes {
    'resources.index': RouteDefinition | string;
    'resources.create': RouteDefinition | string;
    'resources.store': RouteDefinition | string;
    'resources.show': RouteDefinition | string;
    'resources.edit': RouteDefinition | string;
    'resources.update': RouteDefinition | string;
    'resources.delete': RouteDefinition | string;
    'resources.destroy': RouteDefinition | string;
    'resources.duplicate': RouteDefinition | string;
    'resources.clone': RouteDefinition | string;
    'resources.restore': RouteDefinition | string;
    [key: string]: RouteDefinition | string;
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

export interface PanneauPages extends ResourcePages {
    home?: PageDefinition;
    login?: PageDefinition;
    account?: PageDefinition;
    error?: PageDefinition;
}

/**
 * Panneau definition (main configuration)
 */
export interface PanneauDefinition {
    name?: string;
    resources?: Resource[];
    routes?: Routes;
    pages?: PanneauPages;
    intl?: PanneauIntl;
    theme?: PanneauTheme;
    components?: PanneauComponents;
    settings?: Record<string, unknown>;
    forms?: FormDefinition[];
    fields?: FieldDefinition[];
}

/**
 * Tracking variables
 */
export type TrackingVariables = Record<string, unknown>;
