import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import get from 'lodash/get';
import classNames from 'classnames';

import withComponentsCollection from '../../lib/withComponentsCollection';
import withUrlGenerator from '../../lib/withUrlGenerator';

import styles from '../../styles/pages/resource-index.scss';

const propTypes = {
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }).isRequired,
    resource: PropTypes.shape({}).isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    errors: PropTypes.arrayOf(PropTypes.string),
    gotoResourceEdit: PropTypes.func,
    gotoResourceShow: PropTypes.func,
    gotoResourceDelete: PropTypes.func,
};

const defaultProps = {
    items: [],
    errors: null,
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
            errors: props.errors,
        };
    }

    componentDidMount() {
        const { resource } = this.props;
        resource.api
            .index()
            .then(this.onItemsLoaded)
            .catch(this.onItemsLoadError);
    }

    componentWillReceiveProps(nextProps) {
        const itemsChanged = nextProps.items !== this.props.items;
        if (itemsChanged) {
            this.setState({
                items: nextProps.items,
            });
        }

        const errorsChanged = nextProps.errors !== this.props.errors;
        if (errorsChanged) {
            this.setState({
                errors: nextProps.errors,
            });
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
        const { resource } = this.props;

        const headerClassNames = classNames({
            [styles.header]: true,
        });

        return (
            <div className={headerClassNames}>
                <h1>{ resource.name }</h1>
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
                    items={items}
                    onClickActions={this.onItemActions}
                    {...listProps}
                />
            </div>
        ) : null;
    }

    render() {
        const containerClassNames = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassNames}>
                { this.renderHeader() }
                { this.renderList() }
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
