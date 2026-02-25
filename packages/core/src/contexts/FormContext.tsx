import { createContext, use, useMemo } from 'react';
import type { ReactNode } from 'react';

interface FormContextValue {
    value: Record<string, unknown>;
    setValue: (value: Record<string, unknown>) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = (): FormContextValue | null => use(FormContext);

export const useFormValue = (): Record<string, unknown> => {
    const { value } = useFormContext();
    return value;
};

export const useFormSetValue = (): ((value: Record<string, unknown>) => void) => {
    const { setValue } = useFormContext();
    return setValue;
};

interface FormProviderProps {
    value: Record<string, unknown>;
    setValue: (value: Record<string, unknown>) => void;
    children: ReactNode;
}

function FormProvider({ value, setValue, children }: FormProviderProps) {
    const values = useMemo(
        () => ({
            value,
            setValue,
        }),
        [value, setValue],
    );
    return <FormContext value={values}>{children}</FormContext>;
}

export { FormProvider };
export default FormContext;
