import type { Item } from '../types';

type GetLabelFunction = (item: Item, path: string | string[] | null) => unknown;

function getItemLabel(
    it: Item,
    path: string | string[] | null,
    getLabel: GetLabelFunction,
    withId: boolean = false,
): unknown {
    const { id = null } = it || {};
    if (withId) {
        const label = getLabel(it, path);
        return label ? `${label} (#${id})` : `#${id}`;
    }
    return path !== null ? getLabel(it, path) : `#${id}`;
}

export default getItemLabel;
