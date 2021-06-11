import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import MainLayout from '../layouts/Main';
import messages from '../messages';
import PageHeader from '../partials/PageHeader';
import ResourceForm from '../partials/ResourceForm';
// import Button from '../buttons/Button';
import ResourceLabel from '../partials/ResourceLabel';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const defaultProps = {};

const ResourceEditPage = ({ resource, itemId }) => {
    // console.log(itemId);
    // const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);
    const { type: resourceType = null } = item || {};
    const [editItem, setEditItem] = useState(item);
    const onSuccess = useCallback((newItem) => setEditItem(newItem), []);
    useEffect(() => {
        setEditItem(item);
    }, [item, setEditItem]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={<ResourceLabel resource={resource} message={messages.edit} />}
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {editItem !== null ? (
                                <ResourceForm
                                    resource={resource}
                                    messages={messages}
                                    item={editItem}
                                    type={resourceType}
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
