import React from 'react';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import MainLayout from '../layouts/Main';

const propTypes = {};

const defaultProps = {};

const AccountPage = () => (
    <MainLayout>
        <div className="container-sm py-4">Account page</div>
    </MainLayout>
);
AccountPage.propTypes = propTypes;
AccountPage.defaultProps = defaultProps;

export default AccountPage;
