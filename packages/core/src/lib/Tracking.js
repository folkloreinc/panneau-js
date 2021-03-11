/* eslint-disable no-console */
import { Tracking as BaseTracking } from '@folklore/tracking';

class Tracking extends BaseTracking {
    constructor(opts = {}) {
        super(opts);
        const { variables = null } = this.options;
        this.variables = null;
        if (variables !== null) {
            this.setVariables(variables);
        }
    }

    setVariables(variables) {
        this.variables = variables;
        if (variables !== null) {
            this.push(variables);
        }
    }

    getVariables() {
        return this.variables;
    }

    trackScreenView(screen, screenIndex) {
        const { id: screenId = null, type: screenType = null } = screen || {};
        const data = {
            event: 'screenView',
            screenId,
            screenType,
            screenIndex,
        };
        this.push(data);
    }

    trackEvent(category, action, label, { value = null, ...opts } = {}) {
        const data = {
            ...opts,
            event: 'eventInteraction',
            eventCategory: category,
            eventAction: action,
            eventLabel: label,
            eventValue: value,
        };
        this.push(data);
    }

    trackMedia(type, media, action, { value = null, ...opts } = {}) {
        const { id: mediaId = null, name = null, duration = null, currentTime = null } = media || {};
        const label = name;
        const data = {
            ...opts,
            event: 'eventInteraction',
            eventCategory: type,
            eventAction: action,
            eventLabel: label,
            eventValue: value,
            mediaId,
            mediaCurrentTime: currentTime !== null ? Math.round(currentTime) : null,
            mediaProgress:
                currentTime !== null && duration !== null && duration > 0
                    ? Math.round(currentTime / duration * 100)
                    : null,
        };
        this.push(data);
    }
}

export default Tracking;
