/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import { parse as parseQuery, stringify as stringifyQuery } from 'query-string';
import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider, useComponentsManager } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Alert from '@panneau/element-alert';
import Button from '@panneau/element-button';
import { ResourceMessage } from '@panneau/intl';

import ResourceCreateButton from '../buttons/ResourceCreate';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
import ResourceItemsList from '../partials/ResourceItemsList';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    defaultActions: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    defaultActions: ['create'],
};

const ResourceIndexPage = ({ resource, defaultActions }) => {
    const { name, settings = {}, index = {} } = resource;
    const { canCreate = true, indexIsPaginated: paginated = false } = settings || {};
    const { actions = null } = index || {};
    const finalActions = useMemo(
        () =>
            (actions || defaultActions.filter((it) => it !== 'create' || canCreate)).map((it) =>
                it === 'create'
                    ? {
                          id: 'create',
                          component: ResourceCreateButton,
                          size: 'lg',
                          theme: 'primary',
                      }
                    : it,
            ),
        [canCreate, actions],
    );

    const componentsManager = useComponentsManager();
    const { search } = useLocation();
    const history = useHistory();
    const query = useMemo(() => parseQuery(search), [search]);
    const listQuery = useMemo(() => query, [query]); // TODO: omit routes
    const { created = false, deleted = false } = query || {};

    const resourceRoute = useResourceUrlGenerator(resource);
    const url = resourceRoute('index');

    const onQueryChange = useCallback(
        (submitQuery) => {
            const newQuery =
                submitQuery !== null
                    ? Object.keys(submitQuery).reduce((currentQuery, key) => {
                          const value = submitQuery[key];
                          return value !== null
                              ? {
                                    ...currentQuery,
                                    [key]: value,
                                }
                              : currentQuery;
                      }, null)
                    : null;
            history.push(
                `${url}${
                    newQuery !== null
                        ? `?${stringifyQuery(newQuery, {
                              arrayFormat: 'bracket',
                          })}`
                        : ''
                }`,
            );
        },
        [history, url, query, paginated],
    );

    const onQueryReset = useCallback(() => {
        const queryString = stringifyQuery(null, {
            arrayFormat: 'bracket',
        });
        history.push(`${url}?${queryString}`);
    }, [history, url, paginated]);

    const onClickCloseAlert = useCallback(() => {
        history.replace(url);
    }, [history, url]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={name}
                    actions={
                        finalActions.length > 0 ? (
                            <div className="d-flex align-items-center">
                                {finalActions.map(({ id, component = Button, ...actionProps }) => {
                                    const ActionComponent = isString(component)
                                        ? componentsManager.getComponent(component)
                                        : component;
                                    return ActionComponent !== null ? (
                                        <ActionComponent
                                            key={`action-${id}`}
                                            {...actionProps}
                                            {...(ActionComponent !== Button
                                                ? {
                                                      resource,
                                                      query,
                                                      onQueryChange,
                                                  }
                                                : {})}
                                        />
                                    ) : null;
                                })}
                            </div>
                        ) : null
                    }
                />
                <div className={classNames(['container-sm py-4'])}>
                    {created ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <ResourceMessage
                                resource={resource}
                                id="resources.created"
                                defaultMessage="{the_singular} has been created."
                                description="Alert message"
                            />
                        </Alert>
                    ) : null}
                    {deleted ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <ResourceMessage
                                resource={resource}
                                id="resources.deleted"
                                defaultMessage="{the_singular} has been deleted."
                                description="Alert message"
                            />
                        </Alert>
                    ) : null}
                    <ResourceItemsList
                        resource={resource}
                        baseUrl={url}
                        query={listQuery}
                        paginated={paginated}
                        onQueryChange={onQueryChange}
                        onQueryReset={onQueryReset}
                    />
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceIndexPage.propTypes = propTypes;
ResourceIndexPage.defaultProps = defaultProps;

export default ResourceIndexPage;
