import { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import ToggleFilter from '../ToggleFilter';

export default {
    component: ToggleFilter,
    title: 'Filters/Toggle',
    parameters: {
        intl: true,
    },
};

function FieldContainer(props) {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ToggleFilter name="toggle" value={value} onChange={setValue} {...props} />
        </FieldsProvider>
    );
}

export const Normal = {
    render: () => <FieldContainer />,
};

export const WithLabel = {
    render: () => <FieldContainer label="Hello" />,
};
