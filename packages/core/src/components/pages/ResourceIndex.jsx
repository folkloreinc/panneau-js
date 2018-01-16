import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from 'lodash/get';
import classNames from 'classnames';

import withComponentsCollection from '../../lib/withComponentsCollection';

import styles from '../../styles/pages/resource-index.scss';

const propTypes = {
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }).isRequired,
    resource: PropTypes.shape({}).isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    errors: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    items: [],
    errors: null,
};

class ResourceIndex extends Component {
    constructor(props) {
        super(props);

        this.onItemsLoaded = this.onItemsLoaded.bind(this);
        this.onItemsLoadError = this.onItemsLoadError.bind(this);

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

const mapCollectionToProps = collection => ({
    listsCollection: collection.getCollection('lists'),
});

const WithStateComponent = connect(mapStateToProps)(ResourceIndex);
const WithRouterContainer = withRouter(WithStateComponent);
const WithComponentsCollectionContainer = withComponentsCollection((
    mapCollectionToProps
))(WithRouterContainer);
export default WithComponentsCollectionContainer;
