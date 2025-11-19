/**
 * Panneau TypeScript Type Definitions
 *
 * This module exports TypeScript interfaces corresponding to the PanneauPropTypes
 * defined in packages/core/src/lib/PropTypes.js
 *
 * @module @panneau/core/types
 */

// Core UI Types
export type {
    Message,
    Label,
    StatusCode,
    MenuItem,
    Button,
    ButtonTheme,
    ButtonSize,
    ButtonType,
    DropdownAlign,
    ControlSize,
    FormStatus,
    Feedback,
    FormError,
    Toggle,
    Breadcrumb,
    Font,
    TrackingVariables,
    TriggerUpdate,
} from './core';

// Form Types
export type { FieldOption, SelectOption, Field, Form, TableColumn } from './form';

// Resource Types
export type { Intl, Resource, Item, User, Media, Preview, Modal, Filter, Uppy } from './resource';

// Panneau Definition Types
export type { Routes, Page, PanneauDefinition, Definition } from './panneau';
