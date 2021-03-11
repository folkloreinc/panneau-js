const getFieldByName = (fields, name) =>
    fields.reduce((foundField, it) => {
        if (foundField !== null) {
            return foundField;
        }
        const { name: fieldName = null, fields: subFields = [] } = it;
        if (name !== null && fieldName === name) {
            return it;
        }
        return getFieldByName(subFields, name);
    }, null);

export default getFieldByName;
