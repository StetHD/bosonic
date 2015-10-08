var GESTURE_FLAG = '__bosonicGestures';

var TRACK_DISTANCE = 10;

var GESTURES = {
    tap: {
        condition: function(state, event) {
            return event.type === 'pointerup' &&
                Math.abs(state.startX - event.clientX) < TRACK_DISTANCE &&
                Math.abs(state.startY - event.clientY) < TRACK_DISTANCE;
        }
    },

    hold: {
        setup: function(state) {
            var that = this;
            state.__timer = setTimeout(function() {
                that.fireCustomEvent('hold', state);
                that._removeDocumentListeners(state);
            }, 1000);
        },
        condition: function(state, event) {
            if (Math.abs(state.startX - event.clientX) >= TRACK_DISTANCE
                || Math.abs(state.startY - event.clientY) >= TRACK_DISTANCE) {
                clearTimeout(state.__timer);
            }
        },
        teardown: function(state) {
            clearTimeout(state.__timer);
        }
    },

    track: {
        condition: function(state, event) {
            var hasMovedEnough = Math.abs(state.startX - event.clientX) >= TRACK_DISTANCE
                              || Math.abs(state.startY - event.clientY) >= TRACK_DISTANCE;
            if (!hasMovedEnough) return;
            
            if (event.type === 'pointermove') {
                var x = event.clientX,
                    y = event.clientY;
                state.dx = x - state.startX;
                state.dy = y - state.startY;
                state.ddx = state.lastX ? x - state.lastX : 0;
                state.ddy = state.lastY ? y - state.lastY : 0;
                state.lastX = x;
                state.lastY = y;
                this.fireCustomEvent('track', state, event);
            } else if (event.type === 'pointerup') return true;
        }
    }
};

function isGestureEvent(eventName) {
    return GESTURES.hasOwnProperty(eventName);
}

Bosonic.Gestures = {
    __documentEventsHandler: null,
    __pointerdownHandler: null,

    // override Bosonic.Events listen()
    listen: function(node, eventName, methodName) {
        if (isGestureEvent(eventName)) {
            this._listenToGesture(node, eventName, methodName);
        } else {
            node.addEventListener(eventName, this._registerHandler(eventName, methodName));
        }
    },

    // override Bosonic.Events unlisten()
    unlisten: function(node, eventName, methodName) {
        if (isGestureEvent(eventName) && node[GESTURE_FLAG] === true && this.__pointerdownHandler) {
            node.removeEventListener('pointerdown', this.__pointerdownHandler);
            delete node[GESTURE_FLAG];
        }
        node.removeEventListener(eventName, this._getHandler(eventName, methodName));
    },

    fireCustomEvent: function(gesture, state, originalEvent) {
        if (originalEvent) {
            state.originalEvent = originalEvent;
        }
        var ev = this.fire(gesture, state, {
            bubbles: true,
            cancelable: true,
            node: state.target
        });
        // preventDefault() forwarding
        if (ev.defaultPrevented) {
            if (originalEvent && originalEvent.preventDefault) {
                originalEvent.preventDefault();
                originalEvent.stopImmediatePropagation();
            }
        }
    },

    _listenToGesture: function(node, eventName, methodName) {
        if (node[GESTURE_FLAG] === undefined) {
            if (!this.__pointerdownHandler) {
                this.__pointerdownHandler = this._handlePointerdown.bind(this);
            }
            node.addEventListener('pointerdown', this.__pointerdownHandler);
            node[GESTURE_FLAG] = true;
        }

        node.addEventListener(eventName, this._registerHandler(eventName, methodName));
    },

    _handlePointerdown: function(event) {
        var state = {
            target: event.target,
            startX: event.clientX,
            startY: event.clientY
        };

        Object.keys(GESTURES).forEach(function(gesture) {
            var setup = GESTURES[gesture].setup;
            if (setup) {
                setup.call(this, state);
            }
        }, this);
        
        this._addDocumentListeners(state);
    },

    _handleDocumentEvent: function(state, event) {
        for (var gesture in GESTURES) {
            var condition = GESTURES[gesture].condition;
            if (condition && condition.call(this, state, event) === true) {
                this.fireCustomEvent(gesture, state, event);
                this._removeDocumentListeners(state);
                break;
            }
        }
    },

    _addDocumentListeners: function(state) {
        this.__documentEventsHandler = this._handleDocumentEvent.bind(this, state);
        document.addEventListener('pointermove', this.__documentEventsHandler);
        document.addEventListener('pointerup', this.__documentEventsHandler);
    },

    _removeDocumentListeners: function(state) {
        Object.keys(GESTURES).forEach(function(gesture) {
            var teardown = GESTURES[gesture].teardown;
            if (teardown) {
                teardown.call(this, state);
            }
        }, this);
        document.removeEventListener('pointermove', this.__documentEventsHandler);
        document.removeEventListener('pointerup', this.__documentEventsHandler);
    }
};