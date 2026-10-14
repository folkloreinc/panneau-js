import LoadingElement from '../Loading';

export default {
    component: LoadingElement,
    title: 'Elements/Loading',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <LoadingElement>Loading</LoadingElement>,
};

export const Warning = {
    render: () => <LoadingElement theme="warning">Loading</LoadingElement>,
};
