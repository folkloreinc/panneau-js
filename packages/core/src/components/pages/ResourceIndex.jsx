import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isString from 'lodash/isString';
import classNames from 'classnames';
import { defineMessages, FormattedMessage } from 'react-intl';

import withComponentsCollection from '../../lib/withComponentsCollection';
import withUrlGenerator from '../../lib/withUrlGenerator';

import styles from '../../styles/pages/resource-index.scss';

const messages = defineMessages({
    add: {
        id: 'core.buttons.resources.add',
        description: 'The label of the "add" index button',
        defaultMessage: 'Add',
    },
});

const propTypes = {
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }).isRequired,
    resource: PropTypes.shape({}).isRequired,
    location: PropTypes.shape({}).isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
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
    items: [],
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
        this.onClickAdd = this.onClickAdd.bind(this);

        this.state = {
            items: props.items,
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

    onItemsLoaded(items) {
        this.setState({
            items,
        });
    }

    onItemsLoadError(errors) {
        this.setState({
            errors,
        });
    }

    onClickAdd() {
        const {
            gotoResourceCreate,
        } = this.props;
        gotoResourceCreate();
    }

    onItemActions(e, action, it) {
        const {
            gotoResourceEdit,
            gotoResourceShow,
            gotoResourceDelete,
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

    loadItems() {
        const { resource } = this.props;
        resource.api
            .index()
            .then(this.onItemsLoaded)
            .catch(this.onItemsLoadError);
    }

    deleteItem(id) {
        const { resource } = this.props;
        const { name } = resource;
        // @TODO quick implementation; instead, use a pretty modal or something
        // eslint-disable-next-line no-alert
        if (window.confirm(`Are you sure you want to delete item ID ${id} from ${name}?`)) {
            resource.api
                .destroy(id)
                .then(this.onItemDeleted);
        }
    }

    renderHeader() {
        const {
            resource,
            showAddButton,
            addButtonLabel,
        } = this.props;

        return (
            <div
                className={classNames({
                    [styles.header]: true,
                })}
            >
                <div
                    className={classNames({
                        [styles.cols]: true,
                    })}
                >
                    <div
                        className={classNames({
                            [styles.col]: true,
                        })}
                    >
                        <h1
                            className={classNames({
                                [styles.title]: true,
                            })}
                        >
                            { resource.name }
                        </h1>
                    </div>
                    <div
                        className={classNames({
                            [styles.col]: true,
                            'text-right': true,
                        })}
                    >
                        { showAddButton ? (
                            <div
                                className={classNames({
                                    'btn-group': true,
                                })}
                            >
                                <button
                                    className={classNames({
                                        btn: true,
                                        'btn-primary': true,
                                    })}
                                    onClick={this.onClickAdd}
                                >
                                    {isString(addButtonLabel) ? addButtonLabel : (
                                        <FormattedMessage {...addButtonLabel} />
                                    )}
                                </button>
                            </div>
                        ) : null }
                    </div>
                </div>
                { this.renderErrors() }
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
                    { errors.map((error, index) => (
                        <li key={`error-${index}`}>{ error }</li>
                    )) }
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
                    onClickActions={this.onItemActions}
                    {...listProps}
                />
            </div>
        ) : null;
    }

    // eslint-disable-next-line class-methods-use-this
    renderPagination() {
        const { listsCollection } = this.props;
        const Pagination = listsCollection.getComponent('pagination');
        return (
            <Pagination
                total={20}
                perPage={1}
                currentPage={3}
                lastPage={10}
                url="/?page=1"
            />
        );
    }

    render() {
        const containerClassNames = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 col-md-offset-2">
                            { this.renderHeader() }
                            { this.renderList() }
                            { /*this.renderPagination()*/ }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ResourceIndex.propTypes = propTypes;
ResourceIndex.defaultProps = defaultProps;

const mapStateToProps = ({ panneau }, { params, location }) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(params, 'resource', null);
    return {
        resource: resources.find(it => (
            (resourceId !== null && it.id === resourceId) ||
            (resourceId === null && get(it, 'routes.index', null) === location.pathname)
        )) || null,
    };
};

const mapDispatchToProps = (dispatch, { urlGenerator }) => ({
    gotoResourceCreate: resource => dispatch(push(urlGenerator.route('resource.create', {
        resource: resource.id,
    }))),
    gotoResourceEdit: (resource, id) => dispatch(push(urlGenerator.route('resource.edit', {
        resource: resource.id,
        id,
    }))),
    gotoResourceShow: (resource, id) => dispatch(push(urlGenerator.route('resource.show', {
        resource: resource.id,
        id,
    }))),
    gotoResourceDelete: (resource, id) => dispatch(push(urlGenerator.route('resource.delete', {
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

const mapCollectionToProps = collection => ({
    listsCollection: collection.getCollection('lists'),
});

const WithStateComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(ResourceIndex);
const WithRouterContainer = withRouter(WithStateComponent);
const WithComponentsCollectionContainer = withComponentsCollection((
    mapCollectionToProps
))(WithRouterContainer);
const WithUrlGeneratorContainer = withUrlGenerator()(WithComponentsCollectionContainer);
export default WithUrlGeneratorContainer;
