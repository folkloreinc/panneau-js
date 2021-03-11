export const validateFields = (fields, value) =>
    fields.reduce((acc, field) => {
        if (acc === true) {
            if (field.type === 'fields' && field.fields) {
                return validateFields(field.fields, value);
            }
            const val = value && value[field.name] ? value[field.name] : false;
            return !(field.required && !val);
        }
        return acc;
    }, true);

export default validateFields;
