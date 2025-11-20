import EmptyElement from '../Empty';

export default {
    component: EmptyElement,
    title: 'Elements/Empty',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <EmptyElement>Empty</EmptyElement>,
};

export const Warning = {
    render: () => <EmptyElement theme="warning">Empty</EmptyElement>,
};
