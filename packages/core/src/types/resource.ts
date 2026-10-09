/**
 * Resource Types
 * TypeScript interfaces for resources, items, users, media, and other entities
 */
import { ElementType } from 'react';

import { Item, PageDefinition, RouteDefinition } from './core';
import { Field, Form } from './form';

/**
 * Table column definition
 */
export type TableColumn = string | Column;

export interface Column extends Record<string, unknown> {
    id?: string | null;
    label?: unknown;
    path?: string;
    valueKey?: string;
    component?: string | ElementType | null;
    field?: Field | string | null;
    actions?: ActionDefinition[] | null;
}

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
    withoutConfirmation?: boolean;
    [key: string]: unknown;
}

export type ActionDefinition = string | Action;

export type ActionValue = Item | Item[] | null;

export interface ResourceIntlValues {
    a_singular?: string;
    a_plural?: string;
    [key: string]: unknown;
}

/**
 * Internationalization configuration
 */
export interface ResourceIntl {
    messages?: Record<string, string>;
    values?: ResourceIntlValues;
}

/**
 * Resource definition
 */

export interface ResourceIndex {
    filters?: Filter[];
    columns?: TableColumn[];
    actions?: ActionDefinition[];
    fields?: Field[];
    [key: string]: unknown;
}

export interface ResourcePages {
    index?: PageDefinition;
    show?: PageDefinition;
    create?: PageDefinition;
    edit?: PageDefinition;
    delete?: PageDefinition;
    duplicate?: PageDefinition;
    [key: string]: PageDefinition | undefined;
}

/**
 * Form definition of a resource (the id is optional, the form is identified by its key)
 */
export interface ResourceForm extends Form {
    id?: string;
    component?: string | ElementType;
}

export interface ResourceForms {
    default?: ResourceForm | null;
    create?: ResourceForm | null;
    edit?: ResourceForm | null;
    delete?: ResourceForm | null;
    modal?: ResourceForm | null;
    [key: string]: ResourceForm | null | undefined;
}

/**
 * Resource type (sub-type of a resource, ex: page types)
 */
export interface ResourceType {
    id?: string;
    name?: string;
    fields?: Field[];
    settings?: {
        canCreate?: boolean;
        [key: string]: unknown;
    };
}

export interface Resource {
    id: string;
    name: string;
    intl?: ResourceIntl;
    fields?: Field[];
    index?: ResourceIndex;
    forms?: ResourceForms;
    settings?: Record<string, unknown>;
    extraRoutes?: RouteDefinition[];
    pages?: ResourcePages;
    types?: ResourceType[];
}

export interface ResourceItem extends Item {
    type?: string;
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
