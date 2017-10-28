class FieldsCollection {
    static normalizeKey(key) {
        return key.replace(/[^A-Za-z0-9]/gi, '').toLowerCase();
    }

    constructor(fields) {
        this.fields = {};
        this.addFields(fields);
    }

    addField(key, Component) {
        this.fields[FieldsCollection.normalizeKey(key)] = Component;
    }

    addFields(fields) {
        Object.keys(fields || {}).forEach((key) => {
            this.addField(key, fields[key]);
        });
    }

    getFields() {
        return this.fields;
    }

    getComponent(key) {
        const normalizedKey = FieldsCollection.normalizeKey(key);
        const foundKey = Object.keys(this.fields).find(fieldKey => fieldKey === normalizedKey);
        return typeof foundKey !== 'undefined' && foundKey !== null ? this.fields[foundKey] : null;
    }
}


export default FieldsCollection;
