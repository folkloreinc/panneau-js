import { afterEach, describe, expect, it } from 'vitest';

import { createBootConfig, createDefinition } from './__fixtures__/definition';
import { readBootConfig } from './boot';

function writeBootElement(content: string) {
    const element = document.createElement('script');
    element.type = 'application/json';
    element.id = 'panneau-boot';
    element.textContent = content;
    document.body.append(element);
}

describe('readBootConfig', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('reads and validates the boot config of the page', () => {
        writeBootElement(JSON.stringify(createBootConfig({ definition: createDefinition() })));
        const config = readBootConfig();
        expect(config.apiBaseUrl).toBe('/panneau/api');
        expect(config.definition?.name).toBe('Test site');
    });

    it('reads JSON escaped for HTML, as Blade’s @json writes it', () => {
        writeBootElement(
            '{"protocol":1,"apiBaseUrl":"\\/panneau\\/api","basePath":"\\/panneau","locale":"fr","loginUrl":"\\u003C\\/script\\u003E"}',
        );
        expect(readBootConfig()).toMatchObject({ basePath: '/panneau', loginUrl: '</script>' });
    });

    it('throws when the page has no boot config', () => {
        expect(() => readBootConfig()).toThrow(/no Panneau boot config/);
    });

    it('throws when the boot config is not JSON', () => {
        writeBootElement('{ protocol: 1 }');
        expect(() => readBootConfig()).toThrow(/not valid JSON/);
    });

    it('throws with the invalid paths', () => {
        writeBootElement(JSON.stringify({ ...createBootConfig(), basePath: 'panneau' }));
        expect(() => readBootConfig()).toThrow(/- basePath: /);
    });
});
