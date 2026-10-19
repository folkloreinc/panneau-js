import { describe, expect, it } from 'vitest';

import { getFontFaceCss, getFontStylesheets } from './fonts';

describe('getFontFaceCss', () => {
    it('writes an @font-face rule per face, with swap by default', () => {
        expect(
            getFontFaceCss([
                {
                    family: 'Geist',
                    src: "url(/fonts/geist.woff2) format('woff2')",
                    weight: '100 900',
                },
                { family: 'Geist Mono', src: 'local("Menlo")', style: 'normal', display: 'block' },
                { stylesheet: 'https://fonts.example.com/inter.css' },
            ]),
        ).toBe(
            '@font-face{font-family:"Geist";src:url(/fonts/geist.woff2) format(\'woff2\');font-weight:100 900;font-display:swap;}' +
                '@font-face{font-family:"Geist Mono";src:local("Menlo");font-style:normal;font-display:block;}',
        );
    });

    it('accepts data URLs, and ignores faces that could break out of the rule', () => {
        const css = getFontFaceCss([
            { family: 'Inline', src: 'url(data:font/woff2;base64,AAAA)' },
            { family: 'Bad"}body{color:red', src: 'local(x)' },
            { family: 'Bad', src: 'local(x)}body{color:red' },
            { family: 'Bad', src: 'local(x)', weight: '400;}' },
        ]);
        expect(css).toBe(
            '@font-face{font-family:"Inline";src:url(data:font/woff2;base64,AAAA);font-display:swap;}',
        );
    });

    it('is empty without fonts', () => {
        expect(getFontFaceCss()).toBe('');
    });
});

describe('getFontStylesheets', () => {
    it('lists stylesheets once', () => {
        expect(
            getFontStylesheets([
                { stylesheet: 'https://fonts.example.com/inter.css' },
                { family: 'Geist', src: 'local(Geist)' },
                { stylesheet: 'https://fonts.example.com/inter.css' },
            ]),
        ).toEqual(['https://fonts.example.com/inter.css']);
    });
});
