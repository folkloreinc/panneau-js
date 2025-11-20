interface LabelProps {
    labels?: Record<string, string>;
    value?: string | null;
    placeholder?: React.ReactNode | null;
}

const DEFAULT_LABELS = {};

function Label({ labels = DEFAULT_LABELS, value = null, placeholder = null }: LabelProps) {
    return <div>{labels[value!] || value || placeholder}</div>;
}

export default Label;
