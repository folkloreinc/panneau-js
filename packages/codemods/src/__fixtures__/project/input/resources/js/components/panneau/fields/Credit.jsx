import { useFieldComponent } from '@panneau/core/contexts';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    value: PropTypes.shape({
        person: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
        roles: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
    }),
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    onChange: null,
};

function CreditField({ value, onChange }) {
    const ResourceItem = useFieldComponent('resource-item');
    const { person = null, roles = [] } = value || {};
    const change = (key) => (newValue) => {
        if (onChange !== null) {
            onChange({ ...value, [key]: newValue });
        }
    };
    return (
        <div>
            <ResourceItem resource="people" value={person} onChange={change('person')} />
            <ResourceItem resource="roles" multiple value={roles} onChange={change('roles')} />
        </div>
    );
}

CreditField.propTypes = propTypes;
CreditField.defaultProps = defaultProps;

export default CreditField;
