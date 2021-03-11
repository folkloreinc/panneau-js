import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';

class MediasParser {
    constructor({ fieldsManager, screensManager }) {
        this.fieldsManager = fieldsManager;
        this.screensManager = screensManager;
    }

    // Convert medias object to path
    toPath(story) {
        if (story === null) {
            return story;
        }
        const { theme = null, components = [] } = story || {};
        const { components: newComponents, medias } = components.reduce(
            ({ components: previousComponents, medias: currentMedias }, screen) => {
                const { type } = screen;
                const { fields = [] } = this.screensManager.getDefinition(type) || {};
                const fieldsPattern = this.getMediaFieldsPattern(fields);
                const { data: newScreen, medias: newMedias } = MediasParser.replaceMediasWithPaths(
                    screen,
                    fieldsPattern,
                );
                return {
                    components: [...previousComponents, newScreen],
                    medias: {
                        ...currentMedias,
                        ...newMedias,
                    },
                };
            },
            { components: [], medias: null },
        );

        if (theme !== null) {
            const { medias: themeMedias, ...newTheme } = this.toPath(theme);
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
    fromPath(story, defaultMedias = null) {
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
                ? components.map((screen) => {
                      const { type } = screen;
                      const { fields = [] } = this.screensManager.getDefinition(type) || {};
                      const fieldsPattern = this.getMediaFieldsPattern(fields);
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

    getMediaFieldsPattern(fields, namePrefix = null) {
        return fields.reduce((patterns, field) => {
            const { name = null, type = null } = field;
            const path = [namePrefix, name].filter((it) => it !== null).join('\\.');
            const fieldDefinition = {
                ...(type !== null ? this.fieldsManager.getDefinition(type) : null),
                ...field,
            };

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

    static fieldIsMedia({ media = false }) {
        return media;
    }

    static fieldIsFontFamily({ id = null }) {
        return id === 'font-family';
    }

    static replacePathsWithMedias(data, medias, patterns, keyPrefix = null) {
        const dataIsArray = isArray(data);
        const keys = dataIsArray ? [...data.keys()] : Object.keys(data);
        return keys.reduce(
            (newData, key) => {
                const path = [keyPrefix, key].filter((it) => it !== null).join('.');
                const patternMatch = patterns.reduce(
                    (found, pattern) => found || pattern.test(path),
                    false,
                );
                const value = data[key];
                let newValue;
                if (patternMatch) {
                    newValue = isObject(value) ? value : medias[value] || null;
                } else {
                    newValue =
                        isObject(value) || isArray(value)
                            ? MediasParser.replacePathsWithMedias(value, medias, patterns, path)
                            : value;
                }
                return dataIsArray
                    ? [...newData, newValue]
                    : {
                          ...newData,
                          [key]: newValue,
                      };
            },
            dataIsArray ? [] : {},
        );
    }

    static getMediaPath({ id = null }) {
        return id !== null ? `media://${id}` : null;
    }

    static replaceMediasWithPaths(data, patterns, medias = null, keyPrefix = null) {
        const dataIsArray = isArray(data);
        const keys = dataIsArray ? [...data.keys()] : Object.keys(data);
        return keys.reduce(
            ({ data: currentData, medias: currentMedias }, key) => {
                const path = [keyPrefix, key].filter((it) => it !== null).join('.');
                const patternMatch = patterns.reduce(
                    (found, pattern) => found || pattern.test(path),
                    false,
                );
                const value = data[key];
                let newValue;
                let media = null;
                let subMedias = null;
                if (patternMatch && isObject(value)) {
                    const mediaPath = MediasParser.getMediaPath(value);
                    newValue = mediaPath !== null ? mediaPath : value;
                    media = mediaPath !== null ? value : null;
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
                        ? [...(currentData || []), newValue]
                        : {
                              ...currentData,
                              [key]: newValue,
                          },
                    medias:
                        media !== null
                            ? {
                                  ...currentMedias,
                                  ...subMedias,
                                  [newValue]: media,
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
