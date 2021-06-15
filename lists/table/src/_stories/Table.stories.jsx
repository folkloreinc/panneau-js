import { PropTypes } from 'prop-types';
import React from 'react';
import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/contexts';
import DisplayProvider from '../../../../packages/displays';
import Table from '../Table';

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
                columns={['title', 'description']}
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
            { id: '2', title: { fr: 'Paul2', en: 'Paul2' }, description: 'Paul2' },
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
