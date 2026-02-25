/**
 * Form Types
 * TypeScript interfaces for form-related components
 */
import { ReactNode } from 'react';

import { Label } from './core';

/**
 * Field option for select/radio inputs
 */
export interface FieldOption {
    value?: string;
    label?: string;
}

/**
 * Select option (more flexible than FieldOption)
 */
export type SelectOption =
    | string
    | number
    | {
          value?: unknown;
          label?: Label | string;
      }
    | Record<string, unknown>;

/**
 * Field definition
 */
export interface Field {
    name?: string; // Not required on localized fields
    type?: string;
    component?: string;
    label?: ReactNode;
}

/**
 * Form definition
 */
export interface Form {
    title: ReactNode;
    fields?: Field[];
}

/**
 * Table column definition
 */
export type TableColumn =
    | string
    | {
          id?: string;
          component?: string;
          path?: string;
          field?: string;
          columnClassName?: string;
      };
