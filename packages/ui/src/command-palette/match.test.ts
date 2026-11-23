import { describe, expect, it } from 'vitest';

import { type CommandPaletteGroup, matchCommands, normalizeSearch, splitMatches } from './match';

const groups: CommandPaletteGroup[] = [
    {
        id: 'nav',
        label: 'Navigation',
        items: [
            { id: 'events', label: 'Événements' },
            { id: 'pages', label: 'Pages', keywords: ['site'] },
            { id: 'new-page', label: 'New page' },
            { id: 'homepage', label: 'Homepage settings', description: 'Of the site' },
        ],
    },
    { id: 'empty', label: 'Empty', items: [] },
    {
        id: 'server',
        label: 'Results',
        matched: true,
        items: [{ id: '12', label: 'Something the server found' }],
    },
];

const labels = (result: CommandPaletteGroup[]) =>
    result.map((group) => [group.id, group.items.map((item) => item.label)]);

describe('matchCommands', () => {
    it('ignores case and accents', () => {
        expect(normalizeSearch('  ÉVÉNEMENTS ')).toBe('evenements');
        expect(labels(matchCommands(groups, 'evene'))).toEqual([
            ['nav', ['Événements']],
            ['server', ['Something the server found']],
        ]);
    });

    it('needs every word, in the label, description or keywords', () => {
        expect(labels(matchCommands(groups, 'page site'))).toEqual([
            ['nav', ['Pages', 'Homepage settings']],
            ['server', ['Something the server found']],
        ]);
        expect(labels(matchCommands(groups, 'settings site'))[0]).toEqual([
            'nav',
            ['Homepage settings'],
        ]);
    });

    it('ranks labels that start with the query, then a word, then the rest', () => {
        expect(labels(matchCommands(groups, 'page'))[0]).toEqual([
            'nav',
            ['Pages', 'New page', 'Homepage settings'],
        ]);
    });

    it('keeps every item without a query, and leaves out empty groups', () => {
        expect(labels(matchCommands(groups, '  '))).toEqual([
            ['nav', ['Événements', 'Pages', 'New page', 'Homepage settings']],
            ['server', ['Something the server found']],
        ]);
    });
});

describe('splitMatches', () => {
    const marked = (label: string, query: string) =>
        splitMatches(label, query)
            .map((part) => (part.match ? `[${part.text}]` : part.text))
            .join('');

    it('marks the first match of each word, ignoring case and accents', () => {
        expect(marked('Événements à venir', 'EVEN')).toBe('[Évén]ements à venir');
        expect(marked('Événements à venir', 'a venir')).toBe('Événements [à] [venir]');
        expect(marked('Événements à venir', 'ven')).toBe('É[vén]ements à venir');
        expect(marked('Pages and pages', 'pag')).toBe('[Pag]es and pages');
        // An accent written apart from its letter belongs to it
        expect(marked('Cafe\u0301 du coin', 'cafe')).toBe('[Cafe\u0301] du coin');
    });

    it('joins matches that overlap or touch', () => {
        expect(marked('Contact us', 'conta tact')).toBe('[Contact] us');
        expect(marked('Contact us', 'con tact')).toBe('[Contact] us');
    });

    it('keeps the label as one part without a query or a match', () => {
        expect(splitMatches('Contact', '  ')).toEqual([{ text: 'Contact', match: false }]);
        expect(splitMatches('Contact', 'zzz')).toEqual([{ text: 'Contact', match: false }]);
    });
});
