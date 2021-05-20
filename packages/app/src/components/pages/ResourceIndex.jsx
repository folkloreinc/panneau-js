import React, { useCallback, useMemo } from 'react';
import { parse as parseQuery, stringify as stringifyQuery } from 'query-string';
import { useLocation, useHistory } from 'react-router';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';

import Alert from '@panneau/element-alert';

import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
import ResourceLabel from '../partials/ResourceLabel';
import ResourceCreateButton from '../buttons/ResourceCreate';
import ResourceItemsList from '../lists/ResourceItems';

import messages from '../messages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceIndexPage = ({ resource }) => {
    const { name, settings = {}, components: { index = {} } = {} } = resource;
    const { canCreate = true, indexIsPaginated: paginated = false } = settings || {};
    const { component: indexComponent = null, props: indexProps = null } = index || {};

    const { search } = useLocation();
    const history = useHistory();
    const query = useMemo(() => parseQuery(search), [search]);
    const listQuery = useMemo(() => query, [query]); // TODO: omit routes
    const { created = false, deleted = false } = query || {};

    const resourceRoute = useResourceUrlGenerator(resource);
    const url = resourceRoute('index');
    const onQueryChange = useCallback(
        (submitQuery) => {
            history.push(
                `${url}?${stringifyQuery(submitQuery, {
                    arrayFormat: 'bracket',
                })}`,
            );
        },
        [history, url],
    );
    const onClickCloseAlert = useCallback(() => {
        history.replace(url);
    }, [history, url]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={name}
                    actions={
                        canCreate ? (
                            <ResourceCreateButton resource={resource} size="lg" theme="primary" />
                        ) : null
                    }
                />
                <div className={classNames(['container-sm py-4'])}>
                    {created ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <ResourceLabel resource={resource} message={messages.created} />
                        </Alert>
                    ) : null}
                    {deleted ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <ResourceLabel resource={resource} message={messages.deleted} />
                        </Alert>
                    ) : null}
                    <ResourceItemsList
                        resource={resource}
                        messages={messages}
                        baseUrl={url}
                        query={listQuery}
                        paginated={paginated}
                        component={indexComponent}
                        componentProps={indexProps}
                        onQueryChange={onQueryChange}
                    />
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceIndexPage.propTypes = propTypes;
ResourceIndexPage.defaultProps = defaultProps;

export default ResourceIndexPage;
