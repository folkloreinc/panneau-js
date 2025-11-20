# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panneau-JS is a comprehensive React UI component library for building data-centric admin panels and dashboards. It's a Lerna-managed monorepo with 97+ packages organized by category (actions, displays, fields, forms, elements, lists, filters, modals, and core utilities). Published under the `@panneau/` npm scope, it supports React 16.8+ through 19.x and uses ESM-first architecture.

## Main sections

The `actions` folder contains general actions one can add to resources.
The `displays` folder contains generally small representations fo fields for use in tables or elsewhere.
The `elements` folder contains basic reusable components used through the system.
The `fields` folder contains form fields.
The `filters` folder contains filter controls for lists.
The `forms` folder contains various forms and form layouts.
The `lists` folder contains the different types of lists.
The `modals` folder contains the modals/popups used mainly in forms.
The `packages` folder contains all the general packages and the meta-packages grouping the main folders (actions, displays, fields, etc.).

## Recent Changes

### November 2025

- **ESLint Flat Config Migration**: Migrated from legacy ESLint configuration to flat config format
    - Converted from `.eslintrc.json` to `eslint.config.mjs` using typescript-eslint.config
    - Removed `.eslintignore` file (ignores now defined in config)
    - Added comprehensive plugin support: React, TypeScript, Import, FormatJS, Prettier
    - Updated ignore patterns to exclude build outputs and config files
    - Full TypeScript and JSX/TSX support with Babel parser

- **Stylelint Configuration Update**: Enhanced Stylelint rules for better code quality
    - Updated to use idiomatic property ordering (SMACSS)
    - Enforced camelCase class naming convention
    - Added import notation rules for consistent syntax

- **Actions Folder TypeScript Migration**: Migrated all action components to TypeScript
    - Converted 8 action components from .jsx to .tsx format
    - Replaced PropTypes with TypeScript interfaces using @panneau/core/types
    - Components migrated: DeleteAction, EditAction, DuplicateAction, ShowAction, ImportAction, RestoreAction, UploadAction, Actions
    - All action components now fully type-safe

- **TypeScript Type Definitions**: Added comprehensive TypeScript interfaces
    - Created type definitions in `packages/core/src/types/`
    - All PanneauPropTypes now have corresponding TypeScript interfaces
    - Organized into 4 modules: core, form, resource, and panneau types
    - Full TypeScript support for developers using Panneau in TS projects

- **Storybook 10 Upgrade**: Upgraded from Storybook v7 to v10.0.8
    - Updated all story files across the codebase
    - Migrated to new Storybook 10 APIs and configuration
    - Updated all package.json dependencies for Storybook-related packages

- **Component Architecture Refactor**: Converted all 130+ components from const arrow functions to function declarations
    - Updated all action components (8 files)
    - Updated all display components (13 files)
    - Updated all field components (41 files)
    - Updated all element components (36 files)
    - Updated remaining form, filter, list, and provider components
    - This change ensures consistency across the entire codebase and aligns with React best practices

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

# Build with SCSS source exports
npm run build -- --scss

# Manually run prepare script
../../scripts/prepare-package.sh [--scss]
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

**Publishing Workflow**:

1. Ensure you're on an allowed branch (v0.4, v0.6, v1.0-react-router5, v2.0, v3.0, feature/es-module)
2. Run `lerna changed` to see what packages will be published
3. Run `lerna run prepublishOnly` to build all packages
4. Run `lerna publish` to version, tag, and publish
5. Lerna will prompt for version bump type (patch, minor, major)
6. All packages are versioned together (currently 3.0.313)

### Linting

```bash
npx eslint <path>         # Lint JavaScript files
npx stylelint <path>      # Lint SCSS/CSS files
npx prettier --write <path>  # Format files
```

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
    - `themes/`: SCSS variables, mixins, Bootstrap 5 integration
    - `intl/`: FormatJS-based internationalization (en, fr)
    - `data/`: TanStack React Query integration for data fetching
    - Aggregators: `actions/`, `displays/`, `fields/`, `forms/`, `lists/`, `filters/` (collect related components)
    - Integrations: `auth/`, `uppy/`, `medias/`, `ckeditor/`

### Key Design Patterns

1. **Definition-Based Components**: Each component exports a `definition.js` with metadata (id, component name, variations)
2. **Manager/Registry Pattern**: Core managers handle component registration, definitions, events, and asset loading
3. **Context-Driven State**: React Contexts in `packages/core/src/contexts/` for component config, theme, and form state
4. **Dual Module Exports**: All packages export both CommonJS (`lib/`) and ESM (`es/`) via conditional exports
5. **CSS Modules with Scoped Names**: `[path][name]__[local]--[hash:base64:5]` naming convention
6. **SCSS as First-Class Export**: Packages export both compiled CSS and source SCSS for customization
7. **TypeScript Type Definitions**: TypeScript interfaces mirror all PropTypes for type safety in TS projects

### TypeScript Support

**Type Definitions** (`packages/core/src/types/`):

The codebase provides comprehensive TypeScript interfaces corresponding to all PanneauPropTypes:

```typescript
import type { Button, Field, Form, MenuItem, Resource } from '@panneau/core/types';

interface MyComponentProps {
    field: Field;
    buttons?: Button[];
}
```

**Type Categories**:

- **Core Types** (`types/core.ts`): UI primitives (Button, MenuItem, Label, FormStatus, etc.)
- **Form Types** (`types/form.ts`): Form-related types (Field, Form, FieldOption, TableColumn)
- **Resource Types** (`types/resource.ts`): Entities (Resource, Item, User, Media, Filter, Modal)
- **Panneau Types** (`types/panneau.ts`): Main config (PanneauDefinition, Routes, Page)

**PropTypes → TypeScript Mapping**:

| PropType Pattern             | TypeScript Equivalent                           |
| ---------------------------- | ----------------------------------------------- |
| `PropTypes.string`           | `string` or `string \| undefined` (if optional) |
| `PropTypes.oneOf([...])`     | `'value1' \| 'value2' \| ...`                   |
| `PropTypes.shape({...})`     | `interface Name { ... }`                        |
| `PropTypes.arrayOf(type)`    | `Type[]`                                        |
| `PropTypes.oneOfType([...])` | `Type1 \| Type2 \| ...`                         |

**Notes**:

- All interfaces use optional properties (`?`) for non-required PropTypes
- Flexible object types use `Record<string, unknown>` or index signatures
- Types remain synchronized with PropTypes definitions in `lib/PropTypes.js`

### Component Architecture

**Component Pattern** (All 209+ components follow this standard):

```javascript
import PropTypes from 'prop-types';
import React from 'react';

// PropTypes definition at module level
const propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    onChange: PropTypes.func,
};

// Component using function declaration (NOT arrow functions)
function ComponentName({ value = null, placeholder = null, onChange = null, ...props }) {
    // Component logic with hooks if needed
    return <JSX />;
}

// PropTypes assignment
ComponentName.propTypes = propTypes;

// Default export
export default ComponentName;
```

**TypeScript Component Pattern** (Actions folder uses this pattern):

```typescript
import React from 'react';
import type { ButtonTheme, Field } from '@panneau/core/types';

// TypeScript interface for props
interface ComponentNameProps {
    id: string;
    value?: string;
    placeholder?: React.ReactNode;
    theme?: ButtonTheme;
    onChange?: (value: unknown) => void;
    className?: string;
}

// Component using function declaration with typed props
function ComponentName({
    id,
    value = null,
    placeholder = null,
    theme = 'primary',
    onChange = null,
    className = null,
    ...props
}: ComponentNameProps) {
    // Component logic with hooks if needed
    return <JSX />;
}

// Default export (no PropTypes needed)
export default ComponentName;
```

**Key Component Characteristics**:

- ✅ **Function declarations**: All components use `function ComponentName() {}` (not `const ComponentName = () => {}`)
    - **Note**: All 130+ component files were refactored from const arrow functions to function declarations in November 2025
- ✅ **Props destructuring**: All props destructured in function signature with default values
- ✅ **Spread operator**: Unused props captured with `...props` and spread to child components
- ✅ **PropTypes validation**: JavaScript components have PropTypes defined and assigned
- ✅ **TypeScript interfaces**: TypeScript components use interface definitions for props
    - Use `type` imports for better tree-shaking: `import type { ... } from '@panneau/core/types'`
    - Interface naming convention: `ComponentNameProps`
    - All optional props use `?` and default values in destructuring
    - Use `React.ReactNode` for content that can be JSX or text
- ✅ **Default exports**: All components exported as default
- ✅ **No React.memo**: Memoization is not used anywhere in the codebase
- ✅ **Hooks usage**: Components freely use useState, useEffect, useMemo, useCallback, etc.

**Component Categories** (Total: ~208 non-story component files):

| Category      | Count | Purpose                   | Examples                                       |
| ------------- | ----- | ------------------------- | ---------------------------------------------- |
| **displays/** | 13    | Read-only data display    | Text, Avatar, Date, Boolean, Image, Label      |
| **actions/**  | 8     | User actions on items     | Edit, Delete, Duplicate, Show, Upload, Restore |
| **fields/**   | 41    | Form input fields         | TextField, SelectField, DateField, MediaField  |
| **elements/** | 36    | Base UI primitives        | Button, Modal, Icon, Loading, Card, Dropdown   |
| **forms/**    | 17    | Form layouts & containers | Normal, Horizontal, Inline, Resource, TwoPane  |
| **filters/**  | 8     | Data filtering UI         | Search, Select, Date, Radios, Toggle           |
| **lists/**    | 4     | Data list displays        | Table, Cards, Calendar, ResourceItems          |
| **modals/**   | 4     | Modal compositions        | Dialog, Upload, ResourceForm, ResourceItems    |
| **packages/** | 68    | Core & providers          | App pages, menus, providers, utilities         |

**Provider Pattern**:
All provider components follow a consistent pattern (8 providers total):

```javascript
function ProviderName({ children, ...config }) {
    // Provider logic and state management
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
```

Providers: `FieldsProvider`, `DataProvider`, `ActionsProvider`, `ModalsProvider`, `DisplaysProvider`, `ListsProvider`, `FormsProvider`, `FiltersProvider`

**Common Patterns Observed**:

1. **Value/Placeholder Pattern**: Most display/field components accept `value` and `placeholder` props
2. **Path-based Access**: Components use lodash `get()` for safe nested property access (e.g., `itemLabelPath`, `valuePath`)
3. **Conditional Rendering**: Heavy use of ternary operators and conditional JSX
4. **Bootstrap Integration**: Components use Bootstrap 5 classes extensively with `classnames` utility
5. **Icon Integration**: FontAwesome icons via `@panneau/element-icon`
6. **React Intl**: Internationalized components use `<FormattedMessage>` and `useIntl()` hook

### Build System

**Rollup Configuration** (`rollup.config.js`):

- Factory function `createConfig()` used by all packages
- Outputs: ESM (`es/`) and optionally CommonJS (`lib/`)
- PostCSS with CSS Modules for scoped styling
- Babel transformation with React preset
- Plugins: babel, node-resolve, commonjs, postcss, image, url, json, replace
- Treeshaking preserves CSS/SCSS files as side effects

**Build Script** (`scripts/prepare-package.sh`):

1. Clean (`rm -rf scss assets lib es`)
2. Run Rollup build
3. Copy compiled CSS to `assets/css/`
4. Optionally copy SCSS sources

**Storybook** (v10):

- Stories collected from all packages: `**/src/**/*.stories.{jsx,mdx}`
- Webpack 5 with SCSS preset
- Separate handling for `.module.scss` vs global SCSS
- Aliases resolve `@panneau/*` packages for HMR
- Upgraded from v7 to v10.0.8 with updated story format and configuration

### Code Style

**ESLint** (`eslint.config.mjs`):

- **Format**: ESLint flat config (typescript-eslint.config)
- **File patterns**: `**/*.{js,jsx,ts,tsx}`
- **Ignored paths**:
    - Config files (`**/*.config.js`)
    - Build outputs (`*/*/lib/**`, `*/*/es/**`)
    - Package root files (`packages/*/*.js`, `fields/*/*.js`, `forms/*/*.js`)
    - Node modules (`.storybook` is explicitly not ignored)
- **Parser**: `@babel/eslint-parser` with React and TypeScript presets
- **Extends**:
    - `@eslint/js` (recommended)
    - `typescript-eslint` (recommended)
    - `@eslint-react/eslint-plugin` (recommended-typescript)
    - `eslint-plugin-import` (typescript + recommended)
    - `eslint-plugin-formatjs` (recommended)
    - `eslint-plugin-react` (flat.recommended + flat.jsx-runtime)
    - `eslint-plugin-prettier` (recommended)
- **Settings**: React default version 18
- **Globals**: Browser environment + custom flags (`__DEV__`, `__SERVER__`, `__EDITOR__`, `__ASSETS_MANIFEST__`, `__EMBEDDED_STYLES__`, `__EMBEDDED_SCRIPTS__`)
- **Rules**:
    - `formatjs/no-literal-string-in-jsx`: off (allows literal strings in JSX)

**Prettier** (`.prettierrc.json`):

- 4-space indentation
- 100-character line width
- Single quotes
- Import sorting: third-party → `@panneau/*` → utilities/hooks → styles
- Plugin: `@trivago/prettier-plugin-sort-imports`

**Stylelint** (`.stylelintrc.json`):

- **Extends**:
    - `stylelint-config-idiomatic-order` (SMACSS property ordering)
    - `stylelint-config-standard` (standard rules)
- **Rules**:
    - `order/properties-alphabetical-order`: disabled (uses idiomatic order instead)
    - `alpha-value-notation`: "number" (prefer numeric alpha values)
    - `selector-class-pattern`: camelCase pattern enforced (`^[a-z][a-z0-9A-Z]+$`)
    - `max-nesting-depth`: 4 levels maximum
    - `import-notation`: ["string", "url"] (prefer string notation for imports)

### Internationalization

**Setup**: React Intl + FormatJS CLI

- **Supported locales**: `en` (English), `fr` (French)
- **Message ID pattern**: `[sha512:contenthash:base64:6]` (hash-based for stability)
- **Extraction**: `babel-plugin-react-intl` extracts `<FormattedMessage>` during build
- **Compilation**: `@formatjs/cli-lib` compiles to locale JSON with AST
- **Build script**: `scripts/build-intl.js` extracts from all packages, generates `.po` files for translators
- **Transifex**: `scripts/tx-config.js` generates configuration for automated translation workflow

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
    "exports": {
        ".": { "import": "./es/index.js" },
        "./scss/variables": "./scss/_variables.scss",
        "./assets/css/styles.css": "./assets/css/styles.css"
    },
    "sideEffects": ["*.css", "*.scss"],
    "files": ["lib", "es", "assets", "scss"],
    "scripts": {
        "prepublishOnly": "npm run build",
        "build": "../../scripts/prepare-package.sh [--scss]"
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
│   ├── definition.js      # Component metadata { id, component, ... }
│   ├── styles.module.css  # Scoped CSS Modules (or .scss)
│   └── _stories/          # Storybook stories (Container.jsx, *.stories.jsx)
├── es/                    # ESM build output (gitignored)
├── lib/                   # CJS build output (gitignored)
├── assets/                # Compiled CSS (gitignored)
├── scss/                  # SCSS exports (gitignored, if --scss used)
├── package.json
└── rollup.config.js       # Optional custom config
```

**Barrel Export Pattern** (`index.js`):

```javascript
export { default } from './ComponentName';
```

**Definition File Pattern** (`definition.js`):

```javascript
import Component from './ComponentName';

export default {
    id: 'component-id',
    component: Component,
    type: 'component-type', // e.g., 'field', 'display', 'action'
};
```

### Key Dependencies

- **React ecosystem**: react, react-dom, react-intl, react-helmet
- **Routing**: wouter (lightweight client-side router)
- **Data fetching**: TanStack React Query, `@folklore/fetch`
- **Forms**: `@folklore/forms` (validation)
- **Styling**: Bootstrap 5, SCSS, CSS Modules, classnames
- **Icons**: FontAwesome React
- **Utilities**: lodash-es, dayjs, slugify, change-case
- **File uploads**: Uppy
- **Rich text**: CKEditor 5

## Important Notes

- **Mixed JavaScript/TypeScript**: The codebase is in active migration to TypeScript
    - Actions folder is fully migrated to TypeScript (.tsx)
    - Other folders still use JavaScript (.jsx) with PropTypes
    - All PropTypes have corresponding TypeScript interfaces in `@panneau/core/types`
    - ESLint configuration supports both .js/.jsx and .ts/.tsx files
- **No unit tests**: Testing relies primarily on Storybook for visual component testing
- **Version synchronization**: All packages maintained at same version (currently 3.0.313)
- **Publishing branches**: Only publish from allowed branches (v0.4, v0.6, v1.0-react-router5, v2.0, v3.0, feature/es-module)
- **Legacy peer deps**: Bootstrap uses `--legacy-peer-deps` flag
- **CSS Module naming**: Follows `[path][name]__[local]--[hash:base64:5]` pattern
- **Side effects**: CSS/SCSS files marked as side effects to ensure inclusion in builds
- **Component style**: All components use function declarations, NOT arrow functions (refactored November 2025)
- **Story files**: `*.stories.jsx` files follow different patterns and conventions than component files
- **Storybook version**: Currently using Storybook v10.0.8 (upgraded November 2025)
- **ESLint format**: Uses flat config format (`eslint.config.mjs`) with typescript-eslint

## Best Practices

### Component Development

1. **Keep components focused**: Each component should have a single, well-defined purpose
2. **Use consistent naming**: Follow the naming conventions for each component type (Field, Filter, Action, etc.)
3. **Export definitions**: Always create a `definition.js` file with component metadata for registry
4. **Spread unused props**: Always use `{...props}` to pass through unhandled props to child components
5. **Default values in destructuring**: Define default values in the function signature, not inside the component

### Styling

1. **Use CSS Modules**: All component-specific styles should use `.module.scss` for scoping
2. **Follow camelCase**: All CSS class names must be in camelCase (enforced by Stylelint)
3. **Leverage Bootstrap**: Use Bootstrap 5 utility classes where appropriate to reduce custom CSS
4. **Respect nesting depth**: Keep SCSS nesting to a maximum of 4 levels
5. **Use SMACSS ordering**: Properties should follow idiomatic (SMACSS) order, not alphabetical

### Code Organization

1. **Barrel exports**: Package `index.js` files should only re-export the main component
2. **Direct imports**: Within a package, import components directly, not through the index file
3. **Type imports**: Use `import type` for TypeScript types to enable tree-shaking
4. **Group imports**: Follow the import order: third-party → `@panneau/*` → utilities/hooks → styles
5. **Co-locate stories**: Keep story files in `_stories/` subdirectories within each package

### Internationalization

1. **Use FormattedMessage**: Always use `<FormattedMessage>` for user-facing text
2. **Provide default messages**: Every message must have a `defaultMessage` prop
3. **Avoid camelCase IDs**: i18n message IDs use hash-based identifiers, not camelCase
4. **Extract regularly**: Run `npm run intl` after adding new translatable strings

### Performance

1. **Avoid premature optimization**: No React.memo usage in the codebase - only optimize if needed
2. **Lazy load heavy dependencies**: Use dynamic imports for large libraries when possible
3. **Use CSS Modules**: Scoped CSS prevents style conflicts and enables better optimization
4. **Mark side effects**: Ensure CSS/SCSS files are marked as side effects in package.json

## Development Guidelines

### TypeScript Migration

The codebase is gradually migrating from JavaScript to TypeScript. When migrating components:

1. **File Extension**: Change `.jsx` to `.tsx` (or `.js` to `.ts` for non-component files)

2. **Remove PropTypes**: Remove the PropTypes import and propTypes definition:
    ```javascript
    // ❌ Remove these
    import PropTypes from 'prop-types';
    const propTypes = { /* ... */ };
    ComponentName.propTypes = propTypes;
    ```

3. **Add TypeScript Interface**: Create a TypeScript interface using types from `@panneau/core/types`:
    ```typescript
    // ✅ Add this
    import type { Field, ButtonTheme } from '@panneau/core/types';

    interface ComponentNameProps {
        field: Field;
        theme?: ButtonTheme;
        className?: string;
    }
    ```

4. **Type the Component**: Add the interface to the function signature:
    ```typescript
    function ComponentName({ field, theme = 'primary', className = null }: ComponentNameProps) {
        // Component implementation
    }
    ```

5. **Key Type Mappings**:
    - PropTypes required → Interface property without `?`
    - PropTypes optional → Interface property with `?`
    - `PropTypes.node` → `React.ReactNode`
    - `PropTypes.func` → Function signature (e.g., `(value: string) => void`)
    - `PropTypes.oneOf([...])` → Union type (e.g., `'small' | 'medium' | 'large'`)
    - `PropTypes.shape({...})` → Import corresponding interface from `@panneau/core/types`

6. **Use Type Imports**: Always use `import type` for better tree-shaking:
    ```typescript
    import type { Field } from '@panneau/core/types'; // ✅ Correct
    import { Field } from '@panneau/core/types';      // ❌ Avoid
    ```

### When Creating New Components

1. **Use function declarations**, not const arrow functions:

    ```javascript
    // ✅ Correct
    function MyComponent({ value }) {
        return <div>{value}</div>;
    }

    // ❌ Incorrect
    const MyComponent = ({ value }) => {
        return <div>{value}</div>;
    };
    ```

2. **Always define PropTypes** before the component and assign after:

    ```javascript
    const propTypes = {
        /* ... */
    };

    function MyComponent(props) {
        /* ... */
    }

    MyComponent.propTypes = propTypes;
    ```

3. **Destructure props in function signature** with default values:

    ```javascript
    function MyComponent({
        value = null,
        placeholder = 'Default',
        onChange = null,
        ...props // Capture remaining props
    }) {
        /* ... */
    }
    ```

4. **Follow naming conventions**:
    - Display components: `Text`, `Avatar`, `Date` (noun form)
    - Field components: `TextField`, `SelectField`, `DateField` (ends with "Field")
    - Form layouts: `NormalForm`, `HorizontalForm` (ends with "Form")
    - Filters: `SearchFilter`, `DateFilter` (ends with "Filter")
    - Actions: `EditAction`, `DeleteAction` (ends with "Action")
    - Lists: `TableList`, `CardsList` (ends with "List")
    - Modals: `ModalDialog`, `ModalResourceForm` (starts with "Modal")

5. **Use PanneauPropTypes** from `@panneau/core` for common types:

    ```javascript
    import { PropTypes as PanneauPropTypes } from '@panneau/core';

    const propTypes = {
        field: PanneauPropTypes.field.isRequired,
        size: PanneauPropTypes.buttonSize,
    };
    ```

### When Refactoring Components

1. **Preserve PropTypes**: Never remove or change PropTypes during refactoring (unless migrating to TypeScript)
2. **Maintain default values**: Keep existing default parameter values
3. **Test with Storybook**: Always verify changes in Storybook before committing
4. **Keep spread operators**: Maintain `{...props}` spreading to child components
5. **Don't change story files**: Leave `*.stories.jsx` files unchanged unless specifically updating stories

## Troubleshooting

### Build Issues

**Issue**: `Cannot find module '@panneau/core/types'`
- **Solution**: The types are exported from `@panneau/core`. Make sure to use `import type` syntax and that the core package is built.

**Issue**: CSS modules not working correctly
- **Solution**: Check that the filename matches the pattern `*.module.scss` or `*.module.css`. The build system treats these differently from global styles.

**Issue**: Lerna build fails with "no such file or directory"
- **Solution**: Run `lerna bootstrap` first to ensure all dependencies are properly linked across packages.

### Linting Issues

**Issue**: ESLint not recognizing TypeScript files
- **Solution**: Ensure the file extension is `.ts` or `.tsx` and that it matches the patterns in `eslint.config.mjs`.

**Issue**: ESLint errors in config files
- **Solution**: Config files (`*.config.js`) are intentionally ignored by ESLint. Check the ignore patterns in `eslint.config.mjs`.

**Issue**: Stylelint complaining about class names
- **Solution**: Class names must be in camelCase format (e.g., `myClassName`, not `my-class-name` or `my_class_name`).

### Storybook Issues

**Issue**: Storybook not loading components
- **Solution**: Check that the story file follows the `*.stories.jsx` naming convention and is located in a `src/` directory.

**Issue**: SCSS imports failing in Storybook
- **Solution**: Verify that `.module.scss` files are being imported correctly. Regular SCSS files should not use the `.module` suffix.

### Import Issues

**Issue**: Circular dependency warnings
- **Solution**: Avoid importing from package index files within the same package. Use direct file imports instead.

**Issue**: `@panneau/*` imports not resolving
- **Solution**: In development with Storybook, aliases are configured. For package builds, ensure the package is published or linked via `lerna bootstrap`.

### TypeScript Issues

**Issue**: Type errors after migrating from PropTypes
- **Solution**: Ensure you're importing types from `@panneau/core/types` using `import type`. Check that optional props use `?` in the interface.

**Issue**: `Cannot find name 'React'`
- **Solution**: Add `import React from 'react';` at the top of `.tsx` files, even if using JSX transform.

## Quick Reference

### Component File Template (JavaScript)

```javascript
import PropTypes from 'prop-types';
import React from 'react';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    field: PanneauPropTypes.field,
};

function ComponentName({ value = null, placeholder = null, onChange = null, field = null, ...props }) {
    return (
        <div className={styles.container} {...props}>
            {/* Component implementation */}
        </div>
    );
}

ComponentName.propTypes = propTypes;

export default ComponentName;
```

### Component File Template (TypeScript)

```typescript
import React from 'react';
import type { Field } from '@panneau/core/types';
import styles from './styles.module.scss';

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
    className = null,
    ...props
}: ComponentNameProps) {
    return (
        <div className={styles.container} {...props}>
            {/* Component implementation */}
        </div>
    );
}

export default ComponentName;
```

### Definition File Template

```javascript
import ComponentName from './ComponentName';

export default {
    id: 'component-name',
    component: ComponentName,
    type: 'field', // or 'display', 'action', 'filter', 'list', 'form', 'modal'
};
```

### Package.json Template

```json
{
    "name": "@panneau/package-name",
    "version": "3.0.313",
    "type": "module",
    "module": "es/index.js",
    "exports": {
        ".": { "import": "./es/index.js" },
        "./assets/css/styles.css": "./assets/css/styles.css"
    },
    "sideEffects": ["*.css", "*.scss"],
    "files": ["es", "assets"],
    "scripts": {
        "prepublishOnly": "npm run build",
        "build": "../../scripts/prepare-package.sh"
    },
    "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
    },
    "dependencies": {
        "@panneau/core": "3.0.313"
    }
}
```

### Common Import Patterns

```javascript
// Component imports (JavaScript)
import PropTypes from 'prop-types';
import React from 'react';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';
import styles from './styles.module.scss';

// Component imports (TypeScript)
import React from 'react';
import type { Field, Button as ButtonType } from '@panneau/core/types';
import Button from '@panneau/element-button';
import styles from './styles.module.scss';

// Utility imports
import classnames from 'classnames';
import get from 'lodash-es/get';
import { FormattedMessage } from 'react-intl';
```
