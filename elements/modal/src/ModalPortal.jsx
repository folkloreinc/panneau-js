/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { useModal } from '@panneau/core/contexts';

// import ElementPortal from '@panneau/element-portal';

const propTypes = {
    id: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
};

const defaultProps = {
    id: null,
    data: null,
    children: null,
};

const ModalPortal = ({ id, data, children }) => {
    const { container = null, register = null, unregister = null } = useModal();
    const finalId = useMemo(() => (id !== null ? id : `modal-${new Date().getTime()}`), [id]);

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

ModalPortal.propTypes = propTypes;
ModalPortal.defaultProps = defaultProps;

export default ModalPortal;
