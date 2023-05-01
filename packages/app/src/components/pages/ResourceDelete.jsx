// import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider, usePagesComponentsManager } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceItem } from '@panneau/data';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceDeletePage = ({ resource }) => {
    const { name } = resource;
    const { id: itemId } = useParams();
    const navigate = useNavigate();
    const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);
    const resourceValues = useResourceValues(resource);

    const pagesComponentsManager = usePagesComponentsManager();
    const CustomPage = pagesComponentsManager.getComponent(`${name}Delete`);

    const onSuccess = useCallback(
        () => navigate(`${resourceRoute('index')}?deleted=true`),
        [navigate, resourceRoute],
    );

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                {CustomPage !== null ? (
                    <CustomPage resource={resource} item={item} onSuccess={onSuccess} isDelete />
                ) : (
                    <>
                        <PageHeader
                            title={
                                <FormattedMessage
                                    values={resourceValues}
                                    defaultMessage="Delete {a_singular}"
                                    description="Page title"
                                />
                            }
                            small
                        />
                        <div className="container-sm py-4">
                            <div className="row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-7">
                                    {item !== null ? (
                                        <ResourceForm
                                            resource={resource}
                                            item={item}
                                            onSuccess={onSuccess}
                                            isDelete
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
ResourceDeletePage.propTypes = propTypes;
ResourceDeletePage.defaultProps = defaultProps;

export default ResourceDeletePage;
