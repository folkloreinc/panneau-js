import { describe, expect, it } from 'vitest';

import { withLeavingItems } from './leaving';

const item = (id: string) => ({ id });

describe('withLeavingItems', () => {
    it('puts the items that left back where they were', () => {
        expect(
            withLeavingItems(
                [item('a'), item('c')],
                [
                    { item: item('b'), index: 1 },
                    { item: item('d'), index: 3 },
                ],
            ).map(({ id }) => id),
        ).toEqual(['a', 'b', 'c', 'd']);
    });

    it('puts them at the end when the list got shorter', () => {
        expect(withLeavingItems([], [{ item: item('z'), index: 5 }]).map(({ id }) => id)).toEqual([
            'z',
        ]);
    });
});
