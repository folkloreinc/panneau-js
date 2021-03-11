const getDisplayName = ({ displayName = null, name = null }) =>
    displayName || name || 'Component';

export default getDisplayName;
