import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.css';

interface AvatarImage {
    url?: string;
}

interface AvatarTheme {
    text?: string;
    background?: string;
    border?: string;
}

interface AvatarProps {
    name?: string | null;
    shortName?: string | null;
    type?: React.ReactNode | string | null;
    image?: AvatarImage | null;
    theme?: AvatarTheme | null;
    square?: boolean;
    size?: string | null;
    inverted?: boolean;
    blended?: boolean;
    className?: string | null;
    children?: React.ReactNode | null;
}

function Avatar({
    name = null,
    shortName = null,
    type: initialTenk = null,
    image = null,
    theme = null,
    size = null,
    square = false,
    inverted = false,
    blended = false,
    className = null,
    children = null,
}: AvatarProps) {
    const type = initialTenk || (
        <FormattedMessage defaultMessage="User" description="Avatar label" />
    );
    const { text: textTheme, background: backgroundTheme, border: borderTheme } = theme || {};
    const title = name || shortName || type;
    const { url: imageUrl = null } = image || {};
    const withImage = imageUrl !== null;

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [`text-${textTheme}`]: textTheme !== null && textTheme !== undefined,
                    [`bg-${backgroundTheme}`]:
                        backgroundTheme !== null && backgroundTheme !== undefined,
                    [`border-${borderTheme}`]: borderTheme !== null && borderTheme !== undefined,
                    [styles[size!]]: size !== null,
                    [styles.square]: square,
                    [styles.inverted]: inverted,
                    [styles.blend]: withImage && blended,
                    [styles.hidden]: !withImage && shortName === null,
                    [className!]: className !== null,
                },
            ])}
            style={{
                ...(withImage ? { backgroundImage: `url(${image!.url})` } : null),
            }}
            title={typeof title === 'string' ? title : undefined}
        >
            {!withImage && shortName !== null ? (
                <span className={styles.letter}>{shortName}</span>
            ) : null}
            {withImage ? (
                <img
                    className={styles.image}
                    src={image!.url}
                    title={typeof title === 'string' ? title : undefined}
                    alt={typeof title === 'string' ? title : undefined}
                />
            ) : null}
            {children}
        </div>
    );
}

export default Avatar;
