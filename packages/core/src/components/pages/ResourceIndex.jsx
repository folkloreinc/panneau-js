/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isString from 'lodash/isString';
import classNames from 'classnames';
import queryString from 'query-string';
import { defineMessages, FormattedMessage } from 'react-intl';
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
});

const propTypes = {
    listsCollection: PanneauPropTypes.componentsCollection.isRequired,
    urlGenerator: PropTypes.shape({
        route: PropTypes.func,
    }).isRequired,
    resource: PanneauPropTypes.resource.isRequired,
    location: PropTypes.shape({}).isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    title: PanneauPropTypes.message,
    errors: PropTypes.arrayOf(PropTypes.string),
    showAddButton: PropTypes.bool,
    addButtonLabel: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            id: PropTypes.string,
            description: PropTypes.string,
            defaultMessage: PropTypes.string,
        }),
    ]),
    gotoResourceCreate: PropTypes.func,
    gotoResourceEdit: PropTypes.func,
    gotoResourceShow: PropTypes.func,
    gotoResourceDelete: PropTypes.func,
};

const defaultProps = {
    items: null,
    title: messages.title,
    errors: null,
    showAddButton: true,
    addButtonLabel: messages.add,
    gotoResourceCreate: PropTypes.func,
    gotoResourceEdit: PropTypes.func,
    gotoResourceShow: PropTypes.func,
    gotoResourceDelete: PropTypes.func,
};

class ResourceIndex extends Component {
    constructor(props) {
        super(props);

        this.onItemsLoaded = this.onItemsLoaded.bind(this);
        this.onItemsLoadError = this.onItemsLoadError.bind(this);
        this.onItemActions = this.onItemActions.bind(this);
        this.onItemDeleted = this.onItemDeleted.bind(this);

        this.state = {
            items: props.items,
            pagination: null,
            errors: props.errors,
        };
    }

    componentDidMount() {
        this.loadItems();
    }

    componentWillReceiveProps(nextProps) {
        const itemsChanged = nextProps.items !== this.props.items;
        if (itemsChanged) {
            this.setState({
                items: nextProps.items,
            });
        }

        const locationChanged = nextProps.location !== this.props.location;
        if (locationChanged) {
            this.setState({
                items: null,
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
        if (itemsChanged && this.state.items === null) {
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
        });
    }

    onItemsLoadError(errors) {
        this.setState({
            errors,
        });
    }

    onItemActions(e, action, it) {
        const {
            gotoResourceEdit,
            gotoResourceShow,
            // gotoResourceDelete,
        } = this.props;

        if (action.id === 'edit') {
            if (gotoResourceEdit !== null) {
                gotoResourceEdit(it.id);
            }
        } else if (action.id === 'show') {
            if (gotoResourceShow !== null) {
                gotoResourceShow(it.id);
            }
        } else if (action.id === 'delete') {
            this.deleteItem(it.id);
            // if (gotoResourceDelete !== null) {
            //     gotoResourceDelete(it.id);
            // }
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
        const { resource } = this.props;
        const { name } = resource;
        // @TODO quick implementation; instead, use a pretty modal or something
        // eslint-disable-next-line no-alert
        if (window.confirm(`Are you sure you want to delete item ID ${id} from ${name}?`)) {
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
            <div
                className={classNames({
                    'py-4': true,
                    [styles.loading]: true,
                })}
            >
                <PulseLoader loading />
            </div>
        );
    }

    render() {
        const { items, pagination } = this.state;
        const containerClassNames = classNames({
            [styles.container]: true,
        });
        const isLoading = items === null;

        return (
            <div className={containerClassNames}>
                <div className="container">
                    <div className="row justify-content-md-center">
                        <div className="col-lg-8">
                            {this.renderHeader()}
                            {isLoading ? this.renderLoading() : this.renderList()}
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

const mapDispatchToProps = (dispatch, { urlGenerator }) => ({
    gotoResourceCreate: resource =>
        dispatch(push(urlGenerator.route('resource.create', {
            resource: resource.id,
        }))),
    gotoResourceEdit: (resource, id) =>
        dispatch(push(urlGenerator.route('resource.edit', {
            resource: resource.id,
            id,
        }))),
    gotoResourceShow: (resource, id) =>
        dispatch(push(urlGenerator.route('resource.show', {
            resource: resource.id,
            id,
        }))),
    gotoResourceDelete: (resource, id) =>
        dispatch(push(urlGenerator.route('resource.delete', {
            resource: resource.id,
            id,
        }))),
});

const mergeProps = (
    stateProps,
    {
        gotoResourceCreate,
        gotoResourceEdit,
        gotoResourceShow,
        gotoResourceDelete,
        ...dispatchProps
    },
    ownProps,
) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    gotoResourceCreate: () => gotoResourceCreate(stateProps.resource),
    gotoResourceEdit: id => gotoResourceEdit(stateProps.resource, id),
    gotoResourceShow: id => gotoResourceShow(stateProps.resource, id),
    gotoResourceDelete: id => gotoResourceDelete(stateProps.resource, id),
});

const WithStateComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(ResourceIndex);
const WithRouterContainer = withRouter(WithStateComponent);
const WithListsCollectionContainer = withListsCollection()(WithRouterContainer);
const WithUrlGeneratorContainer = withUrlGenerator()(WithListsCollectionContainer);
export default WithUrlGeneratorContainer;
