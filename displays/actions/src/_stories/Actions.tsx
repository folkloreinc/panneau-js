import Actions from '../Actions';

export default {
    component: Actions,
    title: 'Displays/Actions',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <Actions
        item={{
            id: '3',
            name: 'ABC',
            url: 'test',
        }}
        value={{
            id: '3',
            name: 'ABC',
            url: 'test',
        }}
    />
);
