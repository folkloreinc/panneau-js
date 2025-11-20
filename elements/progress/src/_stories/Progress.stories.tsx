import ProgressElement from '../Progress';

export default {
    component: ProgressElement,
    title: 'Elements/Progress',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <ProgressElement />,
};
