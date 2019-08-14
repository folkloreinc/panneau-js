import PropTypes from 'prop-types';

export default PropTypes.shape({
    name: PropTypes.shape({
        a: PropTypes.string,
        a_plural: PropTypes.string,
        plural: PropTypes.string,
    }),
});
