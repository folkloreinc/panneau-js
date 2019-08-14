import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import ResourceForm from './ResourceForm';

const messages = defineMessages({
    title: {
        id: 'core.titles.account',
        description: 'The title of the account page',
        defaultMessage: 'Edit account',
    },
});

const propTypes = {
    user: PanneauPropTypes.user.isRequired,
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const AccountPage = ({ user, resource }) => (
    <ResourceForm itemId={user.id} action="edit" title={messages.title} resource={resource} />
);

AccountPage.propTypes = propTypes;
AccountPage.defaultProps = defaultProps;

const WithStateContainer = connect(({ auth }) => ({
    user: auth.user || null,
}))(AccountPage);
export default WithStateContainer;
