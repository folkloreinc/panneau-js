import { describe, expect, it } from 'vitest';

import { createPluginRegistry, definePlugin } from '@panneau/core';
import { fieldsPlugin } from '@panneau/fields';
import { creditsPlugin } from '@panneau/fields/credits';
import { sessionsPlugin } from '@panneau/fields/sessions';
import { publicationPlugin } from '@panneau/forms/publication';
import { listsPlugin } from '@panneau/lists';

describe('the built-in plugins', () => {
    // Those of `@panneau/fields`, which doesn't depend on `@panneau/core`, are typed as
    // `definePlugin()` types them: this checks it.
    const plugins = [
        definePlugin(fieldsPlugin),
        definePlugin(creditsPlugin),
        definePlugin(sessionsPlugin),
        definePlugin(listsPlugin),
        definePlugin(publicationPlugin),
    ];

    it('have ids of the form panneau.{name} (decision 0097)', () => {
        expect(plugins.map((plugin) => plugin.id)).toEqual([
            'panneau.fields',
            'panneau.credits',
            'panneau.sessions',
            'panneau.lists',
            'panneau.publication',
        ]);
    });

    it('go together in one registry', () => {
        const registry = createPluginRegistry(plugins);
        expect(registry.fields.get('credits')).toBe(creditsPlugin.fields.credits);
        expect(registry.panels.has('publication')).toBe(true);
        expect(registry.listLayouts.has('table')).toBe(true);
    });
});
