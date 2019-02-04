import React from 'react';
// import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';

import * as PanneauPropTypes from '../../lib/PropTypes';
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

const AccountPage = ({ user, ...props }) => (
    <ResourceForm
        itemId={user.id}
        action="edit"
        title={messages.title}
        {...props}
    />
);

AccountPage.propTypes = propTypes;
AccountPage.defaultProps = defaultProps;

const WithStateContainer = connect(({ auth, panneau }) => ({
    resource: get(panneau, 'definition.resources', []).find(it => it.id === 'users') || null,
    user: auth.user || null,
}))(AccountPage);
export default WithStateContainer;
