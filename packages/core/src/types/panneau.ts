/**
 * Panneau Definition Types
 * TypeScript interfaces for main Panneau configuration and definitions
 */
import { MenuItem, PageDefinition, RouteDefinition } from './core';
import { FieldDefinition, FormDefinition } from './form';
import { Resource, ResourcePages } from './resource';

/**
 * Panneau route configuration
 */
export interface Routes {
    'resources.index'?: RouteDefinition | string;
    'resources.create'?: RouteDefinition | string;
    'resources.store'?: RouteDefinition | string;
    'resources.show'?: RouteDefinition | string;
    'resources.edit'?: RouteDefinition | string;
    'resources.update'?: RouteDefinition | string;
    'resources.delete'?: RouteDefinition | string;
    'resources.destroy'?: RouteDefinition | string;
    'resources.duplicate'?: RouteDefinition | string;
    'resources.clone'?: RouteDefinition | string;
    'resources.restore'?: RouteDefinition | string;
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
    /** @deprecated Not used: set the values of each resource in `resources[].intl.values` */
    values?: PanneauIntlValues;
}

export interface PanneauPages extends ResourcePages {
    home?: PageDefinition;
    login?: PageDefinition;
    account?: PageDefinition;
    error?: PageDefinition;
}

/**
 * Menu item in a Panneau menu: a menu item definition or a special item id
 * (ex: 'resources', 'account', 'separator')
 */
export type PanneauMenuItem = MenuItem | string;

export interface PanneauMenus {
    main?: PanneauMenuItem[] | null;
    guest?: PanneauMenuItem[] | null;
    [key: string]: PanneauMenuItem[] | null | undefined;
}

/**
 * Links shown on the login page: `true` for the default url, or the url of the page
 */
export interface PanneauAuth {
    /** "Forgot your password?" link (default url: /forgot-password) */
    forgotPassword?: boolean | string;
    /** "Create account" link (default url: /register) */
    register?: boolean | string;
    [key: string]: unknown;
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
    /** @deprecated Not used: give the custom components to the `components` prop of the container */
    components?: PanneauComponents;
    settings?: Record<string, unknown>;
    forms?: FormDefinition[];
    fields?: FieldDefinition[];
    menus?: PanneauMenus;
    auth?: PanneauAuth;
}

/**
 * Tracking variables
 */
export type TrackingVariables = Record<string, unknown>;
