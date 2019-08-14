import PropTypes from 'prop-types';
import localization from './localization';
import api from './api';
import layout from './layout';
import resource from './resource';
import field from './field';
import type from './type';

export default PropTypes.exact({
    name: PropTypes.string.isRequired,
    localization: localization,
    api: api,
    routes: PropTypes.any.isRequired,
    layout: layout,
    resources: PropTypes.arrayOf(resource).isRequired,
    fields: PropTypes.arrayOf(field),
    blocks: PropTypes.arrayOf(type),
    documents: PropTypes.arrayOf(type),
});
