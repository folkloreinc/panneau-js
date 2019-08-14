import PropTypes from 'prop-types';

export default PropTypes.shape({
    type: PropTypes.string.isRequired,
    cols: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.string,
            label: PropTypes.string,
        }),
    ),
});
