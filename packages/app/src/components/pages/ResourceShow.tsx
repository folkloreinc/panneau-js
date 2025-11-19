import React from 'react';
import { FormattedMessage } from 'react-intl';
import type { Resource } from '@panneau/core/types';

import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import Loading from '@panneau/element-loading';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

interface ResourceShowPageProps {
    resource: Resource;
    itemId: string;
}

function ResourceShowPage({ resource, itemId }: ResourceShowPageProps) {
    const { name } = resource;
    const { item, loading, error } = useResourceItem(resource, itemId);
    const { type = null } = item || {};

    return (
        <ResourceProvider resource={resource}>
            <MainLayout loading={loading}>
                {item !== null ? (
                    <ResourceForm
                        resource={resource}
                        item={item}
                        type={type}
                        disabled
                        header={<PageHeader title={`${name} #${itemId}`} small />}
                        withContainer
                    />
                ) : null}
                {item === null && loading && !error ? (
                    <Loading withDelay>
                        <FormattedMessage defaultMessage="Loading" description="Loading label" />
                    </Loading>
                ) : null}
            </MainLayout>
        </ResourceProvider>
    );
}

export default ResourceShowPage;
