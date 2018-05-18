class Url {
    constructor(options) {
        this.options = {
            ...options,
            schemes: ['http://', 'https://', 'ftp://'],
        };
    }

    setOptions(options) {
        this.options = {
            ...this.options,
            ...options,
        };
    }

    getSchemesPattern() {
        const { schemes } = this.options;
        return new RegExp(`^(${schemes.join('|')})`, 'i');
    }

    getScheme(url) {
        const { schemes } = this.options;
        const schemesPattern = this.getSchemesPattern();
        const match = url !== null ? url.match(schemesPattern) : null;
        return match !== null && match[1].length !== url.length
            ? match[1].toLowerCase()
            : schemes[0];
    }

    withScheme(url, prefix) {
        const schemesPattern = this.getSchemesPattern();
        return url !== null && !url.match(schemesPattern) ? `${prefix}${url}` : url;
    }

    removeScheme(url) {
        const schemesPattern = this.getSchemesPattern();
        return url !== null ? url.replace(schemesPattern, '') : null;
    }
}

export default Url;
