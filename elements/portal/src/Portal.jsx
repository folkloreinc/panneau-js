/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

const propTypes = {
    container: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
};

const PortalElement = ({
    children = null,
    container = null
}) =>
    container !== null ? ReactDOM.createPortal(children, container) : null;

PortalElement.propTypes = propTypes;

export default PortalElement;
