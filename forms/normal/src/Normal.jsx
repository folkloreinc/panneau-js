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

const defaultProps = {
    status: null,
    value: null,
    onSubmit: null,
    generalError: null,
    errors: null,
    buttons: null,
    disabled: false,
    children: null,
    className: null,
};

const NormalForm = ({
    fields,
    status,
    value,
    onChange,
    onSubmit,
    buttons,
    disabled,
    children,
    className,
    ...props
}) => {
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
};

NormalForm.propTypes = propTypes;
NormalForm.defaultProps = defaultProps;

export default NormalForm;
