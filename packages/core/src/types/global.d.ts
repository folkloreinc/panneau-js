/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.png' {
    const value: any;
    export default value;
}
declare module '*.svg' {
    const value: any;
    export default value;
    export const ReactComponent: any;
}

declare module '*.md' {
    const value: string;
    export default value;
}

interface Window {
    cioanalytics: any;
    cioanalyticsReady?: () => void;
}
