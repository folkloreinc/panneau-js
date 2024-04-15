import isString from 'lodash/isString';

import getComponent from './getComponent';

export const getColumnFromField = (field) => {
    if (field === null) {
        return null;
    }
    // eslint-disable-next-line camelcase
    const { name, components: { display = null } = {}, label } = field;
    const { name: componentName = null, props: componentProps = null } = getComponent(display);
    return {
        ...componentProps,
        id: name,
        label,
        valueKey: name,
        component: componentName,
        field,
    };
};

export const getColumnsWithFields = (resource, columns) => {
    const { fields } = resource;
    const newColumns =
        columns !== null
            ? columns
                  .map((column) => {
                      const {
                          id: colId = null,
                          field: colField = null,
                          ...otherProps
                      } = isString(column) ? { field: column } : column;
                      const fieldName = colField || colId;
                      return {
                          ...(fieldName !== null
                              ? getColumnFromField(
                                    fields.find((it) => it.name === fieldName) || null,
                                )
                              : null),
                          ...otherProps,
                          id: colId || (isString(column) ? column : null) || null,
                      };
                  })
                  .filter((it) => it !== null)
            : [];

    return newColumns;
};

export default getColumnsWithFields;
