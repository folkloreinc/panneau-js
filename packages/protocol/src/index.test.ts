import { describe, expect, it } from 'vitest';

import { PROTOCOL_VERSION } from './index';

describe('protocol', () => {
    it('describes version 1 of the protocol', () => {
        expect(PROTOCOL_VERSION).toBe(1);
    });
});
