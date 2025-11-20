import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

interface FormContextValue {
    value: Record<string, unknown>;
    setValue: (value: Record<string, unknown>) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useForm = (): FormContextValue | null => useContext(FormContext);

export const useFormValue = (): Record<string, unknown> => {
    const { value } = useForm();
    return value;
};

export const useFormSetValue = (): ((value: Record<string, unknown>) => void) => {
    const { setValue } = useForm();
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
