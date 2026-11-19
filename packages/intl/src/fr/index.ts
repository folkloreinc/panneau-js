import type { MessageCatalog } from '../message';
import { actionsFr } from './actions';
import { appFr } from './app';
import { editorFr } from './editor';
import { fieldsFr } from './fields';
import { formsFr } from './forms';
import { listsFr } from './lists';
import { mediaFr } from './media';
import { uiFr } from './ui';

/** The French messages of every Panneau package, by id. */
export const fr: MessageCatalog = {
    ...uiFr,
    ...fieldsFr,
    ...formsFr,
    ...listsFr,
    ...actionsFr,
    ...appFr,
    ...mediaFr,
    ...editorFr,
};
