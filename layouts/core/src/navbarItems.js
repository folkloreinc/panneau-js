import { ComponentsCollection } from '@panneau/core';
import Item from './NavbarItem';
import Divider from './NavbarDivider';
import User from './NavbarUser';
import Resource from './NavbarResource';

const collection = new ComponentsCollection({
    Item,
    Divider,
    User,
    Resource,
});

export default collection;
