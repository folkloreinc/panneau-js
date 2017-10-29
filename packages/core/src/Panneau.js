class Panneau {
    constructor(opts) {
        const options = {
            fieldsCollection: null,
            ...opts,
        };

        this.fieldsCollection = options.fieldsCollection;
    }
}

export default Panneau;
