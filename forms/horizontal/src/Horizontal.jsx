/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

// import Button from '@panneau/element-button';

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
    className: PropTypes.string,
};

const HorizontalForm = ({
    fields = null,
    status = null,
    value = null,
    onChange,
    className = null,
    onSubmit = null,
    ...props
}) => {
    const FieldsComponent = useFieldComponent('fields');
    return (
        <Form onSubmit={onSubmit} className={className} status={status} {...props}>
            <FieldsComponent
                fields={fields.map((f) => ({ ...f, horizontal: true }))}
                value={value}
                onChange={onChange}
            />
        </Form>
    );
};

HorizontalForm.propTypes = propTypes;

export default HorizontalForm;
