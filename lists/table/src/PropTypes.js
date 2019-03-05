import PropTypes from 'prop-types';

export const column = PropTypes.shape({
    id: PropTypes.string.required,
    label: PropTypes.string.required,
    path: PropTypes.string,
    type: PropTypes.string,
    width: PropTypes.number,
});

export const columns = PropTypes.arrayOf(column);
