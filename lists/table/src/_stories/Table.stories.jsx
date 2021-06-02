import React from 'react';
import { PropTypes } from 'prop-types';

import pageResource from '../../../../.storybook/data/page-resource';

import Table from '../Table';

import { ResourceProvider } from '../../../../packages/core/contexts';
import DisplayProvider from '../../../../packages/displays';

export default {
    component: Table,
    title: 'Lists/Table',
    parameters: {
        intl: true,
    },
};

const Container = ({ items, paginated = false }) => (
    <ResourceProvider resource={pageResource}>
        <DisplayProvider>
            <Table resource={pageResource} items={items} paginated={paginated} />
        </DisplayProvider>
    </ResourceProvider>
);

Container.propTypes = {
    items: PropTypes.oneOf([
        PropTypes.arrayOf(PropTypes.shape({})),
        PropTypes.shape({
            data: PropTypes.arrayOf(PropTypes.shape({})),
            pagination: PropTypes.shape({
                page: PropTypes.number,
                last_page: PropTypes.number,
                per_page: PropTypes.number,
                total: PropTypes.number,
            }),
        }),
    ]),
    paginated: PropTypes.bool,
};
Container.defaultProps = {
    items: [],
    paginated: false,
};

export const Normal = () => <Container data={[{ id: '1', label: 'Paul', name: 'Paul' }]} />;

export const Paginated = () => (
    <Container
        items={{
            data: [
                { id: '1', label: 'Paul1', name: 'Paul1' },
                { id: '2', label: 'Paul2', name: 'Paul2' },
                { id: '3', label: 'Paul3', name: 'Paul3' },
                { id: '4', label: 'Paul4', name: 'Paul4' },
                { id: '5', label: 'Paul5', name: 'Paul5' },
                { id: '6', label: 'Paul6', name: 'Paul6' },
                { id: '7', label: 'Paul7', name: 'Paul7' },
                { id: '8', label: 'Paul8', name: 'Paul8' },
            ],
            pagination: { page: 1, last_page: 3, total: 2, per_page: 3 },
        }}
        paginated
    />
);
