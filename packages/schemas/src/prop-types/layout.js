import PropTypes from 'prop-types';

export default PropTypes.shape({
    type: PropTypes.string.isRequired,
    header: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.shape({
            navbar: PropTypes.shape({
                items: PropTypes.arrayOf(
                    PropTypes.shape({ id: PropTypes.string.isRequired, type: PropTypes.string }),
                ),
            }),
        }),
    ]),
    footer: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({})]),
});
