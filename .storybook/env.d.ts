declare module '*.css?inline' {
    const css: string;
    export default css;
}

// Stories import the packages' sources, which import CSS Modules.
declare module '*.module.css' {
    const classes: Readonly<Record<string, string>>;
    export default classes;
}
