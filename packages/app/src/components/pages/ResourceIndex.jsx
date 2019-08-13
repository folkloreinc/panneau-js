/* eslint-disable jsx-a11y/anchor-is-valid, react/no-array-index-key */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { PropTypes as PanneauPropTypes, useResourceApi } from '@panneau/core';
import { useComponent } from '@panneau/core/contexts';
import { Loading, Errors } from '@panneau/core/components';

import ResourceIndexHeader from '../partials/ResourceIndexHeader';

import styles from '../../styles/pages/resource-index.scss';

const messages = defineMessages({
    add: {
        id: 'core.buttons.resources.add',
        description: 'The label of the "add" index button',
        defaultMessage: 'Add {name}',
    },
    title: {
        id: 'core.titles.resources.index',
        description: 'The title of the resource index page',
        defaultMessage: '{name}',
    },
    confirmDelete: {
        id: 'core.resources.index.confirm_delete',
        description: 'The confirm message when deleting on the resource index page',
        defaultMessage: 'Are you sure you want to delete this item from {name}?',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    resource: PanneauPropTypes.definitions.resource.isRequired,
    query: PropTypes.shape({
        page: PropTypes.string,
    }),
    title: PanneauPropTypes.message,
    showAddButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.message,
    confirmDeleteMessage: PanneauPropTypes.message,
    getResourceActionUrl: PropTypes.func.isRequired,
    gotoResourceAction: PropTypes.func.isRequired,
};

const defaultProps = {
    query: null,
    title: messages.title,
    showAddButton: true,
    addButtonLabel: messages.add,
    confirmDeleteMessage: messages.confirmDelete,
};

const ResourceIndex = ({
    intl,
    resource,
    query,
    title,
    addButtonLabel,
    confirmDeleteMessage,
    getResourceActionUrl,
    gotoResourceAction,
    showAddButton,
}) => {
    const [request, setRequest] = useState({
        isLoading: false,
        query: null,
        items: null,
        errors: null,
        pagination: null,
    });
    const resourceApi = useResourceApi(resource);
    const { isLoading, items, pagination, errors } = request;
    const {
        lists = {},
        messages: resourceMessages = {},
    } = resource;
    const { type: listType, pagination: hasPagination = false, ...listProps } = lists.index || lists;

    useEffect(() => {
        if (isLoading) {
            return null;
        }
        let canceled = false;
        const onItemsLoaded = data => {
            if (canceled) {
                return;
            }
            if (hasPagination) {
                const { data: newItems, ...newPagination } = data;
                setRequest({
                    ...request,
                    items: newItems,
                    pagination: newPagination,
                    isLoading: false,
                });
                return;
            }
            setRequest({
                ...request,
                items: data,
                isLoading: false,
            });
        };

        const onItemsLoadError = newErrors => {
            if (canceled) {
                return;
            }
            setRequest({
                ...request,
                errors: newErrors,
                isLoading: false,
            });
        };

        const { page = null } = query || {};
        const params = {};
        if (hasPagination && page !== null) {
            params.page = page;
        }
        resourceApi
            .index(params)
            .then(onItemsLoaded)
            .catch(onItemsLoadError);

        setRequest({
            ...request,
            isLoading: true,
        });

        return () => {
            canceled = true;
        };
    }, [query, hasPagination]);

    const deleteItem = useCallback(
        id => {
            const onItemDeleted = ({ id: itemId }) => {
                setRequest({
                    ...request,
                    items: items.filter(it => it.id !== itemId),
                });
            };

            const { name } = resource;
            const confirmMessage = get(resourceMessages, 'confirm_delete', confirmDeleteMessage);
            const message =
                isObject(confirmMessage) && typeof confirmMessage.id !== 'undefined'
                    ? intl.formatMessage(confirmMessage, {
                          name,
                          id,
                      })
                    : confirmMessage;
            // eslint-disable-next-line no-alert
            if (window.confirm(message)) {
                resourceApi.destroy(id).then(onItemDeleted);
            }
        },
        [resource, request],
    );

    const onClickAction = useCallback(
        (e, action, it) => {
            const useRouter = get(action, 'useRouter', true);

            switch (action.id) {
                case 'edit':
                case 'show':
                    if (useRouter) {
                        gotoResourceAction(action.id, it.id);
                    } else {
                        window.location.href = getResourceActionUrl(action.id);
                    }
                    break;
                case 'delete': {
                    const hasPage = get(action, 'hasPage', false);
                    if (!hasPage) {
                        deleteItem(it.id);
                    } else if (useRouter) {
                        gotoResourceAction(action.id, it.id);
                    } else {
                        window.location.href = getResourceActionUrl(action.id);
                    }
                    break;
                }
                default:
                    break;
            }
        },
        [deleteItem, gotoResourceAction, getResourceActionUrl],
    );

    // Components
    const ListComponent = useComponent(listType || 'table', 'lists');
    const Pagination = useComponent('pagination', 'lists');

    return (
        <div className={classNames([styles.container])}>
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-lg-8">
                        <ResourceIndexHeader
                            resource={resource}
                            title={title}
                            addButtonLabel={addButtonLabel}
                            showAddButton={showAddButton}
                            getResourceActionUrl={getResourceActionUrl}
                        />
                        <div className={styles.listContainer}>
                            <Errors errors={errors} />
                            <div className={styles.list}>
                                {items !== null && ListComponent !== null ? (
                                    <div className={styles.list}>
                                        <ListComponent
                                            items={items || []}
                                            onClickAction={onClickAction}
                                            {...listProps}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {isLoading ? (
                                <div
                                    className={classNames({
                                        [styles.loading]: true,
                                        [styles.alone]: items === null,
                                    })}
                                >
                                    <div className={styles.inner}>
                                        <div className={styles.middle}>
                                            <Loading loading />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        {pagination !== null && pagination.last_page > 1 ? (
                            <Pagination
                                total={pagination.total}
                                perPage={pagination.per_page}
                                currentPage={pagination.current_page}
                                lastPage={pagination.last_page}
                                url={getResourceActionUrl('index')}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

ResourceIndex.propTypes = propTypes;
ResourceIndex.defaultProps = defaultProps;

export default injectIntl(ResourceIndex);
