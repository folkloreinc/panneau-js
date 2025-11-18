/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

const propTypes = {
    fields: PanneauPropTypes.fields.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    status: PanneauPropTypes.formStatus,
    generalError: PropTypes.string,
    errors: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(['submit', 'button', 'link', 'reset']),
            id: PropTypes.string,
            label: PropTypes.string,
            position: PropTypes.string,
            onClick: PropTypes.func,
        }),
    ),
    disabled: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
};

function NormalForm({
    fields = null,
    status = null,
    value = null,
    onChange,
    onSubmit = null,
    buttons = null,
    disabled = false,
    children = null,
    className = null,
    ...props
}) {
    const FieldsComponent = useFieldComponent('fields');

    return (
        <Form
            className={classNames([
                'form',
                {
                    [className]: className !== null,
                },
            ])}
            status={status}
            buttons={buttons}
            disabled={disabled}
            onSubmit={onSubmit}
            {...props}
        >
            {children !== null ? (
                children
            ) : (
                <FieldsComponent
                    fields={fields}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            )}
        </Form>
    );
}

NormalForm.propTypes = propTypes;

export default NormalForm;
