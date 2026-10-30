// TODO(panneau-5): `usePanneauResource` of `@panneau/core/contexts`: `useResource(id)` of `@panneau/core` gives `{ resource, form, list }`: the fields of the resource are `resource.fields`, fields of the protocol
import { usePanneauResource } from '@panneau/core/contexts';
// TODO(panneau-5): `useResourceItems` of `@panneau/data`: `useResourceList(resource, query)` of `@panneau/data/query`: its `data.data` are the items, and the query is a list query of the protocol (`page`, `perPage`, `filter`)
import { useResourceItems } from '@panneau/data';
import { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { TextField } from '@panneau/fields/text';
import { SelectField } from '@panneau/fields/select';
import { GroupField as Fields } from '@panneau/fields/group';
import { type FieldEntryProps, getFieldProps } from '@panneau/fields';
import { Fieldset } from '@panneau/ui';

const messages = defineMessages({
    selectPerson: {
        id: 'fields.select_person',
        defaultMessage: 'Select a person...',
    },
    noPeople: {
        id: 'fields.no_people',
        defaultMessage: 'No people',
    },
    createNew: {
        id: 'fields.create_new',
        defaultMessage: 'Create new',
    },
});

interface PersonValue {
    id?: string;
    name?: string;
    [key: string]: any;
}

interface PersonFieldProps {
    value?: PersonValue | null;
    personType?: string | null;
    onChange?: ((value: any) => void) | null;
}

export default function PersonField({ value = null, personType = null, onChange = null }: PersonFieldProps) {
    const intl = useIntl();
    const peopleResource = usePanneauResource('people');
    const { fields } = peopleResource || {};
    const { items: people } = useResourceItems(peopleResource!, { paginated: false, types: personType });
    const [addingNew, setAddingNew] = useState(false);

    const options = (people || []).map(({ name, ...person }: any) => ({
        label: name,
        value: { ...person, name },
    }));
    const { id = null, name = null } = value || {};

    if (id !== null) {
        // TODO(panneau-5): Bootstrap classes `btn`, `btn-danger` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
        return (
            <TextField
                value={name}
                disabled
                suffix={
                    <button type="button" className="btn btn-danger" onClick={() => onChange!(null)}>
                        &times;
                    </button>
                }
            />
        );
    }

    // TODO(panneau-5): `<Fields>` is `GroupField` of `@panneau/fields/group`: `fields` are fields of the definition of Panneau 5 (`Field[]` of `@panneau/protocol`)
    // TODO(panneau-5): `<SelectField>`: `noOptionsMessage` is not a prop of `SelectField` of `@panneau/fields/select`
    // TODO(panneau-5): Bootstrap classes `d-flex`, `align-items-center` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
    // TODO(panneau-5): Bootstrap class `flex-grow-1` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
    // TODO(panneau-5): Bootstrap classes `btn`, `btn-primary`, `ms-2` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
    return (
        <div className="d-flex align-items-center">
            {addingNew ? (
                <Fields className="flex-grow-1" fields={fields} value={value} onChange={onChange} />
            ) : (
                <>
                    <SelectField
                        className="flex-grow-1"
                        value={value}
                        options={options}
                        onChange={onChange}
                        placeholder={intl.formatMessage(messages.selectPerson)}
                        noOptionsMessage={intl.formatMessage(messages.noPeople)}
                    />
                    <button type="button" className="btn btn-primary ms-2" onClick={() => setAddingNew(true)}>
                        <FormattedMessage {...messages.createNew} />
                    </button>
                </>
            )}
        </div>
    );
}

// TODO(panneau-5): `PersonFieldEntry` reads `personType` from the `settings` of the field: give it with `settings()` of the PHP field
/** The registry entry of `PersonField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function PersonFieldEntry(props: FieldEntryProps) {
    const { label, description, errors, required, className } = getFieldProps(props);
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
        >
            <PersonField
                value={props.value as PersonFieldProps['value']}
                personType={props.field.settings?.personType as PersonFieldProps['personType']}
                onChange={props.onChange}
            />
        </Fieldset>
    );
}
