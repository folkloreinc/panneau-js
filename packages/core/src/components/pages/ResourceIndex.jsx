import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from 'lodash/get';

const propTypes = {
    resource: PropTypes.shape({}).isRequired,
    data: PropTypes.shape({}),
};

const defaultProps = {

};

const contextTypes = {
    componentsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    fieldsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    layoutsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

class ResourceIndex extends Component {
    componentDidMount() {
        const { resource } = this.props;
        const index = resource.api.index();
        index
            .then((data) => {
                this.props.data = data;
            })
            .catch((err) => {
                console.error(err);
                this.props.data = null;
            });
    }

    render() {
        const { listsCollection } = this.context;
        const ListComponent = listsCollection.getComponent('table'); // @TODO un-hardcode
        const { resource, data } = this.props;
        return (
            <div>
                <div>
                    { resource.name }
                </div>
            </div>
        );
    }
}

ResourceIndex.propTypes = propTypes;
ResourceIndex.defaultProps = defaultProps;
ResourceIndex.contextTypes = contextTypes;

const mapStateToProps = ({ panneau }, { params, location }) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(params, 'resource', null);
    if (resourceId !== null) {
        return {
            resource: resources.find(it => it.id === resourceId) || null,
        };
    }
    return {
        resource: resources.find(it => get(it, 'routes.index', null) === location.pathname) || null,
    };
};

const WithStateComponent = connect(mapStateToProps)(ResourceIndex);
const WithRouterContainer = withRouter(WithStateComponent);
export default WithRouterContainer;
