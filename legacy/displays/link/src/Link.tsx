import get from 'lodash-es/get';
import isString from 'lodash-es/isString';
import { type ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link as WouterLink } from 'wouter';

interface LinkProps {
    item?: { id: string | number } | null;
    value?: string | null;
    label?: string | null;
    labelPath?: string | null;
    external?: boolean;
    target?: string | null;
    placeholder?: ReactNode | null;
}

function Link({
    item = null,
    label = null,
    labelPath = null,
    value = null,
    external = false,
    target = null,
    placeholder = null,
}: LinkProps) {
    if (value === null || value === '') {
        return placeholder !== null ? <>{placeholder}</> : null;
    }
    const itemLabel = get(item, labelPath);
    const finalLabel = itemLabel || label || (
        <FormattedMessage defaultMessage="Link" description="Display label" />
    );
    const isExternal = isString(value) ? value.indexOf('http') === 0 : false;
    return external || isExternal ? (
        <a href={value} target={target || '_blank'} rel="noopener noreferrer">
            {finalLabel}
        </a>
    ) : (
        <WouterLink href={value}>{finalLabel}</WouterLink>
    );
}

export default Link;
