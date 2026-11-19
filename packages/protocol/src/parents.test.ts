import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import type { DefinitionInput } from './schemas';
import { validateDefinition } from './validate';

function withParents(
    parents: { resource?: string; pages?: DefinitionInput['pages'] } = {},
): DefinitionInput {
    const definition = createDefinition();
    return {
        ...definition,
        resources: definition.resources.map((resource, index) =>
            index === 0 && parents.resource !== undefined
                ? { ...resource, parent: parents.resource }
                : resource,
        ),
        pages: {
            home: { component: 'dashboard' },
            activity: { component: 'dashboard', label: 'Activity' },
            job: { component: 'job', label: 'Job', params: ['id'] },
            ...parents.pages,
        },
    };
}

const messages = (definition: DefinitionInput) => {
    const result = validateDefinition(definition);
    return result.success ? [] : result.issues.map((issue) => `${issue.path}: ${issue.message}`);
};

describe('parent (decision 0093)', () => {
    it('accepts a page as the parent of a resource, and a page or a resource as that of a page', () => {
        const first = createDefinition().resources[0]?.id ?? '';
        expect(
            messages(
                withParents({
                    resource: 'activity',
                    pages: {
                        usage: { component: 'usage', label: 'Usage', parent: 'activity' },
                        report: { component: 'report', parent: { resource: first } },
                    },
                }),
            ),
        ).toEqual([]);
    });

    it('refuses a parent that no link leads to', () => {
        expect(
            messages(
                withParents({
                    resource: 'missing',
                    pages: {
                        usage: { component: 'usage', parent: 'home' },
                        logs: { component: 'logs', parent: 'job' },
                        report: { component: 'report', parent: { resource: 'missing' } },
                        self: { component: 'self', parent: 'self' },
                    },
                }),
            ),
        ).toEqual([
            'resources.0.parent: No page `missing`.',
            'pages.usage.parent: The home page is never a parent.',
            'pages.logs.parent: The page `job` has `params`: no link leads to it.',
            'pages.report.parent.resource: No resource `missing`.',
            'pages.self.parent: A page is not its own parent.',
        ]);
    });

    it('refuses parents that come back to where they started, once', () => {
        const first = createDefinition().resources[0]?.id ?? '';
        expect(
            messages(
                withParents({
                    resource: 'activity',
                    pages: {
                        activity: { component: 'dashboard', parent: { resource: first } },
                        usage: { component: 'usage', parent: 'activity' },
                    },
                }),
            ),
        ).toEqual([
            `resources.0.parent: The parents of \`${first}\` come back to it: \`${first}\` → \`activity\` → \`${first}\`.`,
        ]);
    });

    it('refuses a parent that is neither the id of a page nor a resource', () => {
        const result = validateDefinition(
            withParents({ pages: { usage: { component: 'usage', parent: 4 as never } } }),
        );
        expect(result.success).toBe(false);
    });
});
