import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import uniq from 'lodash-es/uniq';

interface Manager {
    getDefinition: (type: string) => Record<string, unknown> | null;
}

interface FontsParserOptions {
    fieldsManager: Manager;
    screensManager: Manager;
}

interface Font {
    name?: string;
    type?: string;
    [key: string]: unknown;
}

interface Field {
    id?: string | null;
    name?: string | null;
    type?: string | null;
    fields?: Field[];
    itemsField?: Field | null;
    settings?: Field[];
    [key: string]: unknown;
}

interface Screen {
    type: string;
    [key: string]: unknown;
}

interface Story {
    theme?: Story | null;
    components?: Screen[];
    fonts?: Font[];
    [key: string]: unknown;
}

class FontsParser {
    fieldsManager: Manager;
    screensManager: Manager;

    constructor({ fieldsManager, screensManager }: FontsParserOptions) {
        this.fieldsManager = fieldsManager;
        this.screensManager = screensManager;
    }

    // Extract fonts
    parse(story: Story | null): Story | null {
        if (story === null) {
            return story;
        }

        // Extract fonts from screen
        const { theme = null, components = [] } = story || {};
        const fonts = uniq(
            components.reduce((currentFonts: Font[], screen: Screen) => {
                const { type } = screen;
                const { fields = [] } = this.screensManager.getDefinition(type) || {};
                const fieldsPattern = this.getFieldsPattern(fields as Field[]);
                const newFonts = FontsParser.extractFontsWithPaths(screen, fieldsPattern);
                return newFonts.length > 0 ? [...currentFonts, ...newFonts] : currentFonts;
            }, []),
            'name',
        );

        // Extract fonts from theme
        if (theme !== null) {
            const { fonts: themeFonts = [], ...newTheme } = this.parse(theme) as Story;
            return fonts.length > 0 || themeFonts.length > 0
                ? {
                      ...story,
                      theme: newTheme,
                      fonts: uniq([...themeFonts, ...fonts], 'name'),
                  }
                : story;
        }

        return fonts.length > 0
            ? {
                  ...story,
                  fonts,
              }
            : story;
    }

    getFieldsPattern(fields: Field[], namePrefix: string | null = null): RegExp[] {
        return fields.reduce((patterns: RegExp[], field: Field) => {
            const { name = null, type = null } = field;
            const path = [namePrefix, name].filter((it) => it !== null).join('\\.');
            const fieldDefinition = {
                ...(type !== null ? this.fieldsManager.getDefinition(type) : null),
                ...field,
            } as Field;

            // also check settings fields
            const { fields: subFields = [], itemsField = null, settings = [] } = fieldDefinition;

            return [
                ...patterns,
                ...(FontsParser.fieldIsFontFamily(fieldDefinition)
                    ? [new RegExp(`^${path}$`)]
                    : []),
                ...this.getFieldsPattern(subFields, path),
                ...this.getFieldsPattern(settings, path),
                ...(itemsField !== null
                    ? this.getFieldsPattern([itemsField], `${path}\\.[0-9]+`)
                    : []),
            ];
        }, []);
    }

    static fieldIsFontFamily({ id = null }: Field): boolean {
        return id === 'font-family';
    }

    static valueIsFont({ type = null }: Record<string, unknown>): boolean {
        return type === 'custom' || type === 'google';
    }

    static extractFontsWithPaths(
        data: unknown,
        patterns: RegExp[],
        keyPrefix: string | null = null,
    ): Font[] {
        const dataIsArray = isArray(data);
        const keys = dataIsArray ? [...(data as unknown[]).keys()] : Object.keys(data as object);
        return keys.reduce((currentFonts: Font[], key: number | string) => {
            const path = [keyPrefix, key].filter((it) => it !== null).join('.');
            const patternMatch = patterns.reduce(
                (found, pattern) => found || pattern.test(path),
                false,
            );
            const value = (data as Record<string, unknown>)[key];
            let font: Font | null = null;
            let subFonts: Font[] | null = null;
            if (patternMatch && isObject(value) && FontsParser.valueIsFont(value)) {
                font = value as Font;
            } else if (isObject(value) || isArray(value)) {
                subFonts = FontsParser.extractFontsWithPaths(value, patterns, path);
            }
            return subFonts !== null || font !== null
                ? [...currentFonts, ...(subFonts || []), ...(font !== null ? [font] : [])]
                : currentFonts;
        }, []);
    }
}

export default FontsParser;
