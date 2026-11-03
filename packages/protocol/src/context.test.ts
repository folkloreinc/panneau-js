import { describe, expect, it } from 'vitest';

import { contextBefore, formatContextHeader, parseContextHeader } from './context';
import { createExampleDefinition } from './mock';
import { validateDefinition } from './validate';

describe('the Panneau-Context header', () => {
    it('writes the values that are set, in the order of the params', () => {
        expect(
            formatContextHeader({ contest: '12', client: '4 & co', season: null, site: '' }, [
                'client',
                'contest',
            ]),
        ).toBe('client=4+%26+co&contest=12');
        expect(formatContextHeader({})).toBe('');
    });

    it('reads it back, keeping the first value of a name and leaving empty ones out', () => {
        expect(parseContextHeader('client=4+%26+co&contest=12&contest=13&season=')).toEqual({
            client: '4 & co',
            contest: '12',
        });
        expect(parseContextHeader(null)).toEqual({});
    });

    it('gives the values before a param, which the request of its choices sends', () => {
        const names = ['client', 'contest', 'round'];
        const values = { client: '4', contest: '12', round: '2' };
        expect(contextBefore(values, names, 'client')).toEqual({});
        expect(contextBefore(values, names, 'round')).toEqual({ client: '4', contest: '12' });
    });
});

describe('the context of the definition', () => {
    const definition = (params: unknown[]) => ({
        ...createExampleDefinition(),
        context: { params },
    });

    it('accepts params with inline options or without, and their values', () => {
        const result = validateDefinition(
            definition([
                { name: 'client', label: 'Client', allLabel: 'All clients', value: null },
                {
                    name: 'contest',
                    label: 'Contest',
                    required: true,
                    options: [{ value: '12', label: 'Summer' }],
                    value: '12',
                    valueLabel: 'Summer',
                },
            ]),
        );
        expect(result.success).toBe(true);
    });

    it('refuses a fixed param without a value', () => {
        const fixed = validateDefinition(
            definition([{ name: 'client', label: 'Client', fixed: true, value: null }]),
        );
        expect(fixed.success ? [] : fixed.issues.map(({ path }) => path)).toContain(
            'context.params.0.value',
        );
        expect(
            validateDefinition(
                definition([{ name: 'client', label: 'Client', fixed: true, value: '4' }]),
            ).success,
        ).toBe(true);
    });

    it('refuses the name of a reserved route segment, and the same name twice', () => {
        const reserved = validateDefinition(definition([{ name: 'resources', label: 'R' }]));
        expect(reserved.success).toBe(false);
        const twice = validateDefinition(
            definition([
                { name: 'site', label: 'Site' },
                { name: 'site', label: 'Site' },
            ]),
        );
        expect(twice.success).toBe(false);
        expect(twice.success ? [] : twice.issues.map(({ path }) => path)).toContain(
            'context.params.1.name',
        );
    });
});
