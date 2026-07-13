/**
 * Form Types
 * TypeScript interfaces for form-related components
 */
import { ReactNode } from 'react';

import { ControlSize, Definition, Label } from './core';

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
    label?: Label;
    component?: string;
    size?: ControlSize;
    [key: string]: unknown;
}

export interface FieldDefinition extends Omit<Field, 'component'>, Definition {}

/**
 * Form definition
 */
export interface Form {
    title?: ReactNode;
    fields?: Field[];
    method?: string | null;
    action?: string | null;
    submitButtonLabel?: Label | null;
    [key: string]: unknown;
}

export interface FormDefinition extends Form, Definition {}
