const fs = require('fs');
const fsExtra = require('fs-extra');
const isEmpty = require('lodash/isEmpty');
const gettextParser = require('gettext-parser');

class POFile {
    static parse(filePath) {
        const input = fs.readFileSync(filePath);
        const po = gettextParser.po.parse(input);
        return Object.keys(po.translations).reduce(
            (allTranslations, ctx) =>
                Object.keys(po.translations[ctx]).reduce((currentTranslations, msg) => {
                    const translation = po.translations[ctx][msg] || null;
                    return translation !== null && translation.msgid.length > 0
                        ? [...currentTranslations, translation]
                        : currentTranslations;
                }, allTranslations),
            [],
        );
    }

    constructor(filePath, opts = {}) {
        this.options = {
            useDefaultMessage: false,
            ...opts,
        };

        this.path = filePath;
        this.headers = {
            'Project-Id-Version': 'PACKAGE VERSION',
            'Report-Msgid-Bugs-To': '',
            'POT-Creation-Date': '2020-12-14 14:06-0400',
            'PO-Revision-Date': 'YEAR-MO-DA HO:MI+ZONE',
            'Last-Translator': 'FULL NAME <EMAIL@ADDRESS>',
            'Language-Team': 'LANGUAGE <LL@li.org>',
            'MIME-Version': '1.0',
            'Content-Type': 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding': '8bit',
            'X-Generator': 'Translate Toolkit 3.2.0',
        };
        this.translations = fs.existsSync(filePath) ? POFile.parse(filePath) : [];
    }

    update(messages) {
        const { useDefaultMessage } = this.options;
        const newTranslations = Object.keys(messages).map((id) => {
            const { defaultMessage, description } = messages[id];
            const currentTranslation =
                this.translations.find(
                    ({ comments: { reference }, msgctxt = null }) => (msgctxt || reference) === id,
                ) || null;
            const defaultValue = useDefaultMessage ? [defaultMessage] : [];
            return {
                msgctxt: id,
                msgid: defaultMessage,
                msgstr:
                    currentTranslation !== null && !isEmpty(currentTranslation.msgstr.join(''))
                        ? currentTranslation.msgstr
                        : defaultValue,
                comments: {
                    translator: description,
                    reference: id,
                },
            };
        });

        this.translations = newTranslations;
    }

    save() {
        const outputBuf = gettextParser.po.compile({
            charset: 'utf-8',
            headers: this.headers,
            translations: {
                '': this.translations.reduce(
                    (map, translation) => ({
                        ...map,
                        [translation.msgctxt]: translation,
                    }),
                    {},
                ),
            },
        });

        fsExtra.outputFileSync(this.path, outputBuf);
    }

    toJSON() {
        return this.translations.reduce(
            (map, { comments: { reference }, msgstr, msgctxt = null }) =>
                msgstr.length > 0 && !isEmpty(msgstr[0])
                    ? {
                          ...map,
                          [msgctxt || reference]: {
                              defaultMessage: msgstr[0],
                          },
                      }
                    : map,
            {},
        );
    }
}

module.exports = POFile;
