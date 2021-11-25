import PropTypes from 'prop-types';

export const errors = PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.string),
    PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
]);

export const form = PropTypes.shape({
    errors,
    value: PropTypes.object, // eslint-disable-line
});
