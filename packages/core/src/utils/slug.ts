import slugify from 'slugify';
import snakeCase from './snakeCase';
import dashCase from './dashCase';

const slug = (str: string, separator: string | null = null): string => {
    let toSlug: string;
    if (separator === '-') {
        toSlug = dashCase(str);
    } else {
        toSlug = snakeCase(str);
    }
    return slugify(toSlug, {
        lower: true,
    });
};

export default slug;
