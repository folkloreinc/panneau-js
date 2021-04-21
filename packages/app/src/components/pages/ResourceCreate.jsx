import React, { useCallback } from 'react';
import { useHistory } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { ResourceProvider, usePanneauMessages } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
// import Button from '../buttons/Button';
import ResourceLabel from '../partials/ResourceLabel';
import ResourceForm from '../partials/ResourceForm';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceCreatePage = ({ resource }) => {
    const messages = usePanneauMessages();
    const history = useHistory();
    const resourceRoute = useResourceUrlGenerator(resource);
    const onSuccess = useCallback(() => {
        history.push(`${resourceRoute('index')}?created=true`);
    }, [history, resourceRoute]);
    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={<ResourceLabel resource={resource}>{messages?.create}</ResourceLabel>}
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            <ResourceForm
                                resource={resource}
                                messages={messages}
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
