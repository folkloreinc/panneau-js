import { useFieldComponent, usePanneauResource } from '@panneau/core/contexts';
import { useResourceItems } from '@panneau/data';
import { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

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
    const TextField = useFieldComponent('text');
    const SelectField = useFieldComponent('select');
    const Fields = useFieldComponent('fields');
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
        return (
            <TextField
                value={name}
                disabled
                append={
                    <button type="button" className="btn btn-danger" onClick={() => onChange!(null)}>
                        &times;
                    </button>
                }
            />
        );
    }

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
