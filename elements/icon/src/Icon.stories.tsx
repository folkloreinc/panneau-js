import Icon from './Icon';

export default {
    component: Icon,
    title: 'Elements/Icon',
};

export const Normal = {
    render: () => <Icon name="caret-down" />,
};

export const Bold = {
    render: () => <Icon name="caret-down" bold />,
};

export const Opaque = {
    render: () => <Icon name="caret-down" opaque />,
};
