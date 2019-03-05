import { ComponentsCollection } from '@panneau/core';
import Value from './ValueColumn';
import Image from './ImageColumn';
import Buttons from './ButtonsColumn';
import Actions from './ActionsColumn';

const collection = new ComponentsCollection({
    Value,
    Image,
    Buttons,
    Actions,
});

export default collection;
