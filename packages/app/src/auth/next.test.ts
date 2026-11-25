import { afterEach, describe, expect, it, vi } from 'vitest';

import { cameBackFrom, rememberNext, safeNext } from './next';

const origin = 'https://admin.example.com';

describe('safeNext', () => {
    it.each([
        ['/oauth/authorize?client_id=abc&scope=mcp', '/oauth/authorize?client_id=abc&scope=mcp'],
        ['/', '/'],
        ['/panneau/resources/pages#top', '/panneau/resources/pages#top'],
        // Encoded slashes and backslashes stay in the path: browsers don't decode them.
        ['/%2F%2Fevil.example', '/%2F%2Fevil.example'],
        ['/%5Cevil.example', '/%5Cevil.example'],
        // Dot segments are resolved, without leaving the origin.
        ['/a/../oauth/authorize', '/oauth/authorize'],
        ['/javascript:alert(1)', '/javascript:alert(1)'],
    ])('keeps the same-origin path %s', (value, expected) => {
        expect(safeNext(value, origin)).toBe(expected);
    });

    it.each([
        [null],
        [undefined],
        [''],
        ['oauth/authorize'],
        ['//evil.example'],
        ['//evil.example/oauth/authorize'],
        ['///evil.example'],
        ['/\\evil.example'],
        ['\\/evil.example'],
        ['/oauth\\authorize'],
        ['https://evil.example'],
        ['https://admin.example.com/oauth/authorize'],
        ['http:/evil.example'],
        ['javascript:alert(1)'],
        ['data:text/html,<script>alert(1)</script>'],
        ['/\t/evil.example'],
        ['/\n/evil.example'],
        ['/\r/evil.example'],
        ['/ /evil.example'],
        [' /oauth/authorize'],
        ['/oauth/authorize '],
        ['\u0000/oauth'],
        ['/\u0000/evil.example'],
        ['/ /evil.example'],
        ['/ /evil.example'],
        ['/\u0085/evil.example'],
    ])('refuses %j', (value) => {
        expect(safeNext(value, origin)).toBeNull();
    });
});

describe('cameBackFrom', () => {
    afterEach(() => {
        window.sessionStorage.clear();
        vi.useRealTimers();
    });

    it('says that the app just sent the browser to the same next', () => {
        rememberNext('/oauth/authorize?a=1');
        expect(cameBackFrom('/oauth/authorize?a=1')).toBe(true);
    });

    it('says nothing for another next, or after a while', () => {
        rememberNext('/oauth/authorize?a=1');
        expect(cameBackFrom('/oauth/authorize?a=2')).toBe(false);
        vi.useFakeTimers();
        rememberNext('/oauth/authorize?a=1');
        vi.advanceTimersByTime(60_000);
        expect(cameBackFrom('/oauth/authorize?a=1')).toBe(false);
    });

    it('says nothing without a remembered next', () => {
        expect(cameBackFrom('/oauth/authorize')).toBe(false);
        window.sessionStorage.setItem('panneau:next', 'not json');
        expect(cameBackFrom('/oauth/authorize')).toBe(false);
    });
});
