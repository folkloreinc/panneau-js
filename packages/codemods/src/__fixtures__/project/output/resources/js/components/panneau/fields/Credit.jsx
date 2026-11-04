import PropTypes from 'prop-types';
import React from 'react';

import { RelationField as ResourceItem } from '@panneau/fields/relation';
import { getFieldProps } from '@panneau/fields';
import { Fieldset } from '@panneau/ui';

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
    const { person = null, roles = [] } = value || {};
    const change = (key) => (newValue) => {
        if (onChange !== null) {
            onChange({ ...value, [key]: newValue });
        }
    };
    // TODO(panneau-5): `<ResourceItem>` is `RelationField` of `@panneau/fields/relation`: it searches the resource through the relation source of the app: `resource` is its id
    return (
        <div>
            <ResourceItem resource="people" value={person} onChange={change('person')} />
            <ResourceItem resource="roles" multiple value={roles} onChange={change('roles')} />
        </div>
    );
}

CreditField.propTypes = propTypes;
CreditField.defaultProps = defaultProps;

/** The registry entry of `CreditField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function CreditFieldEntry(props) {
    const { label, description, errors, required, className } = getFieldProps(props);
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
        >
            <CreditField
                value={props.value}
                onChange={props.onChange}
            />
        </Fieldset>
    );
}

export default CreditField;
