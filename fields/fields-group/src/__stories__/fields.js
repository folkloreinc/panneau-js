import { ComponentsCollection } from '@panneau/core';

import Text, { TextLocale } from '../../../text/src/index';
import Code from '../../../code/src/index';
import Select from '../../../select/src/index';
import Color from '../../../color/src/index';
import Date from '../../../date/src/index';
import Slider from '../../../slider/src/index';
import Toggle from '../../../toggle/src/index';

const fieldsCollection = new ComponentsCollection({
    Text,
    TextLocale,
    Code,
    Select,
    Color,
    Date,
    Slider,
    Toggle,
});

export default fieldsCollection;
