/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import queryString from 'query-string';
import classNames from 'classnames';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import Loading from '../partials/Loading';

import * as PanneauPropTypes from '../../lib/PropTypes';
import withResourceApi from '../../lib/withResourceApi';
import withListsCollection from '../../lib/withListsCollection';

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
    typeFilters: {
        id: 'core.buttons.resources.type_filters',
        description: 'The filters of the resource index page',
        defaultMessage: 'Filters',
    },
    search: {
        id: 'core.buttons.resources.search',
        description: 'The search placeholder',
        defaultMessage: 'Search',
    },
    confirmDelete: {
        id: 'core.resources.index.confirm_delete',
        description: 'The confirm message when deleting on the resource index page',
        defaultMessage: 'Are you sure you want to delete this item from {name}?',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    listsCollection: PanneauPropTypes.componentsCollection.isRequired,
    resource: PanneauPropTypes.resource.isRequired,
    resourceApi: PanneauPropTypes.resourceApi.isRequired,
    query: PropTypes.shape({
        page: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.object),
    title: PanneauPropTypes.message,
    errors: PropTypes.arrayOf(PropTypes.string),
    showAddButton: PropTypes.bool,
    showSearch: PropTypes.bool,
    showTypeFilters: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.message,
    typeFiltersLabel: PanneauPropTypes.message,
    searchLabel: PanneauPropTypes.message,
    confirmDeleteMessage: PanneauPropTypes.message,
    getResourceActionUrl: PropTypes.func.isRequired,
    gotoResourceAction: PropTypes.func.isRequired,
};

const defaultProps = {
    query: null,
    items: null,
    title: messages.title,
    errors: null,
    showAddButton: true,
    showSearch: false,
    showTypeFilters: false,
    addButtonLabel: messages.add,
    searchLabel: messages.search,
    typeFiltersLabel: messages.typeFilters,
    confirmDeleteMessage: messages.confirmDelete,
};

class ResourceIndex extends Component {
    static getDerivedStateFromProps({ query: nextQuery, errors: nextErrors }, { query, errors }) {
        const queryChanged = nextQuery !== query;
        const errorsChanged = nextErrors !== errors;
        if (queryChanged || errorsChanged) {
            return {
                query: queryChanged ? nextQuery : query,
                errors: errorsChanged ? nextErrors : errors,
                isLoading: queryChanged,
            };
        }
        return null;
    }

    static getQueryFromLocation(location = null) {
        return queryString.parse(location ? location.search : window.location.search) || {};
    }

    constructor(props) {
        super(props);

        this.onItemsLoaded = this.onItemsLoaded.bind(this);
        this.onItemsLoadError = this.onItemsLoadError.bind(this);
        this.onClickAction = this.onClickAction.bind(this);
        this.onItemDeleted = this.onItemDeleted.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearch = this.onSearch.bind(this);

        const query = ResourceIndex.getQueryFromLocation();

        this.state = {
            isLoading: props.items === null,
            query: null, // eslint-disable-line react/no-unused-state
            items: props.items,
            pagination: null,
            search: query.q || null,
            errors: props.errors,
        };
    }

    componentDidMount() {
        const { items } = this.state;
        if (items === null) {
            this.loadItems();
        }
    }

    componentDidUpdate({ query: prevQuery }, { items: prevItems }) {
        const { query } = this.props;
        const { items } = this.state;
        const itemsChanged = prevItems !== items;
        const queryChanged = prevQuery !== query;
        if ((itemsChanged && items === null) || queryChanged) {
            this.loadItems();
        }
    }

    onItemsLoaded(data) {
        if (this.isPaginated()) {
            const { data: items, ...pagination } = data;
            this.setState({
                items,
                pagination,
                isLoading: false,
            });
            return;
        }
        this.setState({
            items: data,
            isLoading: false,
        });
    }

    onItemsLoadError(errors) {
        this.setState({
            errors,
            isLoading: false,
        });
    }

    onClickAction(e, action, it) {
        const { getResourceActionUrl, gotoResourceAction } = this.props;
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
                this.deleteItem(it.id);
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
    }

    onItemDeleted({ id }) {
        this.setState(({ items }) => ({
            items: items.filter(it => it.id !== id),
        }));
    }

    onSearchChange(e) {
        const value = e.target.value ? e.target.value : null;
        this.setState({
            search: value,
        });
    }

    onSearch(e) {
        if (e.key === 'Enter') {
            const { getResourceActionUrl } = this.props;
            const { search } = this.state;
            const searchString = queryString.stringify({ q: search });
            const location = `${getResourceActionUrl('index')}?${searchString}`;
            window.location.href = location;
        }
    }

    isPaginated() {
        const { resource } = this.props;
        return get(resource, 'lists.index.pagination', get(resource, 'lists.pagination', false));
    }

    loadItems() {
        const { resourceApi, query } = this.props;
        const { q, type } = ResourceIndex.getQueryFromLocation() || {};
        const params = {};
        if (q) {
            params.q = q;
        }
        if (type) {
            params.type = type;
        }
        if (this.isPaginated()) {
            const page = query.page || null;
            if (page !== null) {
                params.page = page;
            }
        }
        resourceApi
            .index(params)
            .then(this.onItemsLoaded)
            .catch(this.onItemsLoadError);
    }

    deleteItem(id) {
        const {
            resource, resourceApi, intl, confirmDeleteMessage,
        } = this.props;

        const { name } = resource;
        const confirmMessage = get(resource, 'messages.confirm_delete', confirmDeleteMessage);
        const message = isObject(confirmMessage) && typeof confirmMessage.id !== 'undefined'
            ? intl.formatMessage(confirmMessage, {
                name,
                id,
            })
            : confirmMessage;

        // eslint-disable-next-line no-alert
        if (window.confirm(message)) {
            resourceApi.destroy(id).then(this.onItemDeleted);
        }
    }

    renderAddButton() {
        const { addButtonLabel, resource, getResourceActionUrl } = this.props;
        const resourceType = get(resource, 'type', 'default');
        const isTyped = resourceType === 'typed';
        const types = isTyped ? get(resource, 'types', []) : null;
        const buttonMessage = get(resource, 'messages.buttons.resources.add', null);
        const name = get(
            resource,
            'messages.names.a',
            get(resource, 'messages.name', resource.name),
        );
        const buttonLabel = isString(addButtonLabel) ? (
            addButtonLabel
        ) : (
            <FormattedMessage {...addButtonLabel} values={{ name }} />
        );
        return (
            <div
                className={classNames({
                    'btn-group': true,
                })}
            >
                {isTyped ? (
                    <button
                        type="button"
                        className={classNames({
                            btn: true,
                            'btn-primary': true,
                            'dropdown-toggle': isTyped,
                        })}
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        {buttonMessage !== null ? buttonMessage : buttonLabel}
                        {' '}
                        <span className="caret" />
                    </button>
                ) : (
                    <Link
                        to={getResourceActionUrl('create')}
                        className={classNames({
                            btn: true,
                            'btn-primary': true,
                        })}
                    >
                        {buttonMessage !== null ? buttonMessage : buttonLabel}
                    </Link>
                )}
                {isTyped ? (
                    <div className="dropdown-menu">
                        {types.map(({ id, label }) => (
                            <Link
                                key={`add-button-${id}`}
                                to={`${getResourceActionUrl('create')}?type=${id}`}
                                className="dropdown-item"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    renderHeader() {
        const { resource, title, showAddButton } = this.props;

        const message = get(resource, 'messages.titles.resources.index', null);
        const name = get(
            resource,
            'messages.names.plural',
            get(resource, 'messages.name', resource.name),
        );
        const defaultTitle = isString(title) ? (
            title
        ) : (
            <FormattedMessage {...title} values={{ name }} />
        );

        return (
            <div
                className={classNames({
                    'py-4': true,
                    [styles.header]: true,
                })}
            >
                <div className={styles.cols}>
                    <div className={styles.col}>
                        <h1 className={classNames([styles.title, 'mb-0', 'mt-0'])}>
                            {message !== null ? message : defaultTitle}
                        </h1>
                    </div>
                    <div
                        className={classNames({
                            [styles.col]: true,
                            'text-right': true,
                        })}
                    >
                        {showAddButton ? this.renderAddButton() : null}
                    </div>
                </div>
                {this.renderErrors()}
            </div>
        );
    }

    renderFilters() {
        const {
            intl,
            resource,
            getResourceActionUrl,
            typeFiltersLabel,
            searchLabel,
            showTypeFilters,
            showSearch,
        } = this.props;
        const { search } = this.state;

        const customFilters = get(resource, 'customFilters', null);
        const types = customFilters || get(resource, 'types', []);
        const lists = get(resource, 'lists', {});

        const withTypeFilters = lists.withTypeFilters || showTypeFilters;
        const withSearch = lists.withSearch || showSearch;

        if (!withTypeFilters && !withSearch) return null;

        const { type } = ResourceIndex.getQueryFromLocation() || {};
        const currentType = types.find(t => t.id === type);
        const typeLabel = currentType ? currentType.label || '' : typeFiltersLabel;
        const buttonLabel = isString(typeLabel) ? (
            typeLabel
        ) : (
            <FormattedMessage {...typeFiltersLabel} />
        );

        return (
            <div
                className={classNames({
                    [styles.filters]: true,
                    'd-flex': true,
                    'flex-row ': true,
                    'justify-content-between': true,
                })}
            >
                {withTypeFilters && types.length > 0 ? (
                    <div
                        className={classNames({
                            'btn-group': true,
                        })}
                    >
                        <button
                            type="button"
                            className={classNames({
                                btn: true,
                                'btn-primary': true,
                                'dropdown-toggle': true,
                            })}
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                            {buttonLabel}
                            {' '}
                            <span className="caret" />
                        </button>
                        <div className="dropdown-menu">
                            {types.map(({ id, label }) => (
                                <Link
                                    key={`add-button-${id}`}
                                    to={`${getResourceActionUrl('index')}?type=${id}`}
                                    className="dropdown-item"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}
                {withSearch ? (
                    <div
                        className={classNames({
                            'btn-group': true,
                        })}
                    >
                        <input
                            className={classNames({
                                input: true,
                                'form-control': true,
                            })}
                            type="text"
                            value={search || ''}
                            placeholder={intl.formatMessage(searchLabel)}
                            onChange={this.onSearchChange}
                            onKeyPress={this.onSearch}
                        />
                    </div>
                ) : null}
            </div>
        );
    }

    renderErrors() {
        const { errors } = this.state;

        const errorsClassNames = classNames({
            [styles.errors]: true,
        });

        /* eslint-disable react/no-array-index-key */
        return errors !== null && errors.length > 1 ? (
            <div className={errorsClassNames}>
                <ul>
                    {errors.map((error, index) => (
                        <li key={`error-${index}`}>{error}</li>
                    ))}
                </ul>
            </div>
        ) : null;
        /* eslint-enable react/no-array-index-key */
    }

    renderList() {
        const { resource, listsCollection } = this.props;
        const { items } = this.state;
        const list = get(resource, 'lists.index', get(resource, 'lists', {}));
        const { type, ...listProps } = list;
        const ListComponent = listsCollection.getComponent(type || 'table');

        const listClassNames = classNames({
            [styles.list]: true,
        });

        return ListComponent !== null ? (
            <div className={listClassNames}>
                <ListComponent
                    items={items || []}
                    onClickAction={this.onClickAction}
                    {...listProps}
                />
            </div>
        ) : null;
    }

    // eslint-disable-next-line class-methods-use-this
    renderPagination() {
        const { getResourceActionUrl, listsCollection } = this.props;
        const { pagination } = this.state;
        const Pagination = listsCollection.getComponent('pagination');
        return (
            <Pagination
                total={pagination.total}
                perPage={pagination.per_page}
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                url={getResourceActionUrl('index')}
            />
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderLoading() {
        const { items } = this.state;
        return (
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
        );
    }

    render() {
        const { items, pagination, isLoading } = this.state;
        const containerClassNames = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className="container">
                    <div className="row justify-content-md-center">
                        <div className="col-lg-8">
                            {this.renderHeader()}
                            {this.renderFilters()}
                            <div className={styles.listContainer}>
                                <div className={styles.list}>
                                    {items !== null ? this.renderList() : null}
                                </div>
                                {isLoading ? this.renderLoading() : null}
                            </div>
                            {pagination !== null && pagination.last_page > 1
                                ? this.renderPagination()
                                : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ResourceIndex.propTypes = propTypes;
ResourceIndex.defaultProps = defaultProps;

const WithResourceApi = withResourceApi()(ResourceIndex);
const WithListsCollectionContainer = withListsCollection()(WithResourceApi);
const WithIntlContainer = injectIntl(WithListsCollectionContainer);

export default WithIntlContainer;
