import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';

import * as PanneauPropTypes from '../../../lib/panneau/PropTypes';
import { ResourceProvider } from '../../../contexts/ResourceContext';
import useResourceItem from '../../../hooks/useResourceItem';
import useResourceUrlGenerator from '../../../hooks/useResourceUrlGenerator';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
// import Button from '../buttons/Button';
import ResourceLabel from '../partials/ResourceLabel';
import ResourceDeleteForm from '../forms/ResourceDelete';

import resourcesMessages from '../resourcesMessages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const defaultProps = {};

const ResourceDeletePage = ({ resource, itemId }) => {
    // const { id } = resource;
    const history = useHistory();
    const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);
    const [editItem, setEditItem] = useState(item);
    const onSuccess = useCallback(() => history.push(`${resourceRoute('index')}?deleted=true`), [
        history,
        resourceRoute,
    ]);
    useEffect(() => {
        setEditItem(item);
    }, [item, setEditItem]);
    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={
                        <ResourceLabel resource={resource}>
                            {resourcesMessages.delete}
                        </ResourceLabel>
                    }
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {editItem !== null ? (
                                <ResourceDeleteForm
                                    resource={resource}
                                    item={editItem}
                                    onSuccess={onSuccess}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceDeletePage.propTypes = propTypes;
ResourceDeletePage.defaultProps = defaultProps;

export default ResourceDeletePage;
