import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDefinition } from '@panneau/core/contexts';

import ResourceForm from './ResourceForm';

const messages = defineMessages({
    title: {
        id: 'core.titles.account',
        description: 'The title of the account page',
        defaultMessage: 'Edit account',
    },
});

const propTypes = {
    user: PanneauPropTypes.user,
};

const defaultProps = {
    user: null,
};

const AccountPage = ({ user, ...props }) => {
    const definition = useDefinition();
    const { resources = [] } = definition;
    const resource = resources.find(it => it.id === 'users') || null;
    return (
        <ResourceForm
            {...props}
            itemId={user.id}
            action="edit"
            title={messages.title}
            resource={resource}
        />
    );
};

AccountPage.propTypes = propTypes;
AccountPage.defaultProps = defaultProps;

const WithStateContainer = connect(({ auth }) => ({
    user: auth.user || null,
}))(AccountPage);
export default WithStateContainer;
