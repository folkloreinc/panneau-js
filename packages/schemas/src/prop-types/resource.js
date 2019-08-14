import PropTypes from 'prop-types';
import list from './list';
import form from './form';
import messages from './messages';
import type from './type';

export default PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    lists: list,
    forms: form,
    messages: messages,
    routes: PropTypes.any,
    types: PropTypes.arrayOf(type),
});
