import AlertElement from '../Alert';

export default {
    component: AlertElement,
    title: 'Elements/Alert',
    parameters: {
        intl: true,
    },
};

export const Success = {
    render: () => <AlertElement theme="success">Good alert</AlertElement>,
};

export const Error = {
    render: () => <AlertElement theme="danger">Bad alert</AlertElement>,
};
