import classNames from 'classnames';

import { useDisplaysComponentsManager } from '@panneau/core/contexts';

interface DisplayFieldProps {
    value?: unknown;
    display?: string | null;
    className?: string | null;
    [key: string]: unknown;
}

function DisplayField({
    value = null,
    display = null,
    className = null,
    ...props
}: DisplayFieldProps) {
    const displays = useDisplaysComponentsManager();
    const Component = displays.getComponent(display) || null;

    return value !== null && Component !== null ? (
        <Component
            className={classNames([
                {
                    [className]: className !== null,
                },
            ])}
            {...props}
            value={value}
        />
    ) : null;
}

export default DisplayField;
