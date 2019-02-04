import Loadable from 'react-loadable';

export const AceEditor = Loadable({
    loader: () => import('react-ace'),
    loading: () => null,
});

export const loadBrace = (language, theme, extensions = []) => (
    import('brace')
        .then(() => Promise.all([
            import(`brace/mode/${language}`),
            import(`brace/theme/${theme}`),
            ...extensions.map(ext => import(`brace/ext/${ext}`)),
        ]))
);
