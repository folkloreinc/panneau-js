import { describe, expect, it } from 'vitest';

import { affectedPackages, vitestFilters } from './affected.js';
import { readWorkspacePackages } from './workspaces.js';

/** A small graph: ui ← fields ← forms ← app, and data ← app. */
function pkg(name, ...dependencies) {
    return {
        name: `@panneau/${name}`,
        folder: `packages/${name}`,
        workspaceDependencies: dependencies.map((dependency) => ({
            name: `@panneau/${dependency}`,
        })),
    };
}
const packages = [
    pkg('intl'),
    pkg('ui', 'intl'),
    pkg('data'),
    pkg('fields', 'ui', 'intl'),
    pkg('forms', 'fields'),
    pkg('app', 'forms', 'data'),
];

describe('affectedPackages', () => {
    it('adds the packages that depend on a changed package, directly or not', () => {
        expect(affectedPackages(['packages/fields/src/TextField.tsx'], packages)).toEqual({
            all: false,
            folders: ['packages/app', 'packages/fields', 'packages/forms'],
            playground: true,
        });
    });

    it('keeps a package alone when nothing depends on it', () => {
        expect(affectedPackages(['packages/app/src/App.tsx'], packages).folders).toEqual([
            'packages/app',
        ]);
    });

    it('runs every package when a package at the bottom changes', () => {
        expect(affectedPackages(['packages/intl/src/messages.ts'], packages).folders).toEqual([
            'packages/app',
            'packages/fields',
            'packages/forms',
            'packages/intl',
            'packages/ui',
        ]);
    });

    it('does not take a folder whose name starts like a package as that package', () => {
        expect(affectedPackages(['packages/fields-extra/package.json'], packages)).toMatchObject({
            all: true,
        });
    });

    it.each([
        'package.json',
        'package-lock.json',
        '.storybook/preview.tsx',
        'vitest.storybook.config.ts',
        'tsconfig.base.json',
        'config/vite.package.ts',
        'scripts/affected.js',
        '.github/workflows/ci.yml',
        '.github/actions/setup/action.yml',
        '.nvmrc',
    ])('runs everything when %s changes', (file) => {
        expect(affectedPackages(['packages/app/src/App.tsx', file], packages)).toEqual({
            all: true,
            folders: [],
            playground: true,
        });
    });

    it('ignores docs, changesets, the legacy code and the smoke apps', () => {
        expect(
            affectedPackages(
                [
                    'docs/decisions/0001-x.md',
                    '.changeset/blue-cats.md',
                    'legacy/packages/fields/src/x.jsx',
                    'smoke/webpack/src/index.js',
                    'AGENTS.md',
                ],
                packages,
            ),
        ).toEqual({ all: false, folders: [], playground: false });
    });

    it('keeps the playground apart from the packages', () => {
        expect(affectedPackages(['playground/definition.ts'], packages)).toEqual({
            all: false,
            folders: [],
            playground: true,
        });
    });
});

describe('vitestFilters', () => {
    it('runs everything without filters', () => {
        expect(vitestFilters({ all: true, folders: [], playground: true }, 'storybook')).toEqual({
            run: true,
            filters: [],
        });
    });

    it('filters on the folders of the packages, with a slash', () => {
        const affected = { all: false, folders: ['packages/app'], playground: true };
        expect(vitestFilters(affected, 'storybook')).toEqual({
            run: true,
            filters: ['packages/app/'],
        });
        expect(vitestFilters(affected, 'test')).toEqual({
            run: true,
            filters: ['packages/app/', 'playground/'],
        });
    });

    it('runs nothing when no package changed', () => {
        expect(vitestFilters({ all: false, folders: [], playground: false }, 'test')).toEqual({
            run: false,
            filters: [],
        });
        // The playground has no stories.
        expect(
            vitestFilters({ all: false, folders: [], playground: true }, 'storybook'),
        ).toMatchObject({ run: false });
        expect(vitestFilters({ all: false, folders: [], playground: true }, 'test')).toEqual({
            run: true,
            filters: ['playground/'],
        });
    });
});

describe('the packages of this repository', () => {
    it('are all found, each with its folder and its dependencies', () => {
        const workspace = readWorkspacePackages();
        expect(workspace.length).toBeGreaterThan(0);
        for (const { name, folder, workspaceDependencies } of workspace) {
            expect(name).toMatch(/^@panneau\//);
            expect(folder).toMatch(/\/packages\/[^/]+$/);
            expect(Array.isArray(workspaceDependencies)).toBe(true);
        }
    });
});
