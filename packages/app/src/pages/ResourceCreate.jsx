import React, { useCallback } from 'react';
import { useHistory } from 'react-router';

import * as PanneauPropTypes from '../../../lib/panneau/PropTypes';
import { ResourceProvider } from '../../../contexts/ResourceContext';
import useResourceUrlGenerator from '../../../hooks/useResourceUrlGenerator';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
// import Button from '../buttons/Button';
import ResourceLabel from '../partials/ResourceLabel';
import ResourceCreateForm from '../forms/ResourceCreate';

import resourcesMessages from '../resourcesMessages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceCreatePage = ({ resource }) => {
    const history = useHistory();
    const resourceRoute = useResourceUrlGenerator(resource);
    const onSuccess = useCallback(() => {
        history.push(`${resourceRoute('index')}?created=true`);
    }, [history, resourceRoute]);
    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={
                        <ResourceLabel resource={resource}>
                            {resourcesMessages.create}
                        </ResourceLabel>
                    }
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            <ResourceCreateForm resource={resource} onSuccess={onSuccess} />
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
