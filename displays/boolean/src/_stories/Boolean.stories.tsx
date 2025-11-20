import Boolean from '../Boolean';

export default {
    component: Boolean,
    title: 'Displays/Boolean',
    parameters: {
        intl: true,
    },
};

export const True = {
    render: () => <Boolean value={true} />,
};

export const False = {
    render: () => <Boolean value={false} />,
};

export const TrueWithIcon = {
    render: () => <Boolean value={true} iconTrue="check" />,
};

export const FalseWithLabel = {
    render: () => <Boolean value={false} labelFalse="WRONG" />,
};
