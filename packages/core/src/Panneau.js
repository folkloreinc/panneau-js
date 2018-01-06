/**
 * Panneau Application
 */
class Panneau {
    constructor(opts) {
        const options = {
            fieldsCollection: null,
            ...opts,
        };

        this.fieldsCollection = options.fieldsCollection;
    }

    /**
     * Set the Fields collection
     * @param {FieldsCollection} fieldsCollection The new fields collection
     */
    setFields(fieldsCollection) {
        this.fieldsCollection = fieldsCollection;
    }
}

export default Panneau;
