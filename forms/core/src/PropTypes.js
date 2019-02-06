import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

export const errors = PropTypes.oneOfType([
    PropTypes.objectOf(PanneauPropTypes.errors),
    PanneauPropTypes.errors,
]);

export const form = PropTypes.shape({
    errors,
    value: PropTypes.object,
});

export const notice = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
        type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
        icon: PropTypes.string,
        label: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.shape({
                id: PropTypes.string,
                description: PropTypes.string,
                defaultMessage: PropTypes.string,
            }),
        ]),
    }),
]);
