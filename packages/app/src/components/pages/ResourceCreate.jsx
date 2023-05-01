import queryString from 'query-string';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider, usePagesComponentsManager } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceCreatePage = ({ resource }) => {
    const { name } = resource;
    const navigate = useNavigate();
    const { search } = useLocation();
    const resourceRoute = useResourceUrlGenerator(resource);

    const { type = null } = useMemo(() => queryString.parse(search), [search]);
    const resourceValues = useResourceValues(resource);

    const pagesComponentsManager = usePagesComponentsManager();
    const CustomPage = pagesComponentsManager.getComponent(`${name}Create`);

    const onSuccess = useCallback(() => {
        navigate(`${resourceRoute('index')}?created=true`);
    }, [navigate, resourceRoute]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                {CustomPage !== null ? (
                    <CustomPage resource={resource} type={type} onSuccess={onSuccess} />
                ) : (
                    <>
                        <PageHeader
                            title={
                                <FormattedMessage
                                    values={resourceValues}
                                    defaultMessage="Create {a_singular}"
                                    description="Page title"
                                />
                            }
                            small
                        />
                        <div className="container-sm py-4">
                            <div className="row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-7">
                                    <ResourceForm
                                        resource={resource}
                                        type={type}
                                        onSuccess={onSuccess}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceCreatePage.propTypes = propTypes;
ResourceCreatePage.defaultProps = defaultProps;

export default ResourceCreatePage;
