import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { parse as parseQuery } from 'query-string';
import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';
import MainLayout from '../layouts/Main';
import messages from '../messages';
import PageHeader from '../partials/PageHeader';
import ResourceForm from '../partials/ResourceForm';
import ResourceLabel from '../partials/ResourceLabel';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceCreatePage = ({ resource }) => {
    const history = useHistory();
    const { search } = useLocation();
    const resourceRoute = useResourceUrlGenerator(resource);
    const onSuccess = useCallback(() => {
        history.push(`${resourceRoute('index')}?created=true`);
    }, [history, resourceRoute]);

    const { type = null } = useMemo(() => parseQuery(search), [search]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={<ResourceLabel resource={resource} message={messages.create} />}
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            <ResourceForm
                                resource={resource}
                                messages={messages}
                                type={type}
                                onSuccess={onSuccess}
                            />
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
