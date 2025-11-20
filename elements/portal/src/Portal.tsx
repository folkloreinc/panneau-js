import { type ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface PortalElementProps {
    children?: ReactNode | null;
    container?: HTMLElement | null;
}

function PortalElement({ children = null, container = null }: PortalElementProps) {
    return container !== null ? ReactDOM.createPortal(children, container) : null;
}

export default PortalElement;
