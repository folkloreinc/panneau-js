interface TextProps {
    value?: string | number | null;
    placeholder?: React.ReactNode | null;
}

function Text({ value = null, placeholder = null }: TextProps) {
    return <>{value || placeholder}</>;
}

export default Text;
