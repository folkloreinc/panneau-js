const getFileName = (url: string | null = null): string | null => {
    if (url === null || typeof url.match === 'undefined') {
        return null;
    }
    const match = url.match(/([^/]+)(\?.*)?$/);
    return match ? match[1] : url;
};

export default getFileName;
