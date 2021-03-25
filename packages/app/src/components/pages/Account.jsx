import React from 'react';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';

import MainLayout from '../layouts/Main';

const propTypes = {};

const defaultProps = {};

const AccountPage = () => {
    return (
        <MainLayout>
            <div className="container-sm">Account</div>
        </MainLayout>
    );
};
AccountPage.propTypes = propTypes;
AccountPage.defaultProps = defaultProps;

export default AccountPage;
