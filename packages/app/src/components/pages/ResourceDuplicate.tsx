import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'wouter';

import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceTypeName, useResourceUrlGenerator } from '@panneau/core/hooks';
import type { Resource } from '@panneau/core/types';
import { useResourceItem } from '@panneau/data';
import Loading from '@panneau/element-loading';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

interface ResourceDuplicatePageProps {
    itemId: string;
    resource: Resource;
}

function ResourceDuplicatePage({ itemId, resource }: ResourceDuplicatePageProps) {
    const [, navigate] = useLocation();
    const resourceRoute = useResourceUrlGenerator(resource);
    const { item, loading, error } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
    const resourceValues = useResourceValues(resource);
    const typeName = useResourceTypeName(resource, type);

    const onSuccess = useCallback(
        ({ id = null } = {}) => navigate(`${resourceRoute('edit', { id })}?duplicated=true`),
        [navigate, resourceRoute],
    );

    return (
        <ResourceProvider resource={resource}>
            <MainLayout loading={loading}>
                {item !== null ? (
                    <ResourceForm
                        resource={resource}
                        item={item}
                        onSuccess={onSuccess}
                        isDuplicate
                        withContainer
                        header={
                            <PageHeader
                                title={
                                    <>
                                        <FormattedMessage
                                            values={resourceValues}
                                            defaultMessage="Duplicate {a_singular}"
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
                {item === null && loading && !error ? (
                    <Loading className="w-10 m-auto" withDelay>
                        <FormattedMessage defaultMessage="Loading" description="Loading label" />
                    </Loading>
                ) : null}
            </MainLayout>
        </ResourceProvider>
    );
}

export default ResourceDuplicatePage;
