import type { ComponentType } from 'react';

import { cx } from '../utils/cx';
import styles from './Icon.module.css';

/**
 * An icon component: any Lucide icon (`import { Pencil } from 'lucide-react'`), or a component
 * with the same props.
 */
export type IconComponent = ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
    'aria-hidden'?: boolean | 'true' | 'false';
    'aria-label'?: string;
    role?: string;
    focusable?: boolean | 'true' | 'false';
}>;

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<IconSize, number> = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 };

export interface IconProps {
    /** The icon: a Lucide icon component. */
    icon: IconComponent;
    /** Defaults to `md` (16px). A number is in pixels. */
    size?: IconSize | number;
    /**
     * Accessible label. Icons without a label are decorative and hidden from assistive
     * technologies, which is right next to a text that says the same.
     */
    label?: string;
    className?: string;
}

/** Renders an icon of the icon set (Lucide) at a size of the scale, decorative by default. */
export function Icon({ icon: Component, size = 'md', label, className }: IconProps) {
    const pixels = typeof size === 'number' ? size : SIZES[size];
    return (
        <Component
            size={pixels}
            strokeWidth={2}
            absoluteStrokeWidth={pixels < 16}
            className={cx(styles.icon, className)}
            aria-hidden={label === undefined ? 'true' : undefined}
            aria-label={label}
            role={label !== undefined ? 'img' : undefined}
            focusable="false"
        />
    );
}
