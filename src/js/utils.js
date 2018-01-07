

export const utils = {

    // Events are different on various devices. We det the correct events, based on userAgent.
    getStartEvents: () => {
        let startEvents = ['click'];

        // For mobile users the start event will be one of
        // touchstart, touchend and touchmove.
        if (navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/Android/i)) {
            startEvents = ['touchstart', 'touchend', 'touchmove'];
        }
        return startEvents;
    },

    // Merge defaults and options.
    mergeConfig: (defaults, options) => {
        return {...defaults, ...options};
    }
};