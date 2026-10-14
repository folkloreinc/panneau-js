import FormStatus from '../FormStatus';

export default {
    component: FormStatus,
    title: 'Elements/FormStatus',
    parameters: {
        intl: true,
    },
};

export const Success = {
    render: () => <FormStatus status="success" />,
};

export const Loading = {
    render: () => <FormStatus status="loading" />,
};

export const Error = {
    render: () => <FormStatus status="error" />,
};
