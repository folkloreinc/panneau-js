import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceTypeName } from '@panneau/core/hooks';
import type { Item, Resource } from '@panneau/core';
import { useResourceItem } from '@panneau/data';
import Loading from '@panneau/element-loading';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

interface ResourceEditPageProps {
    itemId: string;
    resource: Resource;
}

function ResourceEditPage({ itemId, resource }: ResourceEditPageProps) {
    const { item, loading, error } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
    const [editItem, setEditItem] = useState<Item | null>(item);
    const typeName = useResourceTypeName(resource, type);
    const onSuccess = useCallback((newItem: Item) => setEditItem(newItem), []);

    useEffect(() => {
        setEditItem(item);
    }, [item, setEditItem]);

    const resourceValues = useResourceValues(resource);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout loading={loading}>
                {editItem !== null ? (
                    <ResourceForm
                        resource={resource}
                        item={editItem}
                        type={type}
                        onSuccess={onSuccess}
                        withContainer
                        header={
                            <PageHeader
                                title={
                                    <>
                                        <FormattedMessage
                                            values={resourceValues}
                                            defaultMessage="Edit {a_singular}"
                                            description="Page title"
                                        />
                                        {typeName !== null ? (
                                            <span className="text-body-secondary">
                                                {' '}
                                                ({typeName})
                                            </span>
                                        ) : null}
                                    </>
                                }
                                small
                            />
                        }
                    />
                ) : null}
                {editItem === null && loading && !error ? (
                    <Loading className="mw-25 my-4 m-auto" withDelay>
                        <FormattedMessage defaultMessage="Loading" description="Loading label" />
                    </Loading>
                ) : null}
            </MainLayout>
        </ResourceProvider>
    );
}

export default ResourceEditPage;
