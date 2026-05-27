import isString from 'lodash/isString';
import { ElementType } from 'react';

import type { Column, Field, Resource, TableColumn } from '../types';
import getComponent from './getComponent';

export function getColumnFromField(field: Field | null): Column | null {
    if (field === null) {
        return null;
    }
    const {
        name,
        components: { display = null } = {},
        label,
    } = field as Field & {
        components?: {
            display?: string | { component: string | ElementType; [key: string]: unknown };
        };
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
}

export function getColumnsWithFields(resource: Resource, columns: TableColumn[] | null): Column[] {
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
                  .filter((it) => it !== null)
            : [];

    return newColumns;
}

export default getColumnsWithFields;
