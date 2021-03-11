import { EventsManager } from '../lib';
import { createUseEvent } from '../utils';

const eventsManager = typeof document !== 'undefined' ? new EventsManager(document) : null;
const useDocumentEvent = createUseEvent(eventsManager);

export default useDocumentEvent;
