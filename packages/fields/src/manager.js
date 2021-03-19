import { FieldsManager } from '@panneau/core';

import allManager from './all';

const manager = new FieldsManager();
manager.merge(allManager);

export default manager;
