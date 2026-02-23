/**
 * Resource Types
 * TypeScript interfaces for resources, items, users, media, and other entities
 */
import { Field } from './form';

export interface Action {
    id?: string;
    component?: string;
    label?: string | null;
    icon?: string | null;
    href?: string | null;
    external?: boolean;
    theme?: string;
    target?: string;
    onClick?: (() => void) | null;
    endpoint?: string | null;
    withConfirmation?: boolean;
    [key: string]: unknown;
}

export type ActionDefinition = string | Action;

type ActionValue = Item | Item[] | null;

/**
 * Internationalization configuration
 */
export interface Intl {
    locale?: string;
    messages?: Record<string, string>;
    values?: Record<string, string>;
}

/**
 * Resource definition
 */
export interface Resource {
    id: string;
    name: string;
    intl?: Intl;
    fields?: Field[];
    forms?: Record<string, unknown>;
    shows_in_navbar?: boolean;
}

/**
 * Generic item (base interface for data items)
 */
export interface Item {
    id: string;
    [key: string]: unknown;
}

/**
 * User definition
 */
export interface User {
    id?: number | string;
    [key: string]: unknown;
}

/**
 * Media file definition
 */
export interface Media {
    id: string;
    name: string;
    type: string;
    thumbnail_url?: string;
    [key: string]: unknown;
}

/**
 * Preview definition
 */
export interface Preview {
    id?: string;
    [key: string]: unknown;
}

/**
 * Modal definition
 */
export interface Modal {
    name?: string;
    [key: string]: unknown;
}

/**
 * Filter definition
 */
export interface Filter {
    id?: string;
    component?: string;
    [key: string]: unknown;
}

/**
 * Uppy configuration
 */
export interface Uppy {
    tus?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * Uppy instance
 */
export interface uppy {
    [key: string]: unknown;
}
