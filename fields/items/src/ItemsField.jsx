/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
// import isFunction from 'lodash/isFunction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line
    newDefaultValue: PropTypes.object, // eslint-disable-line
    noItemLabel: PanneauPropTypes.label,
    addItemLabel: PanneauPropTypes.label,
    itemFieldLabel: PropTypes.oneOfType([PropTypes.func, PanneauPropTypes.label]),
    itemComponent: PropTypes.elementType,
    itemsField: PanneauPropTypes.field,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    newDefaultValue: {},
    noItemLabel: (
        <FormattedMessage
            defaultMessage="No item..."
            description="Label when there is no item in items field"
        />
    ),
    addItemLabel: (
        <FormattedMessage defaultMessage="Add an item" description="Button label in items field" />
    ),
    // eslint-disable-next-line react/prop-types
    itemFieldLabel: ({ index }) => (
        <FormattedMessage
            defaultMessage="#{index}"
            description="Item label in items field"
            values={{ index }}
        />
    ),
    itemComponent: null,
    itemsField: null,
    className: null,
    onChange: null,
};

const ItemsField = ({
    name,
    value,
    newDefaultValue,
    noItemLabel,
    addItemLabel,
    // eslint-disable-next-line no-unused-vars
    itemFieldLabel,
    itemComponent,
    itemsField,
    className,
    onChange,
}) => {

    const onClickAdd = useCallback(() => {
        const newValue = [...(value || []), newDefaultValue];
        if (onChange !== null) {
            onChange(newValue);
        }
    }, [value, onChange, newDefaultValue, name]);

    const onItemChange = useCallback(
        (index, newValue) => {
            if (onChange !== null) {
                const newValues = [...value];
                newValues[index] = newValue;
                onChange(newValues);
            }
        },
        [value, onChange],
    );

    return null;
    /*
    return (
        <div className={className}>
            {value !== null ? (
                <div className="list-group">
                    {value.map((itemValue, index) => (
                        <ItemComponent
                            {...itemsField}
                            key={`item-${index}`}
                            name={`${name}.${index}`}
                            value={itemValue}
                            onChange={(newValue) => onItemChange(index, newValue)}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-4">
                    <Label>{noItemLabel}</Label>
                </div>
            )}
            <div className="mt-2">
                <Button
                    theme="primary"
                    size="sm"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={onClickAdd}
                >
                    <Label>{addItemLabel}</Label>
                </Button>
            </div>
        </div>
    );
    */
};

ItemsField.propTypes = propTypes;
ItemsField.defaultProps = defaultProps;

export default ItemsField;