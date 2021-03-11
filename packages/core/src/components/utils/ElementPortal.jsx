/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const propTypes = {
    id: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    container: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    register: PropTypes.func,
    unregister: PropTypes.func,
    children: PropTypes.node,
};

const defaultProps = {
    id: null,
    data: null,
    container: null,
    register: null,
    unregister: null,
    children: null,
};

const ElementPortal = ({ id, data, children, container, register, unregister }) => {
    const finalId = useMemo(() => id || `element-${new Date().getTime()}`, [id]);
    useEffect(() => {
        if (register !== null) {
            register(finalId, data);
        }
        return () => {
            if (unregister !== null) {
                unregister(finalId);
            }
        };
    }, [finalId, data]);
    return container !== null ? ReactDOM.createPortal(children, container) : null;
};

ElementPortal.propTypes = propTypes;
ElementPortal.defaultProps = defaultProps;

export default ElementPortal;
