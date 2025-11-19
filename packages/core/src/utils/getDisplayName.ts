interface ComponentWithName {
    displayName?: string | null;
    name?: string | null;
}

const getDisplayName = ({ displayName = null, name = null }: ComponentWithName): string =>
    displayName || name || 'Component';

export default getDisplayName;
