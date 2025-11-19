import get from 'lodash-es/get';
import isString from 'lodash-es/isString';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link as WouterLink } from 'wouter';

interface LinkProps {
    item?: { id: string | number } | null;
    value?: string | null;
    label?: string | null;
    labelPath?: string | null;
    external?: boolean;
    target?: string | null;
    placeholder?: React.ReactNode | null;
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
    const itemLabel = get(item, labelPath);
    const finalValue = itemLabel || label || placeholder || (
        <FormattedMessage defaultMessage="Link" description="Display label" />
    );
    const isExternal = value !== null && isString(value) ? value.indexOf('http') === 0 : false;

    return external || isExternal ? (
        <a href={value!} target={target || '_blank'} rel="noopener noreferrer">
            {finalValue}
        </a>
    ) : (
        <WouterLink href={value!}>{finalValue}</WouterLink>
    );
}

export default Link;
