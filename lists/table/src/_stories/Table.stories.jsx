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

const Container = ({ items, paginated = false, page = null, total = null, lastPage = null }) => (
    <ResourceProvider resource={pageResource}>
        <DisplayProvider>
            <Table
                resource={pageResource}
                items={items}
                paginated={paginated}
                page={page}
                total={total}
                lastPage={lastPage}
            />
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
    page: PropTypes.number,
    total: PropTypes.number,
    lastPage: PropTypes.number,
};
Container.defaultProps = {
    items: [],
    paginated: false,
    page: null,
    total: null,
    lastPage: null,
};

export const Normal = () => (
    <Container
        items={[
            { id: '1', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
            { id: '2', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
        ]}
    />
);

export const Paginated = () => (
    <Container
        items={[
            { id: '1', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
            { id: '2', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
            { id: '3', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
            { id: '4', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
            { id: '5', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
        ]}
        page={1}
        lastPage={2}
        total={5}
    />
);
