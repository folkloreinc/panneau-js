import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceItem } from '@panneau/data';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
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

const ResourceDeletePage = ({ resource, itemId }) => {
    const history = useHistory();
    const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);

    const onSuccess = useCallback(
        () => history.push(`${resourceRoute('index')}?deleted=true`),
        [history, resourceRoute],
    );

    // Navigate back
    const { entries, length } = history || {};
    const previousEntry = length > 1 ? entries[length - 2] : null;
    const previous = previousEntry?.pathname || null;

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={<ResourceLabel resource={resource} message={messages.delete} />}
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {item !== null ? (
                                <ResourceForm
                                    component="delete"
                                    resource={resource}
                                    messages={messages}
                                    item={item}
                                    onSuccess={onSuccess}
                                    previous={previous}
                                    isDelete
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
