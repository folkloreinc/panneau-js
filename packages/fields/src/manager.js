import { FieldsManager } from '@micromag/core';

import allManager from './all';

const manager = new FieldsManager();
manager.merge(allManager);

export default manager;
