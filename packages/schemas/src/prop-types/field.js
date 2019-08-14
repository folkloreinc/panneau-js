import PropTypes from 'prop-types';

export default PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.object),
});
