import isString from 'lodash/isString';

export const getColumnFromField = (field) => {
    if (field === null) {
        return null;
    }
    // eslint-disable-next-line camelcase
    const { name, components = null, label } = field;
    return {
        id: name,
        label,
        valueKey: name,
        component: components !== null ? components.display || null : null,
        field,
    };
};

export const getColumnsWithFields = (resource, columns) => {
    const { fields } = resource;
    const newColumns =
        columns !== null
            ? columns
                  .map((column) => {
                      const { field: fieldName = null, ...otherProps } = isString(column)
                          ? { field: column }
                          : column;
                      return { 
                        ...(fieldName !== null
                          ? getColumnFromField(fields.find((it) => it.name === fieldName) || null)
                          : null),
                        ...otherProps
                    };
                  })
                  .filter((it) => it !== null) : [];
            
    return newColumns;
};

export default getColumnsWithFields;
