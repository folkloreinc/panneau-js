import PropTypes from 'prop-types';
import messages from './messages';
import field from './field';

export default PropTypes.exact({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    messages: messages,
    fields: PropTypes.arrayOf(field),
});
