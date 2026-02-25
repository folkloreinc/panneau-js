import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { getDisplayName } from '../utils';

interface PanelData {
    id: string;
    [key: string]: unknown;
}

interface PanelsContextValue {
    panels: PanelData[];
    container: unknown | null;
    setContainer: (container: unknown) => void;
    register: (id: string, data?: Record<string, unknown> | null) => void;
    unregister: (id: string) => void;
}

export const PanelsContext = createContext<PanelsContextValue>({
    panels: [],
    container: null,
    setContainer: () => {},
    register: () => {},
    unregister: () => {},
});

export function usePanels(): PanelsContextValue {
    return useContext(PanelsContext) || {};
}

export function withPanels(WrappedComponent: ComponentType<any>) {
    function WithPanelsComponent(props: any) {
        return (
            <PanelsContext.Consumer>
                {({ panels, setContainer, container, register, unregister }) => (
                    <WrappedComponent
                        panelsContainer={container}
                        setPanelsContainer={setContainer}
                        panels={panels}
                        registerPanel={register}
                        unregisterPanel={unregister}
                        {...props}
                    />
                )}
            </PanelsContext.Consumer>
        );
    }
    WithPanelsComponent.displayName = `WithPanels(${getDisplayName(WrappedComponent)})`;
    return WithPanelsComponent;
}

interface PanelsProviderProps {
    children: ReactNode;
    container?: unknown | null;
}

function PanelsProvider({ children, container: initialContainer = null }: PanelsProviderProps) {
    const [container, setContainer] = useState(initialContainer);
    const [panels, setPanels] = useState<PanelData[]>([]);
    const panelsRef = useRef(panels);

    const register = useCallback(
        (id: string, data: Record<string, unknown> | null = null) => {
            const { current: currentPanels } = panelsRef;
            const newPanels = [
                ...currentPanels,
                {
                    id,
                    ...data,
                },
            ];
            setPanels(newPanels);
            panelsRef.current = newPanels;
        },
        [panels, setPanels],
    );

    const unregister = useCallback(
        (id: string) => {
            const { current: currentPanels } = panelsRef;
            const foundIndex = currentPanels.findIndex(({ id: modalId }) => modalId === id);
            if (foundIndex !== -1) {
                const newPanels = currentPanels.filter(({ id: modalId }) => modalId !== id);
                setPanels(newPanels);
                panelsRef.current = newPanels;
            }
        },
        [panels, setPanels],
    );

    const value = useMemo(
        () => ({ panels, setContainer, container, register, unregister }),
        [panels, setContainer, container, register, unregister],
    );

    return <PanelsContext value={value}>{children}</PanelsContext>;
}

export { PanelsProvider };
