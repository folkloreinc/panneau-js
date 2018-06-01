/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import queryString from 'query-string';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { withUrlGenerator } from '@folklore/react-app';
import { PulseLoader } from 'react-spinners';

import * as PanneauPropTypes from '../../lib/PropTypes';
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
    confirmDelete: {
        id: 'core.resources.index.confirm_delete',
        description: 'The confirm message when deleting on the resource index page',
        defaultMessage: 'Are you sure you want to delete this item from {name}?',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    urlGenerator: PanneauPropTypes.urlGenerator.isRequired,
    listsCollection: PanneauPropTypes.componentsCollection.isRequired,
    resource: PanneauPropTypes.resource.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
        search: PropTypes.string.isRequired,
    }).isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    title: PanneauPropTypes.message,
    errors: PropTypes.arrayOf(PropTypes.string),
    showAddButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.message,
    confirmDeleteMessage: PanneauPropTypes.message,
    getResourceActionUrl: PropTypes.func.isRequired,
    gotoResourceAction: PropTypes.func.isRequired,
};

const defaultProps = {
    items: null,
    title: messages.title,
    errors: null,
    showAddButton: true,
    addButtonLabel: messages.add,
    confirmDeleteMessage: messages.confirmDelete,
};

class ResourceIndex extends Component {
    constructor(props) {
        super(props);

        this.onItemsLoaded = this.onItemsLoaded.bind(this);
        this.onItemsLoadError = this.onItemsLoadError.bind(this);
        this.onItemActions = this.onItemActions.bind(this);
        this.onItemDeleted = this.onItemDeleted.bind(this);

        this.state = {
            isLoading: props.items === null,
            items: props.items,
            pagination: null,
            errors: props.errors,
        };
    }

    componentDidMount() {
        const { items } = this.state;
        if (items === null) {
            this.loadItems();
        }
    }

    componentWillReceiveProps(nextProps) {
        const itemsChanged = nextProps.items !== this.props.items;
        if (itemsChanged) {
            this.setState({
                items: nextProps.items,
                isLoading: nextProps.items === null,
            });
        }

        const locationChanged = nextProps.location !== this.props.location;
        if (locationChanged) {
            this.setState({
                isLoading: true,
            });
        }

        const errorsChanged = nextProps.errors !== this.props.errors;
        if (errorsChanged) {
            this.setState({
                errors: nextProps.errors,
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const itemsChanged = prevState.items !== this.state.items;
        const locationChanged = prevProps.location !== this.props.location;
        if ((itemsChanged && this.state.items === null) || locationChanged) {
            this.loadItems();
        }
    }

    onItemsLoaded(data) {
        if (this.isPaginated()) {
            const { data: items, ...pagination } = data;
            this.setState({
                items,
                pagination,
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

    onItemActions(e, action, it) {
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
        this.setState({
            items: this.state.items.filter(it => it.id !== id),
        });
    }

    isPaginated() {
        const { resource } = this.props;
        return get(resource, 'lists.index.pagination', get(resource, 'lists.pagination', false));
    }

    loadItems() {
        const { resource, location } = this.props;
        const params = {};
        if (this.isPaginated()) {
            const query = queryString.parse(location.search);
            const page = query.page || null;
            if (page !== null) {
                params.page = page;
            }
        }
        resource.api
            .index(params)
            .then(this.onItemsLoaded)
            .catch(this.onItemsLoadError);
    }

    deleteItem(id) {
        const { resource, intl, confirmDeleteMessage } = this.props;
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
            resource.api.destroy(id).then(this.onItemDeleted);
        }
    }

    renderAddButton() {
        const { addButtonLabel, resource, urlGenerator } = this.props;
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
                        {buttonMessage !== null ? buttonMessage : buttonLabel}{' '}
                        <span className="caret" />
                    </button>
                ) : (
                    <Link
                        to={urlGenerator.route('resource.create', {
                            resource: resource.id,
                        })}
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
                                to={{
                                    pathname: urlGenerator.route('resource.create', {
                                        resource: resource.id,
                                    }),
                                    search: `?type=${id}`,
                                    state: {
                                        type: id,
                                    },
                                }}
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
                        <h1
                            className={classNames({
                                'display-4': true,
                                [styles.title]: true,
                            })}
                        >
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

    renderErrors() {
        const { errors } = this.state;

        const errorsClassNames = classNames({
            [styles.errors]: true,
        });

        /* eslint-disable react/no-array-index-key */
        return errors !== null && errors.length > 1 ? (
            <div className={errorsClassNames}>
                <ul>{errors.map((error, index) => <li key={`error-${index}`}>{error}</li>)}</ul>
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
                    onClickActions={this.onItemActions}
                    {...listProps}
                />
            </div>
        ) : null;
    }

    // eslint-disable-next-line class-methods-use-this
    renderPagination() {
        const { resource, listsCollection, urlGenerator } = this.props;
        const { pagination } = this.state;
        const Pagination = listsCollection.getComponent('pagination');
        return (
            <Pagination
                total={pagination.total}
                perPage={pagination.per_page}
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                url={urlGenerator.route('resource.index', {
                    resource: resource.id,
                })}
            />
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderLoading() {
        return (
            <div className={styles.loading}>
                <div className={styles.middle}>
                    <PulseLoader loading />
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
                            <div className={styles.listContainer}>
                                <div className={styles.list}>
                                    {items !== null ? this.renderList() : null}
                                </div>
                                {isLoading ? this.renderLoading() : null}
                            </div>
                            {pagination !== null ? this.renderPagination() : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ResourceIndex.propTypes = propTypes;
ResourceIndex.defaultProps = defaultProps;

const mapStateToProps = ({ panneau }, { match, location, urlGenerator }) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(match, 'params.resource', null);
    return {
        resource:
            resources.find(it =>
                (resourceId !== null && it.id === resourceId) ||
                    (resourceId === null &&
                        urlGenerator.route(`resource.${it.id}.index`) === location.pathname)) || null,
    };
};

const mapDispatchToProps = (dispatch, { urlGenerator }) => {
    const getResourceActionUrl = (resource, action, id) =>
        (typeof resource.routes !== 'undefined'
            ? urlGenerator.route(`resource.${resource.id}.${action}`, {
                id: id || null,
            })
            : urlGenerator.route(`resource.${action}`, {
                resource: resource.id,
                id: id || null,
            }));
    return {
        getResourceActionUrl,
        gotoResourceAction: (resource, action, id) =>
            dispatch(push(getResourceActionUrl(resource, action, id))),
    };
};

const mergeProps = (
    stateProps,
    { getResourceActionUrl, gotoResourceAction, ...dispatchProps },
    ownProps,
) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    getResourceActionUrl: (action, id) => getResourceActionUrl(stateProps.resource, action, id),
    gotoResourceAction: (action, id) => gotoResourceAction(stateProps.resource, action, id),
});

const WithStateComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(ResourceIndex);
const WithRouterContainer = withRouter(WithStateComponent);
const WithListsCollectionContainer = withListsCollection()(WithRouterContainer);
const WithUrlGeneratorContainer = withUrlGenerator()(WithListsCollectionContainer);
const WithIntlContainer = injectIntl(WithUrlGeneratorContainer);
export default WithIntlContainer;
