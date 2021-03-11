const getFileName = (url = null) => {
    if (url === null || typeof url.match === 'undefined') {
        return null;
    }
    return url.match(/([^/]+)(\?.*)?$/)[1] || url;
};

export default getFileName;
