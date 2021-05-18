import isString from 'lodash/isString';

export const getColumnFromField = (field) => {
    if (field === null) {
        return null;
    }
    // eslint-disable-next-line camelcase
    const { name, components = null, settings: { orderInIndex: order } = {}, label } = field;
    return {
        id: name,
        label,
        valueKey: name,
        order,
        component: components !== null ? components.index_column || components.index || null : null,
        field,
    };
};

export const sortColumns = (columns) =>
    columns.sort(({ order: aOrder = null }, { order: bOrder = null }) => {
        if (aOrder === bOrder) {
            return 0;
        }
        if (aOrder === null) {
            return 1;
        }
        if (bOrder === null) {
            return -1;
        }
        return aOrder > bOrder ? 1 : -1;
    });

export const getColumnsFromResource = (resource) => {
    const { fields, columns: resourceColumns = null } = resource;
    const newColumns =
        resourceColumns !== null
            ? resourceColumns
                  .map((column) => {
                      const { field: fieldName = null } = isString(column)
                          ? { field: column }
                          : column;
                      return fieldName !== null
                          ? getColumnFromField(fields.find((it) => it.name === fieldName) || null)
                          : column;
                  })
                  .filter((it) => it !== null)
            : fields
                  .filter(
                      ({ settings: { hiddenInIndex = false } = {} }) => !hiddenInIndex,
                  )
                  .map((field) => getColumnFromField(field));
    return sortColumns(newColumns);
};

export default getColumnsFromResource;
