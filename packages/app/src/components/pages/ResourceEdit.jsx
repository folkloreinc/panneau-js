import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import { ResourceMessage } from '@panneau/intl';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
// import Button from '../buttons/Button';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const defaultProps = {};

const ResourceEditPage = ({ resource, itemId }) => {
    const { item } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
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
                        <ResourceMessage
                            resource={resource}
                            id="resources.edit"
                            defaultMessage="Edit {a_singular}"
                            description="Page title"
                        />
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
                                    type={type}
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
