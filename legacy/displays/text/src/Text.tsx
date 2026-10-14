import { type ReactNode } from 'react';

interface TextProps {
    value?: string | number | null;
    placeholder?: ReactNode | null;
}

function Text({ value = null, placeholder = null }: TextProps) {
    return <>{value !== null && value !== '' ? value : placeholder}</>;
}

export default Text;
