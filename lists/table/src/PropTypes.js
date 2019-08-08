import PropTypes from 'prop-types';

export const column = PropTypes.shape({
    id: PropTypes.string.required,
    type: PropTypes.string,
    label: PropTypes.string.required,
    path: PropTypes.string,
    width: PropTypes.number,
});

export const columns = PropTypes.arrayOf(column);
