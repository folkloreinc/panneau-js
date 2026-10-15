import { useState } from 'react';

import Radios from '../Radios';

export default {
    title: 'Elements/Radios',
    component: Radios,
};

function Container(props) {
    const [value, setValue] = useState(null);
    return <Radios {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container options={['One', 'Two', 'Three']} />,
};
