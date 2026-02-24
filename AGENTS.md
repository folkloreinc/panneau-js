# AGENTS.md

This file provides guidance for coding agents when working with code in this repository.

## Project Overview

Panneau-JS is a comprehensive React UI component library for building data-centric admin panels and dashboards. It's a Lerna-managed monorepo with 97+ packages organized by category (actions, displays, fields, forms, elements, lists, filters, modals, and core utilities). Published under the `@panneau/` npm scope, it supports React 19+ and uses ESM-first architecture.

## Main sections

The `actions` folder contains general actions one can add to resources (ex: edit/delete buttons in list).
The `displays` folder contains generally small representations fo fields for use in tables or elsewhere.
The `elements` folder contains basic reusable components used through the system.
The `fields` folder contains form fields.
The `filters` folder contains filter controls for lists.
The `forms` folder contains various forms and form layouts.
The `lists` folder contains the different types of lists.
The `modals` folder contains the modals/popups used mainly in forms.
The `packages` folder contains all the general packages and the meta-packages grouping the main folders (actions, displays, fields, etc.).

## Common Commands

### Development

```bash
npm run storybook         # Start Storybook dev server on localhost:58800
npm start                 # Alias for npm run storybook
```

### Building Packages

```bash
# Prepare all packages
lerna run prepublishOnly

#Build all packages
lerna run build

# Build a single package (from package directory)
npm run build             # Runs scripts/prepare-package.sh

# Manually run prepare script
../../scripts/prepare-package.sh
```

### Internationalization

```bash
npm run intl              # Extract and compile i18n messages (root level)
npm run intl --prefix ./packages/intl  # Package-specific intl build
```

### Lerna/Publishing

```bash
lerna bootstrap           # Install dependencies with hoisting
lerna publish             # Publish changed packages (allowed branches: v0.4, v0.6, v1.0-react-router5, v2.0, v3.0, feature/es-module)
lerna changed             # List packages that have changed since last release
lerna version             # Bump package versions without publishing
lerna run <script>        # Run npm script in all packages that have it
```

### Linting

```bash
npx eslint <path>         # Lint JavaScript files
npx stylelint <path>      # Lint CSS files
npx prettier --write <path>  # Format files
```

**Publishing Workflow**:

1. Ensure you're on an allowed branch (v0.4, v0.6, v1.0-react-router5, v2.0, v3.0, feature/es-module)
2. Run `lerna changed` to see what packages will be published
3. Run `lerna run prepublishOnly` to build all packages
4. Run `lerna publish` to version, tag, and publish
5. Lerna will prompt for version bump type (patch, minor, major)
6. All packages are versioned together (currently 4.0.8)

## Architecture Overview

### Monorepo Structure

The repository uses npm workspaces coordinated by Lerna (v3.0.313):

- **`actions/`**: Component actions (delete, edit, show, upload, etc.)
- **`displays/`**: Read-only data display components (text, avatar, date, select)
- **`fields/`**: Form field inputs (text, select, checkbox, date, media, etc.)
- **`elements/`**: Base UI primitives (button, modal, grid, dropdown, card)
- **`forms/`**: Form container and layout components
- **`lists/`**: List/table components for data display
- **`filters/`**: Filter UI components
- **`modals/`**: Modal dialog compositions
- **`packages/`**: Core infrastructure and aggregator packages
    - `core/`: Contexts, hooks, managers (ComponentsManager, DefinitionsManager, EventsManager), utilities, PropTypes
    - `app/`: Main bundle aggregating all components
    - `themes/`: CSS variables, mixins, Bootstrap 5 integration
    - `intl/`: FormatJS-based internationalization (en, fr)
    - `data/`: TanStack React Query integration for data fetching
    - Aggregators: `actions/`, `displays/`, `fields/`, `forms/`, `lists/`, `filters/` (collect related components)
    - Integrations: `auth/`, `uppy/`, `medias/`, `ckeditor/`

### Key Design Patterns

1. **Manager/Registry Pattern**: Core managers handle component registration, definitions, events, and asset loading
2. **Context-Driven State**: React Contexts in `packages/core/src/contexts/` for component config, theme, and form state
3. **Dual Module Exports**: All packages export both CommonJS (`lib/`) and ESM (`es/`) via conditional exports
4. **CSS Modules with Scoped Names**: `[path][name]__[local]--[hash:base64:5]` naming convention
5. **CSS as First-Class Export**: Packages export compiled CSS
6. **TypeScript Type Definitions**: TypeScript interfaces for type safety in TS projects

### TypeScript Support

- **Type Definitions** (`packages/core/src/types/`):

### Code Style

- **ESLint** (`eslint.config.mjs`):
- **Stylelint** (`.stylelintrc.json`):
- **Prettier** (`.prettierrc.json`):

### Internationalization

**Setup**: React Intl + FormatJS CLI

- **Supported locales**: `en` (English), `fr` (French)
- **Build script**: `scripts/build-intl.js` extracts from all packages, generates `.po` files for translators

**Workflow**:

1. Add `<FormattedMessage>` components with `defaultMessage` prop
2. Run `npm run intl` to extract messages
3. Translations stored in `packages/intl/locale/{locale}.json`

### Package Conventions

**package.json structure**:

```json
{
    "type": "module",
    "module": "es/index.js",
    "style": "./assets/css/styles.css",
    "exports": {
        ".": "./es/index.js",
        "./assets/css/styles.css": "./assets/css/styles.css"
    },
    "sideEffects": ["*.css"],
    "files": ["lib", "es", "assets"],
    "scripts": {
        "prepublishOnly": "npm run build",
        "build": "../../scripts/prepare-package.sh"
    },
    "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
    }
}
```

**File structure** (typical package):

```
package-name/
├── src/
│   ├── index.js           # Barrel export: export { default } from './Component'
│   ├── Component.jsx      # Component implementation (function declaration)
│   ├── styles.module.css  # Scoped CSS Modules
│   └── _stories/          # Storybook stories (Container.jsx, *.stories.jsx)
├── es/                    # ESM build output (gitignored)
├── lib/                   # CJS build output (gitignored)
├── assets/                # Compiled CSS (gitignored)
├── package.json
└── rollup.config.js       # Optional custom config
```

**Barrel Export Pattern** (`index.js`):

```javascript
export { default } from './ComponentName';
```

### Key Dependencies

- **React ecosystem**: react, react-dom, react-intl
- **Routing**: wouter (lightweight client-side router)
- **Data fetching**: TanStack React Query, `@folklore/fetch`
- **Forms**: `@folklore/forms` (form submit + validation)
- **Styling**: Bootstrap 5, CSS Modules, classnames
- **Icons**: FontAwesome React
- **Utilities**: lodash-es, dayjs, slugify, change-case
- **File uploads**: Uppy
- **Rich text**: CKEditor 5

## Important Notes

- **TypeScript**: The codebase use Typescript only
- **No unit tests**: Testing relies primarily on Storybook for visual component testing
- **Version synchronization**: All packages maintained at same version
- **Legacy peer deps**: Bootstrap uses `--legacy-peer-deps` flag
- **Side effects**: CSS files marked as side effects to ensure inclusion in builds
- **Component style**: All components use function declarations, NOT arrow functions (refactored November 2025)
- **Story files**: All `*.stories.tsx` files (TypeScript format, migrated November 2025)
- **Storybook version**: Currently using Storybook v10.0.8 (upgraded November 2025)
- **ESLint format**: Uses flat config format (`eslint.config.mjs`) with typescript-eslint
- **React imports**: Modern React 17+ JSX transform - no need to import React for JSX usage
- **React patterns**: Zero `React.*` namespace patterns - all use explicit named imports (e.g., `ReactNode`, `createContext`, `ComponentType`)

## Best Practices

### Component Development

1. **Keep components focused**: Each component should have a single, well-defined purpose
2. **Use consistent naming**: Follow the naming conventions for each component type (Field, Filter, Action, etc.)
3. **Spread unused props**: When composing components, use `{...props}` to pass through unhandled props to child components.
4. **Default values in destructuring**: Define default values in the function signature, not inside the component

### Styling

1. **Use CSS Modules**: All component-specific styles should use `.module.css` for scoping
2. **Follow camelCase**: All CSS class names must be in camelCase (enforced by Stylelint)
3. **Leverage Bootstrap**: Use Bootstrap 5 utility classes where appropriate to reduce custom CSS
4. **Respect nesting depth**: Keep CSS nesting to a maximum of 4 levels
5. **Use SMACSS ordering**: Properties should follow idiomatic (SMACSS) order, not alphabetical

### Code Organization

1. **Barrel exports**: Package `index.js` files should only re-export the main component
2. **Direct imports**: Within a package, import components directly, not through the index file
3. **Type imports**: Use `import type` for TypeScript types to enable tree-shaking
4. **Group imports**: Follow the import order: third-party → `@panneau/*` → utilities/hooks → styles
5. **Co-locate stories**: Keep story files in `_stories/` subdirectories within each package
6. **React imports**: Only import React hooks when needed - no need to import React for JSX
    - ✅ Correct: `import { useState, useEffect } from 'react';`
    - ❌ Avoid: `import React from 'react';` (unless using React namespace directly)
    - ✅ Correct: `import { useCallback } from 'react';` (only what you need)

### Internationalization

1. **Use FormattedMessage**: Always use `<FormattedMessage>` for user-facing text
2. **Provide default messages**: Every message must have a `defaultMessage` prop
3. **Avoid camelCase IDs**: i18n message IDs use hash-based identifiers, not camelCase
4. **Extract regularly**: Run `npm run intl` after adding new translatable strings

### Performance

1. **Avoid premature optimization**: No React.memo usage in the codebase - only optimize if needed
2. **Lazy load heavy dependencies**: Use dynamic imports for large libraries when possible
3. **Use CSS Modules**: Scoped CSS prevents style conflicts and enables better optimization
4. **Mark side effects**: Ensure CSS files are marked as side effects in package.json

## Templates

### Component File Template

```typescript
import type { Field } from '@panneau/core/types';
import classNames from 'classnames'

import styles from './styles.module.css';

// No need to import React for JSX (React 17+ transform)
// Only import hooks if needed: import { useState, useEffect } from 'react';

interface ComponentNameProps {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    field?: Field;
    className?: string;
}

function ComponentName({
    value = null,
    placeholder = null,
    onChange = null,
    field = null,
    className = null
}: ComponentNameProps) {
    return (
        <div className={classNames([styles.container, className])}>
            {/* Component implementation */}
        </div>
    );
}

export default ComponentName;
```

### Story File Template (TypeScript)

```typescript
import ComponentName from '../ComponentName';

export default {
    component: ComponentName,
    title: 'Category/ComponentName',
    parameters: {
        intl: true,
    },
};

export const Default = {
    render: () => <ComponentName value="example" />,
};

export const WithCustomProps = {
    render: () => (
        <ComponentName value="example" placeholder="Enter text" theme="primary" />
    ),
};
```

### Package.json Template

```json
{
    "name": "@panneau/package-name",
    "version": "3.0.313",
    "type": "module",
    "module": "es/index.js",
    "style": "./assets/css/styles.css",
    "exports": {
        ".": "./es/index.js",
        "./assets/css/styles.css": "./assets/css/styles.css"
    },
    "sideEffects": ["*.css"],
    "files": ["es", "assets"],
    "scripts": {
        "prepublishOnly": "npm run build",
        "build": "../../scripts/prepare-package.sh"
    },
    "peerDependencies": {
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
    },
    "dependencies": {
        "@panneau/core": "3.0.313"
    }
}
```
