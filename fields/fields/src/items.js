import { ComponentsCollection } from '@panneau/core';
import Text, { TextLocale, Textarea, Editor, Email, Password } from '@panneau/field-text';
import Code from '@panneau/field-code';
import Select from '@panneau/field-select';
import Color from '@panneau/field-color';
import Date from '@panneau/field-date';
import Slider from '@panneau/field-slider';
import Toggle from '@panneau/field-toggle';
import Items from '@panneau/field-items';
import Item from '@panneau/field-item';
import Autosuggest from '@panneau/field-autosuggest';
import Blocks from '@panneau/field-blocks';
import Link, { Links, LinkLocale, LinksLocale } from '@panneau/field-links';
import Url, { UrlLocale } from '@panneau/field-url';
import Media, {
    Audio,
    Audios,
    Document,
    Documents,
    Picture,
    Pictures,
    Video,
    Videos,
} from '@panneau/field-media';

const fieldsCollection = new ComponentsCollection({
    Text,
    Textarea,
    Editor,
    Email,
    Password,
    TextLocale,
    Code,
    Select,
    Color,
    Date,
    Slider,
    Toggle,
    Items,
    Media,
    Audio,
    Audios,
    Document,
    Documents,
    Picture,
    Pictures,
    Video,
    Videos,
    Item,
    Autosuggest,
    Blocks,
    Link,
    Links,
    LinkLocale,
    LinksLocale,
    Url,
    UrlLocale,
});

export default fieldsCollection;
