import ButtonsElement from '../Buttons';

export default {
    component: ButtonsElement,
    title: 'Elements/Buttons',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <ButtonsElement
            items={[
                { label: 'hello', theme: 'primary' },
                { label: 'goodbye', theme: 'success' },
            ]}
        />
    ),
};
