/**
 * Core UI Types
 */
import type { ReactNode } from 'react';
import type { MessageDescriptor } from 'react-intl';

/**
 * Internationalization message definition
 */
export interface Message extends MessageDescriptor {
    id: string;
    defaultMessage?: string;
}

/**
 * Label can be either a message object or any React node
 */
export type Label = Message | ReactNode;

/**
 * HTTP status code (number or string)
 */
export type StatusCode = number | string;

/**
 * Menu item definition
 */
export interface MenuItem {
    id?: number | string;
    label?: Label;
    url?: string;
    external?: boolean;
    active?: boolean;
}

/**
 * Button definition
 */
export interface Button {
    id?: string;
    label?: Label;
    onClick?: () => void;
    href?: string;
    target?: string;
    theme?: ButtonTheme;
    size?: ButtonSize;
    type?: ButtonType;
    disabled?: boolean;
    external?: boolean;
}

/**
 * Button theme variants (Bootstrap 5)
 */
export type ButtonTheme =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | null;

/**
 * Button size variants
 */
export type ButtonSize = 'lg' | 'md' | 'sm' | null;

/**
 * Button type attribute
 */
export type ButtonType = 'button' | 'submit';

/**
 * Dropdown alignment
 */
export type DropdownAlign = 'start' | 'end';

/**
 * Form control size
 */
export type ControlSize = 'lg' | 'sm' | null;

/**
 * Form status states
 */
export type FormStatus = 'loading' | 'success' | 'error' | null;

/**
 * Form feedback states
 */
export type Feedback = 'valid' | 'invalid' | 'loading' | null;

/**
 * Form error object
 */
export interface FormError {
    message?: string;
}

/**
 * Toggle definition
 */
export interface Toggle {
    key?: string;
    label?: string;
}

/**
 * Breadcrumb definition
 */
export interface Breadcrumb {
    url?: string;
}

/**
 * Font definition
 */
export interface Font {
    // Properties to be defined based on requirements
}

/**
 * Tracking variables
 */
export type TrackingVariables = Record<string, unknown>;

/**
 * Trigger update identifier
 */
export type TriggerUpdate = string;
