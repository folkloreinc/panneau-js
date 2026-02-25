import isString from 'lodash/isString';
import type { Field, Resource, TableColumn } from '../types';

import getComponent from './getComponent';

interface Column extends Record<string, unknown> {
    id?: string | null;
    label?: unknown;
    valueKey?: string;
    component?: string | null;
    field?: Field | string | null;
}

export const getColumnFromField = (field: Field | null): Column | null => {
    if (field === null) {
        return null;
    }
    // eslint-disable-next-line camelcase
    const { name, components: { display = null } = {}, label } = field as Field & {
        components?: { display?: unknown };
    };
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

export const getColumnsWithFields = (
    resource: Resource,
    columns: TableColumn[] | null,
): Column[] => {
    const { fields = [] } = resource;
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
                  .filter((it): it is Column => it !== null)
            : [];

    return newColumns;
};

export default getColumnsWithFields;
