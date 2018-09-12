import { ComponentsCollection } from '@panneau/core';
import Text, {
    TextLocale, Textarea, Editor, Email, Password,
} from '@panneau/field-text';
import Code from '@panneau/field-code';
import Select from '@panneau/field-select';
import Color from '@panneau/field-color';
import Date, { DateRange } from '@panneau/field-date';
import Slider from '@panneau/field-slider';
import Toggle from '@panneau/field-toggle';
import Items from '@panneau/field-items';
import Item from '@panneau/field-item';
import Page from '@panneau/field-page';
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
    Audio,
    Audios,
    Autosuggest,
    Blocks,
    Code,
    Color,
    Date,
    DateRange,
    Document,
    Documents,
    Editor,
    Email,
    Item,
    Items,
    Link,
    Links,
    LinkLocale,
    LinksLocale,
    Media,
    Page,
    Password,
    Picture,
    Pictures,
    Select,
    Slider,
    Text,
    Textarea,
    TextLocale,
    Toggle,
    Url,
    UrlLocale,
    Video,
    Videos,
});

export default fieldsCollection;
