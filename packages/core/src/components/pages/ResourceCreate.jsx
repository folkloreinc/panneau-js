import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import get from 'lodash/get';

import ResourceForm from './ResourceForm';
import withUrlGenerator from '../../lib/withUrlGenerator';

const messages = defineMessages({
    create: {
        id: 'core.buttons.resources.create',
        description: 'The label of the "create" form button',
        defaultMessage: 'Create',
    },
    title: {
        id: 'core.titles.resources.create',
        description: 'The title of the resource create form',
        defaultMessage: 'Create {name}',
    },
    titleTyped: {
        id: 'core.titles.resources.create_typed',
        description: 'The title of the typed resource create form',
        defaultMessage: 'Create {name} <small class="text-muted">({type})</small>',
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
                title={messages.title}
                titleTyped={messages.titleTyped}
                saveButtonLabel={messages.create}
                onFormComplete={this.onFormComplete}
                {...this.props}
            />
        );
    }
}

ResourceCreate.propTypes = propTypes;
ResourceCreate.defaultProps = defaultProps;

const mapStateToProps = ({ panneau }, { match, location, urlGenerator }) => {
    const resources = get(panneau, 'definition.resources', []);
    const resourceId = get(match, 'params.resource', null);
    return {
        resource:
            resources.find(
                it => (resourceId !== null && it.id === resourceId)
                    || (resourceId === null
                        && urlGenerator.route(`resource.${it.id}.create`) === location.pathname),
            ) || null,
    };
};

const mapDispatchToProps = (dispatch, { urlGenerator }) => ({
    gotoResourceEdit: (resource, id) => dispatch(
        push(
            urlGenerator.route('resource.edit', {
                resource: resource.id,
                id,
            }),
        ),
    ),
});

const mergeProps = (stateProps, { gotoResourceEdit, ...dispatchProps }, ownProps) => ({
    ...ownProps,
    ...dispatchProps,
    gotoResourceEdit: id => gotoResourceEdit(stateProps.resource, id),
});

const WithStateComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
)(ResourceCreate);
const WithRouterContainer = withRouter(WithStateComponent);
const WithUrlGeneratorContainer = withUrlGenerator()(WithRouterContainer);
export default WithUrlGeneratorContainer;
