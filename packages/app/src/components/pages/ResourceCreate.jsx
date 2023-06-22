import queryString from 'query-string';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from '@folklore/routes';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceTypeName, useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceCreatePage = ({ resource }) => {
    const [{ search }, navigate] = useLocation();
    const resourceRoute = useResourceUrlGenerator(resource);

    const { type = null } = useMemo(() => queryString.parse(search), [search]);
    const resourceValues = useResourceValues(resource);
    const typeName = useResourceTypeName(resource, type);

    const onSuccess = useCallback(() => {
        navigate(`${resourceRoute('index')}?created=true`);
    }, [navigate, resourceRoute]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
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
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            <ResourceForm resource={resource} type={type} onSuccess={onSuccess} />
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceCreatePage.propTypes = propTypes;
ResourceCreatePage.defaultProps = defaultProps;

export default ResourceCreatePage;
