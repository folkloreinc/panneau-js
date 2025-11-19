import queryString from 'query-string';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useSearch } from 'wouter';
import type { Resource } from '@panneau/core/types';

import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceTypeName, useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

interface ResourceCreatePageProps {
    resource: Resource;
}

function ResourceCreatePage({ resource }: ResourceCreatePageProps) {
    const [, navigate] = useLocation();
    const search = useSearch();
    const resourceRoute = useResourceUrlGenerator(resource);

    const { type = null } = useMemo(
        () => queryString.parse(search, { arrayFormat: 'bracket' }),
        [search],
    );
    const resourceValues = useResourceValues(resource);
    const typeName = useResourceTypeName(resource, type);

    const onSuccess = useCallback(() => {
        navigate(`${resourceRoute('index')}?created=true`);
    }, [navigate, resourceRoute]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <ResourceForm
                    resource={resource}
                    type={type}
                    onSuccess={onSuccess}
                    withContainer
                    header={
                        <PageHeader
                            title={
                                <>
                                    <FormattedMessage
                                        values={resourceValues}
                                        defaultMessage="Create {a_singular}"
                                        description="Page title"
                                    />
                                    {typeName !== null ? (
                                        <span className="text-body-secondary"> ({typeName})</span>
                                    ) : null}
                                </>
                            }
                            small
                        />
                    }
                />
            </MainLayout>
        </ResourceProvider>
    );
}

export default ResourceCreatePage;
