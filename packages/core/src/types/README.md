# Panneau TypeScript Types

This directory contains TypeScript interface definitions corresponding to the PanneauPropTypes defined in `packages/core/src/lib/PropTypes.js`.

## Usage

### Importing Types

```typescript
// Import all types
import type { Field, Form, Resource, Button, MenuItem } from '@panneau/core/types';

// Or import from specific modules
import type { Field, Form } from '@panneau/core/types/form';
import type { Resource, Item } from '@panneau/core/types/resource';
import type { Button, ButtonTheme } from '@panneau/core/types/core';
```

### Using Types in Components

```typescript
import React from 'react';
import type { Field, Button } from '@panneau/core/types';

interface MyComponentProps {
    field: Field;
    button?: Button;
}

function MyComponent({ field, button }: MyComponentProps) {
    return <div>{/* component implementation */}</div>;
}
```

## Type Categories

### Core Types (`core.ts`)

Basic UI types including:

- `Message` - Internationalization message
- `Label` - Text label or message
- `Button` - Button configuration
- `ButtonTheme` - Bootstrap button themes
- `MenuItem` - Navigation menu item
- `FormStatus` - Form state indicators
- And more...

### Form Types (`form.ts`)

Form-related types including:

- `Field` - Form field definition
- `Form` - Form configuration
- `FieldOption` - Select/radio option
- `SelectOption` - Flexible select option
- `TableColumn` - Table column definition

### Resource Types (`resource.ts`)

Entity and resource types including:

- `Resource` - Resource definition
- `Item` - Generic data item
- `User` - User entity
- `Media` - Media file entity
- `Filter` - Filter definition
- `Modal` - Modal definition

### Panneau Definition Types (`panneau.ts`)

Main configuration types including:

- `PanneauDefinition` - Main Panneau config
- `Routes` - Route configuration
- `Page` - Page definition
- `Definition` - Generic definition

## Relationship to PropTypes

These TypeScript interfaces are derived from the PropTypes definitions in `lib/PropTypes.js`. When updating PropTypes:

1. Update the PropTypes definition in `lib/PropTypes.js`
2. Update the corresponding TypeScript interface in the appropriate file
3. Ensure the types remain synchronized

## Notes

- All interfaces use optional properties (`?`) where the corresponding PropType is not required
- Union types are used for `oneOf` and `oneOfType` PropTypes
- `Record<string, unknown>` is used for flexible object types
- Index signatures (`[key: string]: unknown`) allow additional properties on extensible types
