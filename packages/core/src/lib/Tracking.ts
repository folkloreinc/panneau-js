/* eslint-disable no-console */
import { Tracking as BaseTracking } from '@folklore/tracking';

interface TrackingOptions {
    variables?: Record<string, unknown> | null;
    [key: string]: unknown;
}

interface Screen {
    id?: string | null;
    type?: string | null;
    [key: string]: unknown;
}

interface Media {
    id?: string | null;
    name?: string | null;
    duration?: number | null;
    currentTime?: number | null;
    [key: string]: unknown;
}

interface TrackingEventOptions {
    value?: number | null;
    [key: string]: unknown;
}

class Tracking extends BaseTracking {
    variables: Record<string, unknown> | null;

    constructor(opts: TrackingOptions = {}) {
        super(opts);
        const { variables = null } = this.options;
        this.variables = null;
        if (variables !== null) {
            this.setVariables(variables);
        }
    }

    setVariables(variables: Record<string, unknown> | null): void {
        this.variables = variables;
        if (variables !== null) {
            this.push(variables);
        }
    }

    getVariables(): Record<string, unknown> | null {
        return this.variables;
    }

    trackScreenView(screen: Screen | null, screenIndex: number): void {
        const { id: screenId = null, type: screenType = null } = screen || {};
        const data = {
            event: 'screenView',
            screenId,
            screenType,
            screenIndex,
        };
        this.push(data);
    }

    trackEvent(
        category: string,
        action: string,
        label: string,
        { value = null, ...opts }: TrackingEventOptions = {},
    ): void {
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

    trackMedia(
        type: string,
        media: Media | null,
        action: string,
        { value = null, ...opts }: TrackingEventOptions = {},
    ): void {
        const {
            id: mediaId = null,
            name = null,
            duration = null,
            currentTime = null,
        } = media || {};
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
                    ? Math.round((currentTime / duration) * 100)
                    : null,
        };
        this.push(data);
    }
}

export default Tracking;
