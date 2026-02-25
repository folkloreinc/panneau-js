import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

interface Manager {
    getDefinition: (type: string) => Record<string, unknown> | null;
}

interface MediasParserOptions {
    fieldsManager: Manager;
    screensManager: Manager;
}

interface Media {
    id?: string | null;
    [key: string]: unknown;
}

interface Field {
    id?: string | null;
    name?: string | null;
    type?: string | null;
    media?: boolean;
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
    medias?: Record<string, Media> | null;
    [key: string]: unknown;
}

class MediasParser {
    fieldsManager: Manager;
    screensManager: Manager;

    constructor({ fieldsManager, screensManager }: MediasParserOptions) {
        this.fieldsManager = fieldsManager;
        this.screensManager = screensManager;
    }

    // Convert medias object to path
    toPath(story: Story | null): Story | null {
        if (story === null) {
            return story;
        }
        const { theme = null, components = [] } = story || {};
        const { components: newComponents, medias } = components.reduce(
            (
                {
                    components: previousComponents,
                    medias: currentMedias,
                }: { components: Screen[]; medias: Record<string, Media> | null },
                screen: Screen,
            ) => {
                const { type } = screen;
                const { fields = [] } = this.screensManager.getDefinition(type) || {};
                const fieldsPattern = this.getMediaFieldsPattern(fields as Field[]);
                const { data: newScreen, medias: newMedias } = MediasParser.replaceMediasWithPaths(
                    screen,
                    fieldsPattern,
                );
                return {
                    components: [...previousComponents, newScreen as Screen],
                    medias: {
                        ...currentMedias,
                        ...newMedias,
                    },
                };
            },
            { components: [], medias: null },
        );

        if (theme !== null) {
            const { medias: themeMedias, ...newTheme } = this.toPath(theme) as Story;
            return medias !== null || themeMedias !== null
                ? {
                      ...story,
                      theme: newTheme,
                      components: newComponents,
                      medias: {
                          ...themeMedias,
                          ...medias,
                      },
                  }
                : story;
        }

        return medias !== null
            ? {
                  ...story,
                  components: newComponents,
                  medias,
              }
            : story;
    }

    // Convert path to medias object
    fromPath(
        story: Story | null,
        defaultMedias: Record<string, Media> | null = null,
    ): Story | null {
        if (story === null) {
            return story;
        }

        const { theme = null, components = [], medias = defaultMedias } = story || {};
        if (medias === null && theme === null) {
            return story;
        }

        // Replace path with medias objects
        const newComponents =
            medias !== null
                ? components.map((screen: Screen) => {
                      const { type } = screen;
                      const { fields = [] } = this.screensManager.getDefinition(type) || {};
                      const fieldsPattern = this.getMediaFieldsPattern(fields as Field[]);
                      return MediasParser.replacePathsWithMedias(screen, medias, fieldsPattern);
                  })
                : components;

        // Replace path with medias object in theme
        if (theme !== null) {
            const newTheme = this.fromPath(theme, medias);
            return newTheme !== theme || newComponents !== components
                ? {
                      ...story,
                      theme: newTheme,
                      components: newComponents,
                  }
                : story;
        }

        return newComponents !== components
            ? {
                  ...story,
                  components: newComponents,
              }
            : story;
    }

    getMediaFieldsPattern(fields: Field[], namePrefix: string | null = null): RegExp[] {
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
                ...(MediasParser.fieldIsMedia(fieldDefinition) ? [new RegExp(`^${path}$`)] : []),
                ...(MediasParser.fieldIsFontFamily(fieldDefinition)
                    ? [new RegExp(`^${path}\\.media$`)]
                    : []),
                ...this.getMediaFieldsPattern(subFields, path),
                ...this.getMediaFieldsPattern(settings, path),
                ...(itemsField !== null
                    ? this.getMediaFieldsPattern([itemsField], `${path}\\.[0-9]+`)
                    : []),
            ];
        }, []);
    }

    static fieldIsMedia({ media = false }: Field): boolean {
        return media;
    }

    static fieldIsFontFamily({ id = null }: Field): boolean {
        return id === 'font-family';
    }

    static replacePathsWithMedias(
        data: unknown,
        medias: Record<string, Media>,
        patterns: RegExp[],
        keyPrefix: string | null = null,
    ): unknown {
        const dataIsArray = isArray(data);
        const keys = dataIsArray ? [...(data as unknown[]).keys()] : Object.keys(data as object);
        return keys.reduce(
            (newData: unknown, key: number | string) => {
                const path = [keyPrefix, key].filter((it) => it !== null).join('.');
                const patternMatch = patterns.reduce(
                    (found, pattern) => found || pattern.test(path),
                    false,
                );
                const value = (data as Record<string, unknown>)[key];
                let newValue: unknown;
                if (patternMatch) {
                    newValue = isObject(value) ? value : medias[value as string] || null;
                } else {
                    newValue =
                        isObject(value) || isArray(value)
                            ? MediasParser.replacePathsWithMedias(value, medias, patterns, path)
                            : value;
                }
                return dataIsArray
                    ? [...(newData as unknown[]), newValue]
                    : {
                          ...(newData as object),
                          [key]: newValue,
                      };
            },
            dataIsArray ? [] : {},
        );
    }

    static getMediaPath({ id = null }: Media): string | null {
        return id !== null ? `media://${id}` : null;
    }

    static replaceMediasWithPaths(
        data: unknown,
        patterns: RegExp[],
        medias: Record<string, Media> | null = null,
        keyPrefix: string | null = null,
    ): { data: unknown; medias: Record<string, Media> | null } {
        const dataIsArray = isArray(data);
        const keys = dataIsArray ? [...(data as unknown[]).keys()] : Object.keys(data as object);
        return keys.reduce(
            (
                {
                    data: currentData,
                    medias: currentMedias,
                }: { data: unknown; medias: Record<string, Media> | null },
                key: number | string,
            ) => {
                const path = [keyPrefix, key].filter((it) => it !== null).join('.');
                const patternMatch = patterns.reduce(
                    (found, pattern) => found || pattern.test(path),
                    false,
                );
                const value = (data as Record<string, unknown>)[key];
                let newValue: unknown;
                let media: Media | null = null;
                let subMedias: Record<string, Media> | null = null;
                if (patternMatch && isObject(value)) {
                    const mediaPath = MediasParser.getMediaPath(value as Media);
                    newValue = mediaPath !== null ? mediaPath : value;
                    media = mediaPath !== null ? (value as Media) : null;
                } else if (isObject(value) || isArray(value)) {
                    const subReturn = MediasParser.replaceMediasWithPaths(
                        value,
                        patterns,
                        medias,
                        path,
                    );
                    newValue = subReturn.data;
                    subMedias = subReturn.medias;
                } else {
                    newValue = value;
                }
                return {
                    data: dataIsArray
                        ? [...((currentData as unknown[]) || []), newValue]
                        : {
                              ...(currentData as object),
                              [key]: newValue,
                          },
                    medias:
                        media !== null
                            ? {
                                  ...currentMedias,
                                  ...subMedias,
                                  [newValue as string]: media,
                              }
                            : {
                                  ...currentMedias,
                                  ...subMedias,
                              },
                };
            },
            {
                data: null,
                medias,
            },
        );
    }
}

export default MediasParser;
