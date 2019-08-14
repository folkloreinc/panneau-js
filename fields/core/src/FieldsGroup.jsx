/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import set from 'lodash/set';
import isArray from 'lodash/isArray';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useComponents } from '@panneau/core/contexts';

import FormGroup from './FormGroup';

import styles from './styles/fields-group.scss';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: PropTypes.objectOf(PanneauPropTypes.errors),
    fields: PropTypes.arrayOf(PanneauPropTypes.definitions.field),
    getFieldComponent: PropTypes.func,
    fieldsComponents: PanneauPropTypes.components, // eslint-disable-line react/forbid-prop-types
    renderNotFound: PropTypes.func,
    columns: PropTypes.number,
    collapsible: PropTypes.bool,
    collapsibleTypes: PropTypes.arrayOf(PropTypes.string),
    collapsed: PropTypes.bool,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    errors: null,
    fields: [],
    getFieldComponent: null,
    fieldsComponents: null,
    renderNotFound: null,
    columns: null,
    collapsible: false,
    collapsibleTypes: [],
    collapsed: false,
    onChange: null,
    readOnly: false,
};

const FieldsGroup = ({
    label,
    fields,
    collapsible,
    collapsed,
    columns,
    value,
    errors,
    collapsibleTypes,
    readOnly,
    name,
    fieldsComponents,
    getFieldComponent,
    renderNotFound,
    onChange,
}) => {
    const fieldsCollection = useComponents('fields', fieldsComponents);
    const renderField = useCallback(
        (it, index) => {
            const {
                type,
                name: fieldName = null,
                hidden,
                defaultValue,
                props: extraProps = {},
                ...props
            } = it;
            if (hidden === true) {
                return null;
            }

            const FieldComponent =
                getFieldComponent !== null
                    ? getFieldComponent(type)
                    : fieldsCollection.getComponent(type);
            if (FieldComponent === null) {
                if (renderNotFound !== null) {
                    return renderNotFound(it, index);
                }
                return (
                    <div
                        key={`notfound-${fieldName}${type}${index}`}
                    >{`NOT FOUND: Field ${fieldName} of type ${type}`}</div>
                );
            }

            const fieldDefaultValue =
                typeof defaultValue !== 'undefined' ? defaultValue : undefined;
            const fieldValue =
                fieldName !== null ? get(value || {}, fieldName, fieldDefaultValue) : value;
            let fieldErrors =
                errors !== null && fieldName !== null
                    ? Object.entries(errors).reduce((acc, [key, errs]) => {
                          const escapedName = fieldName.replace('.', '\\.');
                          const regexp = new RegExp(`^${escapedName}\\.|^${escapedName}$`);
                          if (regexp.test(key)) {
                              return [...acc, ...(isArray(errs) ? errs : [errs])];
                          }
                          return acc;
                      }, [])
                    : errors;
            if (isArray(fieldErrors) && fieldErrors.length === 0) {
                fieldErrors = undefined;
            }
            const fieldCollapsible = collapsibleTypes.indexOf(type) !== -1 || it.collapsible;
            const fieldCollapsed =
                it.collapsed || (fieldCollapsible && typeof fieldValue === 'undefined');

            return (
                <FieldComponent
                    {...props}
                    key={`${fieldName}${type}${index}`}
                    collapsible={fieldCollapsible}
                    collapsed={fieldCollapsed}
                    {...extraProps}
                    name={
                        name !== null
                            ? `${name}${
                                  fieldName !== null ? `[${fieldName.replace(/\./, '][')}]` : ''
                              }`
                            : fieldName
                    }
                    value={fieldValue}
                    disabled={readOnly}
                    errors={fieldErrors}
                    onChange={newFieldValue => {
                        const hasName = fieldName !== null;
                        const newValue = {
                            ...value,
                            ...(!hasName ? newFieldValue : null),
                        };
                        if (hasName) {
                            set(newValue, fieldName, newFieldValue);
                        }
                        if (onChange !== null) {
                            onChange(newValue);
                        }
                    }}
                />
            );
        },
        [value, errors, collapsibleTypes, readOnly, name, onChange],
    );

    let fieldsGroup;
    if (columns !== null) {
        const remainingFields = [].concat(fields);
        const fieldsWithoutColumns = fields.reduce(
            (total, field) => (typeof field.column === 'undefined' ? total + 1 : total),
            0,
        );
        const fieldsByColumn = Math.ceil(fieldsWithoutColumns / columns);
        const cols = [];
        for (let colIndex = 0; colIndex < columns; colIndex += 1) {
            const col = [];
            const colFields = remainingFields.filter(
                field => typeof field.column !== 'undefined' && field.column === colIndex,
            );
            if (colFields.length > 0) {
                colFields.forEach(colField => {
                    const index = fields.findIndex(field => field === colField);
                    col.push(renderField(colField, index));
                    const remainingIndex = remainingFields.findIndex(field => field === colField);
                    if (remainingIndex !== -1) {
                        remainingFields.splice(1, remainingIndex);
                    }
                });
            } else {
                for (let i = 0; i < fieldsByColumn; i += 1) {
                    const remainingIndex = remainingFields.findIndex(
                        field => typeof field.column === 'undefined',
                    );
                    if (remainingIndex !== -1) {
                        const colField = remainingFields[remainingIndex];
                        const index = fields.findIndex(field => field === colField);
                        col.push(renderField(colField, index));
                        remainingFields.splice(1, remainingIndex);
                    }
                }
            }
            cols.push(
                <div className={`col-sm-${12 / columns}`} key={`col-${colIndex}`}>
                    {col}
                </div>,
            );
        }

        fieldsGroup = (
            <div className={styles.group}>
                <div className="row">{cols}</div>
            </div>
        );
    } else {
        fieldsGroup = <div className={styles.group}>{fields.map(renderField)}</div>;
    }

    return label !== null ? (
        <FormGroup
            label={label}
            className={styles.container}
            collapsible={collapsible}
            collapsed={collapsed}
        >
            {fieldsGroup}
        </FormGroup>
    ) : (
        <div className={styles.container}>{fieldsGroup}</div>
    );
};

FieldsGroup.propTypes = propTypes;
FieldsGroup.defaultProps = defaultProps;

export default FieldsGroup;
