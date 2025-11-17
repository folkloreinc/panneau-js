# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panneau-JS is a comprehensive React UI component library for building data-centric admin panels and dashboards. It's a Lerna-managed monorepo with 97+ packages organized by category (actions, displays, fields, forms, elements, lists, filters, modals, and core utilities). Published under the `@panneau/` npm scope, it supports React 16.8+ through 19.x and uses ESM-first architecture.

## Common Commands

### Development
```bash
npm run storybook         # Start Storybook dev server on localhost:58800
npm start                 # Alias for npm run storybook
```

### Building Packages
```bash
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
```

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

**Storybook** (v7):
- Stories collected from all packages: `**/src/**/*.stories.{jsx,mdx}`
- Webpack 5 with SCSS preset
- Separate handling for `.module.scss` vs global SCSS
- Aliases resolve `@panneau/*` packages for HMR

### Code Style

**ESLint** (`.eslintrc.json`):
- Base: Airbnb + Prettier
- 4-space indentation for JSX
- FormatJS plugin enforces default messages and no camelCase in i18n IDs
- Console allowed: `warn`, `error`
- Overrides relaxed for config files, scripts, CLI code

**Prettier** (`.prettierrc.json`):
- 4-space indentation
- 100-character line width
- Single quotes
- Import sorting: third-party → `@panneau/*` → utilities/hooks → styles
- Plugin: `@trivago/prettier-plugin-sort-imports`

**Stylelint** (`.stylelintrc.json`):
- SASS guidelines + SMACSS property ordering
- Max 4-level nesting
- Camel-case class selectors

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
│   ├── index.js           # Main export
│   ├── Component.jsx      # Component implementation
│   ├── definition.js      # Component metadata
│   ├── styles.module.css  # Scoped styles
│   └── _stories/          # Storybook stories
├── es/                    # ESM build output (gitignored)
├── lib/                   # CJS build output (gitignored)
├── assets/                # Compiled CSS (gitignored)
├── scss/                  # SCSS exports (gitignored, if --scss used)
├── package.json
└── rollup.config.js       # Optional custom config
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

- **No unit tests**: Testing relies primarily on Storybook for visual component testing
- **Version synchronization**: All packages maintained at same version (currently 3.0.313)
- **Publishing branches**: Only publish from allowed branches (v0.4, v0.6, v1.0-react-router5, v2.0, v3.0, feature/es-module)
- **Legacy peer deps**: Bootstrap uses `--legacy-peer-deps` flag
- **CSS Module naming**: Follows `[path][name]__[local]--[hash:base64:5]` pattern
- **Side effects**: CSS/SCSS files marked as side effects to ensure inclusion in builds
