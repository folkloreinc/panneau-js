import React from 'react';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Label from '@panneau/element-label';
import GuestLayout from '../layouts/Guest';

export const messages = defineMessages({
    metaTitle401: {
        id: 'meta.title_401',
        defaultMessage: 'Error 401',
    },
    title401: {
        id: 'errors.title_401',
        defaultMessage: 'Error 401',
    },
    description401: {
        id: 'errors.description_401',
        defaultMessage: 'You are not authorized to access this page.',
    },

    metaTitle403: {
        id: 'meta.title_403',
        defaultMessage: 'Error 403',
    },
    title403: {
        id: 'errors.title_403',
        defaultMessage: 'Error 403',
    },
    description403: {
        id: 'errors.description_403',
        defaultMessage: 'Access to this page is forbidden',
    },
    metaTitle404: {
        id: 'meta.title_404',
        defaultMessage: 'Error 404',
    },
    title404: {
        id: 'errors.title_404',
        defaultMessage: 'Error 404',
    },
    description404: {
        id: 'errors.description_404',
        defaultMessage: 'This page doesn’t exist',
    },

    metaTitle500: {
        id: 'meta.title_500',
        defaultMessage: 'Error 500',
    },
    title500: {
        id: 'errors.title_500',
        defaultMessage: 'Error 500',
    },
    description500: {
        id: 'errors.description_500',
        defaultMessage: 'There was an error',
    },

    gotoHome: {
        id: 'errors.goto_home',
        defaultMessage: 'Go to home page',
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
        <div className="container-sm">
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
