interface ComponentWithName {
    displayName?: string | null;
    name?: string | null;
}

function getDisplayName({ displayName = null, name = null }: ComponentWithName): string {
    return displayName || name || 'Component';
}

export default getDisplayName;
