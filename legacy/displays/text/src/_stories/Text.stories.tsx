import Text from '../Text';

export default {
    component: Text,
    title: 'Displays/Text',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <Text value="Hello! I am text" />,
};
