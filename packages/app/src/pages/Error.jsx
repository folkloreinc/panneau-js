import React from 'react';

import Label from '../../partials/Label';
import GuestLayout from '../layouts/Guest';

import * as AppPropTypes from '../../../lib/PropTypes';
import { messages } from '../../pages/Error';

const propTypes = {
    statusCode: AppPropTypes.statusCode,
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
