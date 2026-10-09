import eventsResource from './events';
import jobListingsResource from './job-listings';
import mediasResource from './medias';
import pagesResource from './pages';
import personsResource from './persons';

export { eventsResource, jobListingsResource, mediasResource, pagesResource, personsResource };

export default [
    pagesResource,
    eventsResource,
    personsResource,
    jobListingsResource,
    mediasResource,
];
