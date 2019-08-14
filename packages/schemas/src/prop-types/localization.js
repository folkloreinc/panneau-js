import PropTypes from 'prop-types';
import messages from './messages';

export default PropTypes.exact({
    locales: PropTypes.arrayOf(PropTypes.string),
    messages: messages,
});
