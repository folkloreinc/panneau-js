import { getCSRFHeaders } from '@folklore/fetch';
import Panneau from '@panneau/app';
import {
    ACTIONS_NAMESPACE,
    DISPLAYS_NAMESPACE,
    FIELDS_NAMESPACE,
} from '@panneau/core/contexts';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import * as AppPropTypes from '../lib/PropTypes';
import * as actionsComponents from './panneau/actions';
import * as displaysComponents from './panneau/displays';
import * as fieldsComponents from './panneau/fields';

import '../../styles/panneau.scss';

const propTypes = {
    definition: PropTypes.shape({}).isRequired,
    user: AppPropTypes.user,
    baseUrl: PropTypes.string,
    uploadEndpoint: PropTypes.string,
    statusCode: AppPropTypes.statusCode,
};

const defaultProps = {
    user: null,
    baseUrl: null,
    uploadEndpoint: '/panneau/upload',
    statusCode: null,
};

function PanneauContainer({ definition, user, baseUrl, uploadEndpoint, statusCode }) {
    const { routes = {}, intl: { locale = 'fr' } = {} } = definition;
    const isAuthorized = statusCode !== 401 && statusCode !== 403;
    const [localeLoaded, setLocaleLoaded] = useState(false);

    useEffect(() => {
        let canceled = false;
        (locale === 'en'
            ? import('@panneau/intl/locale/en')
            : import('@panneau/intl/locale/fr')
        ).then(() => {
            if (!canceled) {
                setLocaleLoaded(true);
            }
        });
        return () => {
            canceled = true;
        };
    }, [locale]);

    return localeLoaded ? (
        <Panneau
            definition={definition}
            routes={routes}
            user={isAuthorized ? user : null}
            baseUrl={baseUrl}
            uppy={{
                transport: 'xhr',
                xhr: {
                    endpoint: uploadEndpoint,
                    headers: getCSRFHeaders(),
                    timeout: 0,
                },
            }}
            components={{
                [FIELDS_NAMESPACE]: fieldsComponents,
                [DISPLAYS_NAMESPACE]: displaysComponents,
                [ACTIONS_NAMESPACE]: actionsComponents,
                buttons: {},
            }}
        />
    ) : null;
}

PanneauContainer.propTypes = propTypes;
PanneauContainer.defaultProps = defaultProps;

export default PanneauContainer;
