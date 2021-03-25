/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/element-form';
import Fields from '@panneau/field-fields';
// import Button from '@panneau/element-button';

const propTypes = {
    fields: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
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
    children: PropTypes.node,
    className: PropTypes.string,
};

const defaultProps = {
    status: null,
    value: null,
    generalError: null,
    errors: null,
    buttons: [{ type: 'submit' }],
    children: null,
    className: null,
};

const ResourceFormDefault = ({
    fields,
    status,
    children,
    value,
    onChange,
    className,
    onSubmit,
    ...props
}) => {
    return (
        <Form onSubmit={onSubmit} className={className} status={status} {...props}>
            {children !== null ? (
                children
            ) : (
                <Fields fields={fields} value={value} onChange={onChange} />
            )}
        </Form>
    );
};

ResourceFormDefault.propTypes = propTypes;
ResourceFormDefault.defaultProps = defaultProps;

export default ResourceFormDefault;
