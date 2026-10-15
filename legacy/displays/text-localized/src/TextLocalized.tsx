import { type ReactNode } from 'react';
import { useIntl } from 'react-intl';

interface TextLocalizedProps {
    value?: Record<string, unknown> | null;
    placeholder?: ReactNode | null;
    locale?: string | null;
}

function TextLocalized({
    value = null,
    placeholder = null,
    locale: parentLocale = null,
}: TextLocalizedProps) {
    const { locale } = useIntl();
    return <>{value !== null ? value[parentLocale || locale] || placeholder : placeholder}</>;
}

export default TextLocalized;
