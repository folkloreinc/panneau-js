import slugify from 'slugify';
import snakeCase from './snakeCase';
import dashCase from './dashCase';

const slug = (str, separator = null) => {
    let toSlug;
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
