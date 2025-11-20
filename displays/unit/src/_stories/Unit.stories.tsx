import Unit from '../Unit';

export default {
    component: Unit,
    title: 'Displays/Unit',
    parameters: {
        intl: true,
    },
};

export const Bytes = {
    render: () => <Unit format="bytes" value={1092138} />,
};

export const Duration = {
    render: () => <Unit format="duration" value="1092138" />,
};

export const Dimensions = {
    render: () => <Unit format="dimensions" value={{ width: 30, height: 40 }} />,
};

export const Dimensions3D = {
    render: () => <Unit format="dimensions" value={{ width: 30, height: 40, depth: 50 }} />,
};
