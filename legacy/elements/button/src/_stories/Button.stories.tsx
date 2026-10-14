import ButtonElement from '../Button';

export default {
    component: ButtonElement,
    title: 'Elements/Button',
    parameters: {
        intl: true,
    },
};

export const WithIcon = {
    render: () => <ButtonElement label="Hello" theme="primary" outline />,
};

export const Outline = {
    render: () => <ButtonElement label="Hello" theme="primary" outline />,
};

export const SmallDanger = {
    render: () => <ButtonElement label="Hello" theme="danger" size="sm" />,
};

export const BigInfo = {
    render: () => <ButtonElement label="Hello" theme="info" size="lg" />,
};
