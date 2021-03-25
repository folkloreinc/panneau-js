import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
// import Button from '../buttons/Button';
import ResourceLabel from '../partials/ResourceLabel';
import ResourceForm from '../partials/ResourceForm';

import resourcesMessages from '../resourcesMessages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const defaultProps = {};

const ResourceEditPage = ({ resource, itemId }) => {
    // const { id } = resource;
    // const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);
    const [editItem, setEditItem] = useState(item);
    const onSuccess = useCallback((newItem) => setEditItem(newItem), []);
    useEffect(() => {
        setEditItem(item);
    }, [item, setEditItem]);
    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={
                        <ResourceLabel resource={resource}>{resourcesMessages.edit}</ResourceLabel>
                    }
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {editItem !== null ? (
                                <ResourceForm
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
ResourceEditPage.propTypes = propTypes;
ResourceEditPage.defaultProps = defaultProps;

export default ResourceEditPage;
