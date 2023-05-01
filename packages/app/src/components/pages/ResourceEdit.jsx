// import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider, usePagesComponentsManager } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

// import Button from '../buttons/Button';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceEditPage = ({ resource }) => {
    const { name } = resource;
    const { id: itemId } = useParams();
    const { item } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
    const [editItem, setEditItem] = useState(item);

    const pagesComponentsManager = usePagesComponentsManager();
    const CustomPage = pagesComponentsManager.getComponent(`${name}Edit`);

    const onSuccess = useCallback((newItem) => setEditItem(newItem), []);

    useEffect(() => {
        setEditItem(item);
    }, [item, setEditItem]);

    const resourceValues = useResourceValues(resource);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                {CustomPage !== null ? (
                    <CustomPage
                        resource={resource}
                        item={editItem}
                        type={type}
                        onSuccess={onSuccess}
                    />
                ) : (
                    <>
                        <PageHeader
                            title={
                                <FormattedMessage
                                    values={resourceValues}
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
                    </>
                )}
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceEditPage.propTypes = propTypes;
ResourceEditPage.defaultProps = defaultProps;

export default ResourceEditPage;
