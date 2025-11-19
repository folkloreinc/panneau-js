/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import ReactDOM from 'react-dom';

interface PortalElementProps {
    children?: React.ReactNode | null;
    container?: HTMLElement | null;
}

function PortalElement({
    children = null,
    container = null
}: PortalElementProps) {
    return container !== null ? ReactDOM.createPortal(children, container) : null;
}

export default PortalElement;
