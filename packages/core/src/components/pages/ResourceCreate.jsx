import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import withUrlGenerator from '../../lib/withUrlGenerator';
import ResourceForm from './ResourceForm';

const messages = defineMessages({
    create: {
        id: 'packages.core.components.pages.create.buttons.submit',
        description: 'The label of the "create" form button',
        defaultMessage: 'Create',
    },
});

const propTypes = {
    gotoResourceEdit: PropTypes.func,
};

const defaultProps = {
    gotoResourceEdit: PropTypes.func,
};

class ResourceCreate extends Component {
    constructor(props) {
        super(props);

        this.onFormComplete = this.onFormComplete.bind(this);
    }

    onFormComplete(it) {
        const { gotoResourceEdit } = this.props;
        gotoResourceEdit(it.id);
    }

    render() {
        return (
            <ResourceForm
                action="create"
                buttons={[
                    {
                        id: 'submit',
                        type: 'submit',
                        label: messages.create,
                        className: 'btn-primary',
                    },
                ]}
                onFormComplete={this.onFormComplete}
                {...this.props}
            />
        );
    }
}

ResourceCreate.propTypes = propTypes;
ResourceCreate.defaultProps = defaultProps;

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
});

const mergeProps = (
    stateProps,
    {
        gotoResourceEdit,
        ...dispatchProps
    },
    ownProps,
) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    gotoResourceEdit: id => gotoResourceEdit(stateProps.resource, id),
});

const WithStateComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(ResourceCreate);
const WithRouterContainer = withRouter(WithStateComponent);
const WithUrlGeneratorContainer = withUrlGenerator()(WithRouterContainer);
export default WithUrlGeneratorContainer;
