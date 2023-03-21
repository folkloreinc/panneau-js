import React from 'react';
import { defineMessages } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Label from '@panneau/element-label';

import GuestLayout from '../layouts/Guest';

export const messages = defineMessages({
    metaTitle401: {
        defaultMessage: 'Error 401',
        description: 'Error page meta title',
    },
    title401: {
        defaultMessage: 'Error 401',
        description: 'Error page title',
    },
    description401: {
        defaultMessage: 'You are not authorized to access this page.',
        description: 'Error page description',
    },
    metaTitle403: {
        defaultMessage: 'Error 403',
        description: 'Error page meta title',
    },
    title403: {
        defaultMessage: 'Error 403',
        description: 'Error page title',
    },
    description403: {
        defaultMessage: 'Access to this page is forbidden',
        description: 'Error page description',
    },
    metaTitle404: {
        defaultMessage: 'Error 404',
        description: 'Error page meta title',
    },
    title404: {
        defaultMessage: 'Error 404',
        description: 'Error page title',
    },
    description404: {
        defaultMessage: 'This page doesn’t exist',
        description: 'Error page description',
    },
    metaTitle500: {
        defaultMessage: 'Error 500',
        description: 'Error page meta title',
    },
    title500: {
        defaultMessage: 'Error 500',
        description: 'Error page title',
    },
    description500: {
        defaultMessage: 'There was an error',
        description: 'Error page description',
    },

    gotoHome: {
        defaultMessage: 'Go to home page',
        description: 'Button label',
    },
});

const propTypes = {
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    statusCode: null,
};

const ErrorPage = ({ statusCode }) => (
    <GuestLayout fullscreen>
        <div className="container-sm py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6">
                    <h1>
                        <Label>{messages[`title${statusCode || 404}`]}</Label>
                    </h1>
                    <p>
                        <Label>{messages[`description${statusCode || 404}`]}</Label>
                    </p>
                </div>
            </div>
        </div>
    </GuestLayout>
);
ErrorPage.propTypes = propTypes;
ErrorPage.defaultProps = defaultProps;

export default ErrorPage;
