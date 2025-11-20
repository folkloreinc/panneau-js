import classNames from 'classnames';

import styles from './styles.module.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

interface IconProps {
    name: string;
    bold?: boolean;
    opaque?: boolean;
    className?: string | null;
}

function Icon({ name, bold = false, opaque = false, className = null, ...props }: IconProps) {
    return name === 'loading' ? (
        <>
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span className="visually-hidden" role="status">
                Loading...
            </span>
        </>
    ) : (
        <i
            className={classNames([`bi-${name}`], {
                [styles.bold]: bold,
                [styles.opaque]: opaque,
                [className!]: className !== null,
            })}
            {...props}
        />
    );
}

export default Icon;
